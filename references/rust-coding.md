# Rust coding

Scope: [Rust profile](rust.md). Structure and visibility are defined in [architecture](rust-architecture.md); checks are defined in [testing and verification](rust-testing-and-verification.md).

## Ownership and borrowing

For read-only access, prefer `&T`, `&str`, and `&[T]` when their lifetimes fit the operation. Take or return owned data when ownership transfer, storage, independent lifetime, or task boundaries require it. Do not automatically turn every input into `String` or `Vec<T>`.

Avoid cloning simply to silence the borrow checker. First reconsider ownership, borrowing scope, and data flow. A cheap clone can still be clearer than intricate lifetimes or a contorted API; evaluate its actual cost and semantics. `Arc` shares ownership, not automatic thread safety or deep immutability. Shared mutable state and synchronization decisions belong to [runtime safety](rust-safety-and-runtime.md#concurrency-and-shutdown).

Do not force every struct to carry lifetimes, every owned input to be generic, or every return to avoid allocation. Keep ownership visible and APIs understandable.

## Errors and invariants

- Use `Result`, `Option`, and `?` for fallible operations and meaningful absence. Do not conflate absent data with invalid data or failure.
- Use typed errors when callers need to distinguish failures. Preserve relevant causes through `std::error::Error::source` and add useful operation context without flattening errors into strings.
- Application boundaries can aggregate or report errors contextually; reusable libraries should retain a useful caller contract. `std::io::Error` or another existing suitable type can suffice for a small operation. Do not install an error crate automatically; see the [selection guidance](rust-cargo-and-tooling.md#dependency-selection).
- Avoid `unwrap()`/`expect()` chains on expected failures in production. An `expect()` must represent a real invariant and explain why failure should be impossible. Input, disk availability, environment settings, locks, and networks do not become invariants just because the happy path usually works.
- Libraries must not panic for expected errors. Document intentional panic conditions; propagate recoverable failures and do not discard results to hide a broken operation. Tests can use pragmatic `expect()` messages.
- If a best-effort operation is allowed to fail, make that policy explicit and keep failures observable where they matter. Return actionable boundary errors and meaningful process exit codes without leaking private details.

Do not use one giant error type or `String` errors as a shortcut around ownership and error design. Avoid blanket panic-catching as ordinary error handling.

## Types and idioms

Use enums for finite states, newtypes for meaningful semantic boundaries, and typed IDs where they prevent mixing distinct entities. Prefer validated construction and `TryFrom`/fallible parsing when external values can violate invariants. Make invalid states unrepresentable where it stays understandable; avoid unnecessary type-level machinery.

Use `match`, pattern matching, `if let`, `let else`, `?`, and iterators idiomatically. A simple loop is preferable to an opaque iterator chain. Use checked numeric conversions and arithmetic for untrusted lengths, offsets, and counts rather than truncating casts or relying on build-profile overflow behavior.

Use standard conversion and borrowing traits where they make the API natural. Do not translate classes, stringly typed state machines, or getter/setter boilerplate from another language into Rust without a need.

## Traits and generics

Use traits for a real abstraction: multiple implementations, replaceable backends, plugins, a public capability, a dependency boundary, or meaningful test substitution. Prefer a concrete type when none exists. Do not create `FooService`/`FooServiceImpl` or `FooRepository`/`FooRepositoryImpl` pairs by default.

Introduce generics only for actual variation or useful reuse. Choose generic dispatch or `dyn Trait` according to API needs, ownership, extensibility, code size, and measured performance. Do not expose a maze of generic parameters, associated types, or lifetimes for a single concrete implementation. Testability alone is not a requirement to abstract every function.

## Public library contracts

Keep APIs narrow and use consistent ownership and naming. Consider future extension before publishing structs, enum variants, or traits. `#[non_exhaustive]` can be appropriate for an intentionally extensible public type; adding it later is itself a compatibility decision.

Public fields, required trait methods, error variants, feature defaults, and relevant auto-traits such as `Send`/`Sync` affect compatibility. Changing private internals can change these guarantees. Do not expose a third-party type unnecessarily when it would bind consumers to that dependency's version, but avoid wrappers with no benefit. Preserve established contracts in existing libraries; assess changes using [Cargo's SemVer guidance](https://doc.rust-lang.org/cargo/reference/semver.html).

Document the contract callers need: normal behavior, examples, expected errors, and relevant panic, cancellation, platform, or safety conditions. Add `# Errors`, `# Panics`, and `# Safety` sections when those subjects apply. Executable examples are covered in [verification](rust-testing-and-verification.md#behavior-and-isolation).

## Async selection

Use async when networking, servers, database I/O, or many concurrent I/O operations benefit from it. Do not add a runtime to a simple synchronous CLI or filesystem tool without a concrete advantage. Keep reusable computations independent of a particular runtime where practical; explicitly document runtime requirements when independence would be artificial.

Async is not automatic parallelism or faster CPU work. Blocking operations, task limits, cancellation, and shutdown require the [runtime rules](rust-safety-and-runtime.md#concurrency-and-shutdown). Research a runtime like any other dependency rather than treating one ecosystem as a universal default.

## Naming, comments, and performance

Use `snake_case` for modules, functions, and variables; `UpperCamelCase` for structs, enums, and traits; and `SCREAMING_SNAKE_CASE` for constants/statics. Choose concrete names that describe the operation. Rust semicolons and formatting follow Rust/rustfmt, not the TypeScript style rules.

Comments explain unusual decisions, workarounds, domain rules, platform constraints, or measured tradeoffs, not obvious statements. Safety comments must describe the actual invariant. Keep docs and examples consistent with behavior and write proper umlauts and ß in German text.

Avoid unnecessary allocations, repeated work, and wasteful clones without sacrificing clarity. For a performance-critical path: measure, locate the bottleneck, optimize that path, then measure again with representative inputs. Introduce benchmarks only when they help protect a real requirement. Compile time, monomorphization, dependency cost, and binary size also matter; release-profile choices belong to [Cargo tooling](rust-cargo-and-tooling.md#build-scripts-proc-macros-and-release-work).

Unsafe micro-optimizations require a demonstrated need and the [unsafe review](rust-safety-and-runtime.md#unsafe-and-ffi). Do not complicate ordinary code based on speculative speed claims.
