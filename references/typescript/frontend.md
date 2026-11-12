# Frontend

Scope: [TypeScript profile](index.md). React hooks and their grouped returns apply to the TypeScript frontend.

## Presentation components

TSX component files contain imports, props and hook wiring, and JSX. Put state, effects, queries, mutations, business calculations, and action workflows in logic hooks.

Presentation work remains readable in JSX: small display conditions, rendering a list with `.map`, translated labels, and connecting an event to a handler. Move substantial transformations, sorting, validation, permission decisions, and multi-step callbacks to the hook.

A subcomponent can receive the groups it needs through props. It does not need a new hook just to wrap props. Keep prop and hook-result contracts in the relevant `Types/` directory.

```tsx
import { useNotificationsLogic } from '../Hooks/useNotificationsLogic.ts'

export function Notifications() {
    const { state, handler } = useNotificationsLogic()

    return (
        <button
            type="button"
            disabled={state.isPending}
            onClick={handler.handleRefresh}
        >
            {state.refreshLabel}
        </button>
    )
}
```

Do not hide a workflow inside a large JSX callback or an immediately invoked function. Component simplicity comes from placing behavior with its owner, not from moving unreadable code into markup.

## Logic hook composition

A screen or complex component has one public `use...Logic` orchestration hook. The component calls that entrypoint directly. Do not call another screen/component's complete logic hook from it, or add a second `PresentationLogic` layer that mainly forwards the first hook's `state`, `handler`, or other groups. Merge such a wrapper into the owning entrypoint.

Focused custom hooks are allowed inside an orchestration hook: stores, queries, form/table integration, debounce, subscriptions, and a coherent reusable UI lifecycle. Give them explicit inputs for the values and actions they need rather than passing a complete foreign logic result. Name them after their responsibility, such as `useSessionActivity` or `useRestoreStatus`; reserve `use...Logic` for the screen or component's orchestration.

Keep feature-specific focused hooks with their owner. Move React/UI hooks to `src/shared/<Area>/Hooks` when they have real reuse. UI-free computations, helpers, and schemas belong in `src/lib/<Domain>`, including when multiple features use them. A function that calls React hooks remains a custom hook and must follow React's Rules of Hooks; do not disguise it as a lib helper.

Build the public return contract explicitly from the state, actions, refs, and library instances the template needs. Do not spread whole foreign `state`/`handler` objects into it. Selecting named values from a focused hook is fine; ordinary immutable updates to a domain object are also fine.

This convention does not ban React/library hooks or useful custom-hook composition. Preserve a single source of truth and existing subscription/effect lifecycles during refactors; merging orchestrators must not duplicate local state, fetches, or side effects. Do not flatten every focused hook into one oversized function.

## Logic hook return contract

Use `use<MeaningfulName>Logic` for a screen or complex component's orchestration. Define its public result contract in the owner's `Types/` directory.

| Group | Contents |
| --- | --- |
| `state` | Data, form values, derived display values, loading/error flags, and translated values consumed by the template |
| `handler` | Actions and complete workflows, usually named `handle...` |
| `setter` | Direct state setters, named `set...`, when callers genuinely need them |
| `refs` | Needed React ref objects |
| Named library instance | A meaningful object with its own API, such as `table` or `form` |

Include groups only when used. A read-only hook may return only `state`; do not invent an empty `handler` or `setter` to satisfy a template.

```ts
import type { RefObject } from 'react'

export type UsersTableLogicResult = {
    state: {
        search: string
        isPending: boolean
    }
    handler: {
        handleDeleteSelected: () => Promise<void>
    }
    setter: {
        setSearch: (value: string) => void
    }
    refs: {
        searchInput: RefObject<HTMLInputElement | null>
    }
}
```

The hook returns the grouped contract:

```ts
return {
    state: {
        search,
        isPending,
    },
    handler: {
        handleDeleteSelected,
    },
    setter: {
        setSearch,
    },
    refs: {
        searchInput,
    },
}
```

Components consume `state.search`, `handler.handleDeleteSelected`, and `setter.setSearch`. Preserve this grouping rather than flattening the returned object.

Use `refs` for the group and the normal React `ref` attribute for the actual element:

```tsx
<input
    ref={refs.searchInput}
    value={state.search}
    onChange={(event) => setter.setSearch(event.target.value)}
/>
```

