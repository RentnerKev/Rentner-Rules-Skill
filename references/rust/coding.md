# Rust coding

Scope: [Rust profile](index.md). Structure and visibility are defined in [architecture](architecture.md); checks are defined in [testing and verification](testing-and-verification.md).

Use the [official Rust Style Guide](https://doc.rust-lang.org/style-guide/) for formatting and the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) for API conventions, in context with this profile and the project's compatibility policy. These references do not replace the existing architecture or impose library-level generality on application code. For concrete operation choices and examples, read [Rust operations and examples](operations-and-examples.md) when implementing or reviewing function bodies.

## Ownership and borrowing

For read-only access, prefer `&T`, `&str`, and `&[T]` when their lifetimes fit the operation. Take or return owned data when ownership transfer, storage, independent lifetime, or task boundaries require it. Do not automatically turn every input into `String` or `Vec<T>`.

Avoid cloning simply to silence the borrow checker. First reconsider ownership, borrowing scope, and data flow. A cheap clone can still be clearer than intricate lifetimes or a contorted API; evaluate its actual cost and semantics. `Arc` shares ownership, not automatic thread safety or deep immutability. Shared mutable state and synchronization decisions belong to [runtime safety](safety-and-runtime.md#concurrency-and-shutdown).

Do not force every struct to carry lifetimes, every owned input to be generic, or every return to avoid allocation. Keep ownership visible and APIs understandable.

### Choose parameters by the operation

| Need | Prefer | Reason / exception |
| --- | --- | --- |
| Read an existing value | `&T` | Caller retains ownership; no copy required |
| Change an existing value | `&mut T` | Exclusive access makes mutation explicit |
| Store, consume, or transfer a value | `T` | Let the caller choose whether to move or clone; do not routinely borrow and clone internally |
| Pass a small `Copy` value | `T` | Scalars and suitable small value types rarely benefit from references; large `Copy` values still need judgment |
| Read text | `&str` rather than `&String` | Accept literals, substrings, and owned strings through borrowing |
| Read contiguous elements | `&[T]` rather than `&Vec<T>` | Do not require a particular owning container |
| Read boxed data | `&T` rather than `&Box<T>` | Hide allocation strategy unless the box itself matters |
| Read an optional value | `Option<&T>` | Borrow the content; `&Option<T>` is valid when inspecting the container itself, and `&mut Option<T>` when replacing/taking it |
| Read / own an OS path | `&Path` / `PathBuf` | Preserve OS semantics; see [path safety](safety-and-runtime.md#filesystem-and-path-safety) |

For example, a reading operation borrows, while a queue takes ownership:

```rust
fn contains_name(names: &[String], expected: &str) -> bool {
    names.iter().any(|name| name == expected)
}

fn enqueue(queue: &mut Vec<String>, name: String) {
    queue.push(name);
}
```

If a return value must outlive its source, return owned data instead of forcing a borrowed result. Do not add `'static` bounds or leak allocations merely to bypass a lifetime problem. Named lifetimes should describe meaningful relationships; elision, `'_`, and conventional local names such as `'a` remain appropriate.

`Clone` is type-specific, not a promise of a deep or cheap copy. `Arc::clone(&value)` shares the same allocation and makes that intent visible. Use `Rc`/`Arc` for actual shared ownership, not as default replacements for ordinary ownership and borrowing. A deliberate clone can be preferable to excessively complex borrowing.

### Collections and generic inputs

Use `impl IntoIterator<Item = T>` in a reusable API that only needs iteration when accepting different sources provides a real benefit. A slice is often simpler in application code. Returning `impl Iterator` can avoid premature allocation and preserve composition; return `Vec<T>` when the implementation already builds one, callers need ownership/indexing, or it makes the contract clearer.

Use `impl Into<T>` for useful owned conversions and `AsRef<T>` for useful borrowed views, not as mandatory wrappers around every argument. Concrete application signatures are the default. Generics have inference, compile-time, and code-size costs. See the [API flexibility guidelines](https://rust-lang.github.io/api-guidelines/flexibility.html).

## Errors and invariants

- Use `Result`, `Option`, and `?` for fallible operations and meaningful absence. Do not conflate absent data with invalid data or failure.
- Use typed errors when callers need to distinguish failures. Preserve relevant causes through `std::error::Error::source` and add useful operation context without flattening errors into strings.
- Application boundaries can aggregate or report errors contextually; reusable libraries should retain a useful caller contract. `std::io::Error` or another existing suitable type can suffice for a small operation. Do not install an error crate automatically; see the [selection guidance](cargo-and-tooling.md#dependency-selection).
- Avoid `unwrap()`/`expect()` chains on expected failures in production. An `expect()` must represent a real invariant and explain why failure should be impossible. Input, disk availability, environment settings, locks, and networks do not become invariants just because the happy path usually works.
- Libraries must not panic for expected errors. Document intentional panic conditions; propagate recoverable failures and do not discard results to hide a broken operation. Tests can use pragmatic `expect()` messages.
- If a best-effort operation is allowed to fail, make that policy explicit and keep failures observable where they matter. Return actionable boundary errors and meaningful process exit codes without leaking private details.

Do not use one giant error type or `String` errors as a shortcut around ownership and error design. Avoid blanket panic-catching as ordinary error handling.

Bind variants with `match`, `if let`, or `let else` instead of checking `is_some()`/`is_ok()` and then unwrapping. Use assertion context to explain the invariant or relevant diagnostic facts, not merely repeat the condition; do not include secrets. Assertions do not replace validation of external input.

## Types and idioms

Use enums for finite states, newtypes for meaningful semantic boundaries, and typed IDs where they prevent mixing distinct entities. Prefer validated construction and `TryFrom`/fallible parsing when external values can violate invariants. Make invalid states unrepresentable where it stays understandable; avoid unnecessary type-level machinery.

Use `match`, pattern matching, `if let`, `let else`, `?`, and iterators idiomatically. A simple loop is preferable to an opaque iterator chain. Use checked numeric conversions and arithmetic for untrusted lengths, offsets, and counts rather than truncating casts or relying on build-profile overflow behavior.

Use standard conversion and borrowing traits where they make the API natural. Do not translate classes, stringly typed state machines, or getter/setter boilerplate from another language into Rust without a need.

Replace ambiguous Boolean parameters with domain enums, for example `Overwrite::Allow` instead of an unexplained `true`. Keep `bool` for clear predicates and genuinely Boolean settings. Prefer named result fields over positional tuples when field meaning is not locally obvious; small local tuples and single-field newtypes remain valid.

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Overwrite {
    Allow,
    Deny,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct CopySummary {
    copied: usize,
    skipped: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct UserId(u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct OrderId(u64);
```

`UserId` and `OrderId` prevent accidental interchange; aliases of `u64` would not. Keep fields private when construction validates invariants. Do not expose unrestricted mutable access that bypasses those invariants.

## Traits and generics

Use traits for a real abstraction: multiple implementations, replaceable backends, plugins, a public capability, a dependency boundary, or meaningful test substitution. Prefer a concrete type when none exists. Do not create `FooService`/`FooServiceImpl` or `FooRepository`/`FooRepositoryImpl` pairs by default.

Introduce generics only for actual variation or useful reuse. Choose generic dispatch or `dyn Trait` according to API needs, ownership, extensibility, code size, and measured performance. Do not expose a maze of generic parameters, associated types, or lifetimes for a single concrete implementation. Testability alone is not a requirement to abstract every function.

### Standard traits before parallel custom APIs

- Implement `From` for suitable infallible, value-preserving conversions and `TryFrom` for fallible conversions. Implementing `From` also provides the corresponding `Into`; do not handwrite both.
- Implement `FromStr` for ordinary parsing from text, so callers can use `text.parse::<Type>()`. Use a named method when an operation needs additional context or does not fit the trait contract.
- Use `Display` for an intended textual representation and `Debug` for diagnostics. Neither is automatically a stable serialization format. Avoid exposing secrets through either.
- Use `#[derive(...)]` when it gives the intended semantics. Derive only appropriate traits; manual implementations remain necessary for custom equality, redaction, or other domain behavior.
- Implement `Default` when there is a meaningful default state, especially for options structs or a parameterless `new()`. Do not invent defaults for required credentials or invalid configuration.
- Treat `Copy`/`Clone` as deliberate capabilities. External resources and identity-bearing values may not be meaningfully duplicable; removing a published implementation can break consumers.
- Keep `PartialEq`/`Eq`, `PartialOrd`/`Ord`, and `Hash` contracts consistent. Only promise total ordering when one exists; equal map keys must hash equally.
- Library types should anticipate useful common traits; application types add implementations for actual needs. Do not derive everything preemptively.

Use inherent `impl Type` methods for ordinary functionality. An extension trait for a foreign type needs a concrete benefit and an `Ext` suffix; prefer an upstream API or focused helper when those are clearer. See the [interoperability guidelines](https://rust-lang.github.io/api-guidelines/interoperability.html).

## Public library contracts

Keep APIs narrow and use consistent ownership and naming. Consider future extension before publishing structs, enum variants, or traits. `#[non_exhaustive]` can be appropriate for an intentionally extensible public type; adding it later is itself a compatibility decision.

Public fields, required trait methods, error variants, feature defaults, and relevant auto-traits such as `Send`/`Sync` affect compatibility. Changing private internals can change these guarantees. Do not expose a third-party type unnecessarily when it would bind consumers to that dependency's version, but avoid wrappers with no benefit. Preserve established contracts in existing libraries; assess changes using [Cargo's SemVer guidance](https://doc.rust-lang.org/cargo/reference/semver.html).

Document the contract callers need: normal behavior, examples, expected errors, and relevant panic, cancellation, platform, or safety conditions. Add `# Errors`, `# Panics`, and `# Safety` sections when those subjects apply. Executable examples are covered in [verification](testing-and-verification.md#behavior-and-isolation).

- Add `is_empty()` alongside a collection-like `len()`.
- Use `#[must_use]` for important computed values or lazy operations that would be misused if discarded. Prefer annotating a shared result type when appropriate; do not duplicate the annotation solely because a function returns an already annotated type such as `Result`.
- Use `#[non_exhaustive]` for deliberately extensible external enums/structs, not every internal state. Across crates it prevents exhaustive matching or struct-literal construction respectively; this also restricts external struct-update syntax with `Default`.
- Treat public `const fn` as a compatibility commitment; removing `const` may break callers.
- Do not depend on foreign `#[doc(hidden)]` implementation details as public contracts.
- Overload operators only where their usual mathematical/logical meaning fits. Do not invent terse domain syntax through surprising operator behavior.

For example, silently discarding a computed plan is likely a caller error:

```rust
#[must_use = "inspect or execute the plan before discarding it"]
pub struct CopyPlan {
    files: usize,
}

impl CopyPlan {
    pub fn new(files: usize) -> Self {
        Self { files }
    }

    pub fn len(&self) -> usize {
        self.files
    }

    pub fn is_empty(&self) -> bool {
        self.files == 0
    }
}
```

## Async selection

Use async when networking, servers, database I/O, or many concurrent I/O operations benefit from it. Do not add a runtime to a simple synchronous CLI or filesystem tool without a concrete advantage. Keep reusable computations independent of a particular runtime where practical; explicitly document runtime requirements when independence would be artificial.

Async is not automatic parallelism or faster CPU work. Blocking operations, task limits, cancellation, and shutdown require the [runtime rules](safety-and-runtime.md#concurrency-and-shutdown). Research a runtime like any other dependency rather than treating one ecosystem as a universal default.

## Naming, comments, and performance

Use `snake_case` for modules, functions, and variables; `UpperCamelCase` for structs, enums, and traits; and `SCREAMING_SNAKE_CASE` for constants/statics. Choose concrete names that describe the operation. Rust semicolons and formatting follow Rust/rustfmt, not the TypeScript style rules.

### Method names express ownership

| Name | Expected behavior |
| --- | --- |
| `name()` | Read access, usually `&T` or a suitable `Copy` value; avoid redundant `get_` for ordinary getters |
| `name_mut()` | Exclusive mutable access, only if invariants permit it |
| `set_name(value)` | Assign a value; return `Result` when validation can fail |
| `take_name()` | Transfer the old value out and leave a documented empty/default state |
| `replace_name(value)` | Replace the value and return the old one |
| `as_*()` | Usually a cheap borrowed view |
| `to_*()` | Produce a converted value while retaining the source; may allocate or copy |
| `into_*()` | Consume the receiver for a conversion |
| `new()` / descriptive constructor | Construct a value; a fallible `new() -> Result<...>` is valid, with no blanket `try_new` requirement |

Add only accessors that the API needs. A closure-based accessor can hide a guard or constrain temporary access, but callbacks under locks need the [runtime deadlock review](safety-and-runtime.md#concurrency-and-shutdown); do not add them automatically. Builder-style `with_*` naming is also valid when the existing API makes its meaning clear. See [Rust API naming](https://rust-lang.github.io/api-guidelines/naming.html).

### Imports, macros, and inferred types

Prefer explicit imports. Keep exceptions narrow for established preludes, test modules, or local enum matching; retain deliberate module facades and targeted re-exports. Use module qualification when it adds useful context, such as `fs::read`; there is no universal requirement to qualify every function or import every trait locally.

Prefer ordinary functions, types, and traits over a custom macro when they express the operation well. Use macros for concrete benefits, including established derives; procedural macros and code generation need justification proportional to their tooling and maintenance cost.

Add type annotations when generic conversions or complex expressions would otherwise obscure the result, for example `let port: u16 = text.parse()?;`. Keep obvious local inference. Use descriptive generic/lifetime names when relationships are complex and conventional short names when they are clear. Avoid project-specific abbreviations that hide meaning.

Comments explain unusual decisions, workarounds, domain rules, platform constraints, or measured tradeoffs, not obvious statements. Safety comments must describe the actual invariant. Keep docs and examples consistent with behavior and write proper umlauts and ß in German text.

Avoid unnecessary allocations, repeated work, and wasteful clones without sacrificing clarity. For a performance-critical path: measure, locate the bottleneck, optimize that path, then measure again with representative inputs. Introduce benchmarks only when they help protect a real requirement. Compile time, monomorphization, dependency cost, and binary size also matter; release-profile choices belong to [Cargo tooling](cargo-and-tooling.md#build-scripts-proc-macros-and-release-work).

Unsafe micro-optimizations require a demonstrated need and the [unsafe review](safety-and-runtime.md#unsafe-and-ffi). Do not complicate ordinary code based on speculative speed claims.
