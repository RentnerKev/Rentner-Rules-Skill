# Rust architecture

Scope: [Rust profile](index.md). Shared workflow and safety constraints remain in [SKILL.md](../../SKILL.md).

## Responsibilities before layers

Organize Rust by coherent operations and responsibilities. Do not automatically create `controllers/`, `services/`, `repositories/`, `interfaces/`, `models/`, `types/`, `helpers/`, `utils/`, or `features/`. Such areas are valid when the concrete project needs them; they are not a universal Rust layout.

A small tool may consist only of `src/main.rs`. Extract modules when workflows, technical concerns, or independent responsibilities have diverged. Do not copy Java/C#/TypeScript class or folder patterns into Rust by analogy.

Prefer the modern module entrypoint for new structures:

```text
src/
├── copy.rs
└── copy/
    ├── plan.rs
    ├── execute.rs
    └── error.rs
```

`copy.rs` declares its children and controls visibility and exports. `copy/mod.rs` remains valid Rust; leave a sound existing layout alone. A module need not have a directory until it needs child modules. Rust's [module rules](https://doc.rust-lang.org/reference/items/modules.html) define the actual file-resolution behavior.

## Entrypoints and crate boundaries

For nontrivial applications, keep `main.rs` focused on loading config, initializing the selected runtime/observability, composing dependencies, starting the application, and handling top-level failures and exit status. Move growing application behavior into owned modules.

Use `lib.rs` for reusable/testable logic in a larger binary package where useful. Keep it a deliberate crate surface rather than a second giant implementation file. Do not add a library target to a tiny CLI solely to expose internals to tests; its executable can be tested directly.

Use `src/bin/` when a package actually has multiple independent executables. Introduce a Cargo workspace only for real crate boundaries, such as independently reusable or released code, a proc-macro crate, or distinct platform/dependency constraints. A folder, screen, or conceptual layer alone does not need a crate.

## Dependency direction

CLI, HTTP, Tauri command, and worker adapters may call application/core operations. Keep terminal formatting, argument parsing, transport/UI contracts, and framework-specific runtime wiring out of reusable core logic where practical. Do not make the core import its outer adapters.

A filesystem tool's core can own filesystem operations; this rule does not require a purely in-memory domain or a trait for every I/O call. Create a boundary when it provides a real independence or substitution benefit. Avoid forced Clean Architecture layers; see [traits and generics](coding.md#traits-and-generics).

## Config, shared code, and platform code

For nontrivial configuration, use a focused config module. Add only files the application needs:

```text
src/
├── config.rs
└── config/
    ├── app_config.rs
    ├── environment.rs
    ├── database_config.rs
    └── logging_config.rs
```

`config.rs` is the module surface. A small project may need just `config.rs` or it plus `config/app_config.rs`. Rust config may own typed contracts, parsing, normalization, and validation; the TypeScript rule requiring pure declarative config files does not apply. Establish precedence for supported sources, validate at startup, and pass config explicitly to consumers rather than repeatedly reading global state. Environment and secret handling are covered in [safety](safety-and-runtime.md#environment-and-observability).

Production code used by several independent areas may live behind `shared.rs`, with specific children such as `shared/filesystem.rs`, `validation.rs`, `ids.rs`, or `time.rs`. Each shared module still needs one clear responsibility. Code used only by `copy` stays in `copy`. Keep test fixtures in the test area.

Avoid unrelated collections in `utils.rs`, `helpers.rs`, `misc.rs`, `stuff.rs`, or `common.rs`. A precise small module is preferable to an artificial shared hierarchy.

When platform differences become substantial, contain them behind `platform.rs` with relevant `platform/windows.rs`, `linux.rs`, or `macos.rs` implementations. Small local `cfg` differences are fine; avoid scattering the same platform policy throughout the application. Do not create empty platform implementations.

## Error ownership and visibility

Keep operation errors with their owner, for example `copy/error.rs` with `CopyError`, `config/error.rs` with `ConfigError`, or `storage/error.rs` with `StorageError`. Small modules can define their error inline. An application may aggregate them into `AppError` at its boundary; a library may expose a crate-wide `Error`. Do not funnel every unrelated failure into a giant global enum. Error semantics and propagation are defined in [coding](coding.md#errors-and-invariants).

Default to private items. Use `pub(super)`, `pub(in ...)`, or `pub(crate)` for the smallest needed internal scope; use `pub` for intentional public contracts. Keep child modules private where possible and export selected API items with `pub use`. Do not couple consumers unnecessarily to internal file paths or expose implementation details for convenience. The TypeScript restriction on pure re-export barrels does not forbid Rust module facades.

## Coherent files and proportional growth

Use roughly 300–500 lines as a prompt to inspect cohesion; around 800–1000+ lines should have a defensible reason. These are review signals, not hard limits. Split at independent workflows, technical areas, or clear module boundaries, not arbitrary line counts. Generated code has a different lifecycle and is not manually split.

Keep small related structs, enums, and functions together. Avoid hundreds of single-item files, forwarding-only layers, and speculative interfaces. Pay special attention to growing `main.rs` and `lib.rs`. In existing projects, understand the architecture, assess a concrete gain, and preserve public APIs and compatibility while making focused changes.