Return a TanStack `table` or `form` at the top level when the component needs its native API. Use accurate library types or type derivations in `Types/`. Keep query clients, raw mutations, internal helpers, and implementation details inside the hook unless the consumer has a concrete need.

Prefer small, purposeful hooks. Extract coherent behavior when a hook starts coordinating unrelated responsibilities.

## State, effects, and rendering

Apply the [TypeScript operation rules](coding.md) inside hooks; moving code out of TSX does not change React's runtime rules. The logic hook's function body runs during render. Requests, subscriptions, state updates, and other external side effects belong in the appropriate handler or lifecycle, not that body. Newly created local objects may be built normally; do not directly mutate props, existing state, hook inputs/results, or cached data. Calling a returned setter, handler, or library instance's supported method remains valid under its API contract.

Call ordinary hooks unconditionally at the top level of components/custom hooks, before early returns, never in loops or callbacks. The React `use` API has documented exceptions; do not generalize them to `useState`, `useEffect`, or custom hooks. Render components through JSX rather than calling their functions directly, and do not define a new component type inside another component/hook on each render. See [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) and [React purity](https://react.dev/reference/rules).

### Derive values and update state deliberately

- Compute values derived from current inputs/state in the owning logic hook; do not keep an extra state variable and Effect solely to synchronize the same information. A deliberate editing draft is different from duplicated source state.
- Put user-triggered workflows in `handle...` functions. Do not start an action indirectly through an Effect watching a flag when the event already supplies its cause.
- Event handlers returning promises must follow the [completion/error ownership rules](coding.md#promises-and-ownership-of-failures). A synchronous boundary can use `const handleSave = () => { void performSave().catch(reportSaveError) }` inside its owning hook, where `performSave` owns the workflow and `reportSaveError` safely handles the failure. If a form/library caller relies on rejection or pending completion, return the promise under its real API contract instead of detaching it.
- When the next value depends on previous state, use a functional updater, such as `setCount(current => current + 1)`. Direct assignment remains appropriate for independent values such as `setSearch(value)`.
- Keep updaters and initializers pure; no requests, notifications, or other external effects inside them. React may invoke them again in development checks. Use a lazy initializer for genuinely expensive initial computation, not as a place for side effects or SSR-unsafe browser access.
- Replace state objects/arrays rather than mutate them. A spread copies only one level; copy the changed nested levels too. Do not assume calling a setter changes the current render's captured value immediately.

For example, the contract in `Types/counter.types.ts`:

```ts
export type CounterLogicResult = {
    state: {
        count: number
        doubledCount: number
    }
    handler: {
        handleIncrement: () => void
    }
}
```

The implementation in `Hooks/useCounterLogic.ts` keeps the existing return grouping:

```ts
import { useState } from 'react'
import type { CounterLogicResult } from '../Types/counter.types.ts'

export function useCounterLogic(): CounterLogicResult {
    const [count, setCount] = useState(0)
    const doubledCount = count * 2

    const handleIncrement = () => {
        setCount(current => current + 1)
    }

    return {
        state: {
            count,
            doubledCount,
        },
        handler: {
            handleIncrement,
        },
    }
}
```

No extra Effect, duplicated state, or empty public setter group is needed. For an immutable update within a list, use `setItems(current => current.map(item => item.id === id ? { ...item, isActive: true } : item))`; keep unrelated items unchanged. See [derived values versus Effects](https://react.dev/learn/you-might-not-need-an-effect), [functional updates](https://react.dev/learn/queueing-a-series-of-state-updates), and [array updates](https://react.dev/learn/updating-arrays-in-state).

### Effects own setup and cleanup

Use Effects to synchronize an external system, such as an event subscription or third-party widget. Include all reactive dependencies. Fix stale closures or unnecessary object/function creation instead of suppressing dependency diagnostics; `[]` is not a universal way to run something once. Setup and cleanup must work across dependency changes, remounts, and Strict Mode's development setup/cleanup checks.

Within an owning hook, this subscription uses the same listener for setup and cleanup:

```ts
useEffect(() => {
    const handleResize = () => {
        setWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
        window.removeEventListener('resize', handleResize)
    }
}, [])
```

Here `setWidth` is a stable React state setter. Browser globals are accessed only in the client Effect; choose a server-compatible initial render when SSR is used. Clean up timers/connections similarly. Do not declare an Effect callback `async`: launch asynchronous work inside it and return synchronous cleanup. Prevent obsolete completions from replacing newer state; propagate supported cancellation signals, and explicitly handle operations that cannot be cancelled. Use the existing Query lifecycle for server data rather than adding a competing fetching Effect. See [useEffect](https://react.dev/reference/react/useEffect).

### Refs and memoization

Use state for values needed to render and refs for non-rendering mutable values or element handles. A ref update does not trigger rendering. Avoid reading/writing refs during render except documented predictable initialization cases; do not use refs to hide reactive dependencies. Needed public refs retain the `refs` group. See [useRef](https://react.dev/reference/react/useRef).

Use `useMemo`, `useCallback`, and `memo` for a concrete expensive calculation or relevant reference-identity boundary, not for every expression, handler, or entire grouped return object. Memoization is an optimization, not a correctness requirement; React can discard cached results. Consider an enabled React Compiler when choosing manual optimization, without enabling it as a side effect. See [useMemo](https://react.dev/reference/react/useMemo).

### Safe JSX expressions

Keep the existing presentation boundary. Use stable data IDs for mutable-list keys, such as `key={user.id}`; avoid random keys or index keys when insertion/reordering changes identity. Keys are unique among siblings and are not forwarded as ordinary props. Avoid accidentally rendering zero: use `{state.items.length > 0 && <ItemsList items={state.items} />}` rather than a raw length on the left of `&&`. See [list keys](https://react.dev/learn/rendering-lists) and [conditional rendering](https://react.dev/learn/conditional-rendering).

Keep an input controlled or uncontrolled for its lifetime. For a controlled text field with an optional value, for example, use `<input value={state.name ?? ''} onChange={(event) => setter.setName(event.target.value)} />`; connect its real accessible label and reuse the installed UI component where supported. A checkbox uses `checked`, not a string `value`, for its controlled state. See [input contracts](https://react.dev/reference/react-dom/components/input).

## Queries, forms, and tables

- Load server state with TanStack Query. Do not mirror fetched state into local state without a specific editing or lifecycle requirement.
- Keep query keys stable and parameter-complete. After mutations, update or invalidate the affected queries.
- Query functions must throw/reject failures rather than return fake successful empty data. For supported transports, consume the supplied `AbortSignal`; query cancellation does not automatically undo committed mutations. Keep query results immutable and apply the [HTTP/error contract](coding.md#error-values-and-http-results) in the owning adapter.
- Use TanStack Form for new forms in the preferred stack. Preserve an established form approach within an existing feature instead of unnecessarily mixing implementations.
- Keep form state, validation wiring, submit workflows, and errors in hooks; keep the form component focused on rendering.
- Use TanStack Table with the existing shared table UI. Define columns and behavior with the owning table component or hook, following the same presentation boundary.
- Use the capabilities of the installed versions. Consult their current official documentation when an API is unfamiliar or may have changed.

For example, include every input affecting a cached read: `queryKey: ['users', { page, search }]`. A compatible direct-fetch query function forwards its `signal` as `fetch(url, { signal })`. Keep these declarations with the existing owner rather than creating query-key files. Mutation success updates/invalidation target affected data; use an awaited invalidation when the workflow must remain pending through that refresh. See [query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys), [query functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions), and [cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).

## Styling and installed UI

Use installed `@rentnerkev/*` packages as the primary components for the areas they support. Read the installed API, types, or current official docs before integration. Reuse providers, tokens, and neighboring usage patterns instead of building a competing input, select, toast, picker, or other base component.

Use Tailwind classes and the existing design tokens for layout, spacing, colors, typography, states, and responsive behavior.

Use inline styles or plain CSS only for a concrete requirement that classes cannot adequately express, such as runtime dimensions, a necessary CSS custom property, or a library's style/config API. Keep the exception small and explain it when the reason is not obvious. Do not choose plain CSS merely because it is familiar.

## Visible text and accessibility

Use the project's translation mechanism for UI text and add German and English translations together. In TanStack Dummy, this is `useTranslationStore().t()` and the locale files under `src/language/Locales`. Follow the corresponding established mechanism in other projects.

Simple translation lookups are permitted in presentation components; workflows and substantial derived state belong in hooks. Avoid hardcoded visible messages in components or hooks.

Carry semantic HTML, labels, focus management, keyboard access, and loading, empty, success, and error states through the implementation. Use stable list keys. Reuse the UI package's accessibility behavior where available.

Client permission state controls presentation; every protected operation still requires authorization at its trusted server or native boundary.
