# TypeScript coding and operations

Scope: [TypeScript profile](index.md), including its TypeScript portions in hybrid and Tauri products. Keep the established architecture, `Types/` ownership, service/handler naming, and grouped hook returns. This reference defines operation choices, not new layers or a scaffolding template. Formatting and automatic checks remain in [tooling](tooling.md); React lifecycle rules live in [frontend](frontend.md#state-effects-and-rendering).

Use the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) for language semantics. The [Google TS/JS guide](https://google.github.io/styleguide/tsguide.html) and rule documentation can inform individual decisions; do not import their environment-specific conventions or replace this profile's formatting, architecture, or toolchain.

## Promises and ownership of failures

Every asynchronous operation needs a deliberate completion/error owner. Await it, return its promise to a caller that handles it, or attach an intentional terminal error handler. `void` only marks a discarded result; it does not catch a rejection. A terminal reporter must itself handle its failures rather than create another unobserved rejection. See [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/).

| Situation | Prefer | Reason |
| --- | --- | --- |
| Need the result/completion here | `await operation()` | Keep sequencing and failure propagation explicit |
| Delegate completion to the caller | `return operation()` | No unconditional requirement for `await` |
| Deliberately detached work | `void operation().catch(reportError)` | Use a suitable non-throwing terminal reporter; completion-critical server/CLI work must still be awaited or durably scheduled |
| Promise used in a condition | `if (await hasPermission())` | A promise object is truthy regardless of its eventual Boolean result |
| Process dependent items in order | `for...of` with `await` | The next operation starts after the previous one completes |
| Process independent items together | `await Promise.all(items.map(processItem))` | Return/await the aggregate, not just the array |

Do not use `forEach(async ...)` when callers must await the work. `await items.map(async ...)` also does not await the promises inside the array. Do not pass promise-returning callbacks to APIs expecting synchronous predicates/results. For UI event callbacks, define whether the hook handles the failure or its caller does; avoid duplicate notifications. See [no-misused-promises](https://typescript-eslint.io/rules/no-misused-promises/).

### Choose concurrency from dependencies and limits

Start independent operations together when latency matters and the resource budget permits it. Keep dependent writes ordered and use the existing transaction policy where required. A large input is not permission to create an unbounded number of requests; choose a justified concurrency limit and reuse the existing worker/queue mechanism when available.

`Promise.all` fails the aggregate on the first rejection; it does not cancel already running operations or roll back side effects. Use `Promise.allSettled` when the contract needs every result or permits partial success, then inspect failures explicitly. Neither is a universal default.

```ts
export async function parseNumbersTogether(
    values: readonly string[],
    parseNumber: (value: string) => Promise<number>,
): Promise<number[]> {
    return Promise.all(values.map(value => parseNumber(value)))
}

export async function parseNumbersInOrder(
    values: readonly string[],
    parseNumber: (value: string) => Promise<number>,
): Promise<number[]> {
    const numbers: number[] = []

    for (const value of values) {
        numbers.push(await parseNumber(value))
    }

    return numbers
}
```

These alternatives demonstrate different sequencing contracts, not mandatory abstractions. For partial results, for example:

```ts
const results = await Promise.allSettled(ids.map(loadItem))

for (const result of results) {
    if (result.status === 'fulfilled') {
        acceptItem(result.value)
    } else {
        reportFailure(result.reason)
    }
}
```

`reportFailure` owns reporting/recovery here and must not silently convert failure into success. See [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) and [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

### Awaiting, wrapping, and cleanup

Do not construct `new Promise(async (...) => ...)`; an async executor's rejection can escape the outer promise. Use a normal async function. Do not wrap an existing promise merely to forward its resolve/reject; a new promise is appropriate when adapting a genuine callback API. See [no-async-promise-executor](https://eslint.org/docs/latest/rules/no-async-promise-executor).

Use `return await` when local `catch` or `finally` must observe completion. Do not ban it as an assumed performance optimization. Outside that requirement, return a promise directly when clear. This example shows a UI-free helper; real backend functions retain the profile's `...Service` naming:

```ts
export async function runWithContext<T>(
    operation: () => Promise<T>,
    context: string,
): Promise<T> {
    try {
        return await operation()
    } catch (error: unknown) {
        throw new Error(context, { cause: error })
    }
}
```

Use `finally` for owned resource cleanup or resetting a pending flag. Avoid returns or unrelated throws in `finally` that replace the original result/error. Cleanup failures need an explicit policy too. Do not swallow an operational error with `catch { return [] }` unless empty fallback data is an intentional, observable contract. See [return-await](https://typescript-eslint.io/rules/return-await/).

## Types describe real contracts

Public hook results, service boundaries, and reusable APIs need clear contracts; infer obvious local values. Keep types in the existing owner's `Types/` files and use `import type`. Do not annotate every trivial variable or invent a wrapper type for every expression.

- Treat unknown external values as `unknown` and narrow or validate them. Reuse the schema boundary in [backend and safety](backend-and-safety.md#feature-boundary-and-backend-ownership); a cast, `satisfies`, or generic type argument is not runtime validation.
- Avoid `any`, double assertions such as `as unknown as User`, and non-null assertions as routine fixes. A narrow interop exception needs an actual reason. Prefer guards or a corrected producer contract; `value!` adds no runtime check.
- Use primitive `string`, `number`, and `boolean`, not their boxed `String`/`Number`/`Boolean` types. Do not use `{}` to mean an arbitrary object or record.
- Use discriminated unions for mutually exclusive states, and narrowing rather than casts to access variant data. Keep plain independent flags when combinations are valid; do not force every state into a union.
- For a closed set of variants, handle all relevant cases and use `never` where useful to expose missing cases. A real forward-compatible external fallback remains valid.
- Use `satisfies` to check an authored object's contract while retaining its useful inferred shape. Use a type annotation when the variable should intentionally have the broader contract. `as const` preserves literal types but does not freeze runtime objects.
- Use generics for a real relationship, such as input-to-output types. Do not expose `load<T>()` as a way to assert arbitrary unvalidated data.
- Accept `readonly T[]`/readonly properties for read-only contracts when useful. This is a compile-time access restriction, not deep runtime immutability; do not force deep-readonly types everywhere.
- Handle possibly absent array/dictionary entries instead of assuming `items[0]` or `itemsById[id]` exists. Distinguish a missing field, `undefined`, and `null` according to the API, especially patch/update semantics.

For example, in the owner's `Types/` file:

```ts
export type SaveState =
    | { status: 'idle' }
    | { status: 'pending' }
    | { status: 'success'; savedId: string }
    | { status: 'error'; error: Error }

export type SaveOptions = {
    mode: 'replace' | 'merge'
    retryCount: number
}
```

After importing those types, an owning implementation can retain a narrow literal and exhaustively handle states:

```ts
const options = {
    mode: 'replace',
    retryCount: 2,
} satisfies SaveOptions

function getSavedId(state: SaveState): string | undefined {
    switch (state.status) {
        case 'success':
            return state.savedId
        case 'idle':
        case 'pending':
        case 'error':
            return undefined
        default: {
            const unreachable: never = state
            throw new Error('Unexpected save state', { cause: unreachable })
        }
    }
}
```

The state can be exposed as `state.save` within a logic result; it does not replace the grouped hook contract. See [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html), and [function generics](https://www.typescriptlang.org/docs/handbook/2/functions.html).

## Expressions and collection operations

Prefer `const`; use `let` when reassignment is needed. `const` does not make an object immutable. Use early returns and name substantial domain conditions rather than nesting ternaries or hiding workflows in expressions. Prefer strict equality; any deliberate coercion needs a clear contract.

Use `??` when only `null`/`undefined` should trigger a default, for example `limit ?? 20` preserves zero. Use `||` when replacing all falsy values is actually intended. Use optional chaining for allowed absence, not to conceal a required broken contract. Test presence explicitly when `0`, `false`, or `''` is a valid value.

| Intent | Prefer | Avoid unnecessary work |
| --- | --- | --- |
| Any / all elements satisfy a predicate | `some` / `every` | Do not build a filtered array merely to check its length |
| First matching element | `find` | Handle the possibly missing result |
| All matching elements | `filter` | Keep omission intentional |
| Transform elements | `map` | Do not use it only for side effects |
| Concrete value membership | `includes` | A `Set` can help repeated membership lookups when its construction is justified |
| Transform and flatten | `flatMap` | Use only when flattening is part of the operation |
| Branching workflow or early exit | `for...of` | No blanket ban on loops or requirement for complex `reduce` chains |

Use `Object.keys`/`values`/`entries` for own enumerable object entries where appropriate; `for...in` also visits inherited enumerable properties. Do not cast arbitrary strings to trusted object keys without a sound reason. Choose `Map` for a real keyed lookup contract rather than repeatedly scanning a large array.

Do not incidentally mutate caller-owned arrays, React state, or query-cache data with `sort`, `reverse`, `splice`, or nested property assignments. An explicitly mutating non-React API can have a valid in-place contract. `toSorted()` returns a new array when the runtime target supports it; `[...items].sort(compare)` is a compatible alternative. Both are shallow copies. Local mutation of freshly owned data is valid, and copying everything is not a goal.

```ts
export function sortedNumbers(values: readonly number[]): number[] {
    return [...values].sort((left, right) => left - right)
}

export function firstNonnegative(values: readonly number[]): number | undefined {
    return values.find(value => value >= 0)
}

export function resolveLimit(value: number | null | undefined): number {
    return value ?? 20
}
```

These examples preserve the caller's data and valid zero values. See [Array operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) and [nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing).

## Error values and HTTP results

Throw `Error` objects for your own failures, retain useful causes when adding context, and treat caught values as `unknown`: third-party code may throw non-Errors. Narrow with `instanceof Error` or use the project's error normalizer; do not assume every rejection has a `.message`. Keep internal diagnostics separate from translated, safe UI messages and apply the existing secret/logging restrictions.

For direct `fetch` calls, check the response contract before accepting data. HTTP error statuses do not automatically reject the promise. Validate untrusted response bodies using the existing domain schema, for example inside the owning adapter:

```ts
const response = await fetch(url, { signal })

if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
}

const payload: unknown = await response.json()
return userSchema.parse(payload)
```

Honor endpoint-specific cases such as no-content responses. Do not replace an established typed client merely to introduce raw fetch. Aborted requests should follow the owner's cancellation policy rather than produce a misleading success or generic error notification. See [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
