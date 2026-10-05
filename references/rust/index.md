# Rust profile

Status: established Rust-only conventions for ordinary Rust/Cargo projects. Use this profile for libraries, CLI tools, server cores, daemons/workers, file/copy/sync tools, Tauri Rust cores, system tools, and similar projects. It selects no framework, async runtime, persistence system, or mandatory third-party crate.

## Identify the actual Rust target

Identify the owning `Cargo.toml`, crate targets, workspace membership, toolchain, edition, supported platforms, and relevant repository instructions. Read neighboring implementations before changing an existing project. A frontend `package.json` does not turn a nested Rust crate into TypeScript.

Apply the shared scope, authorization, dependency-research, safety, and handover rules in [SKILL.md](../../SKILL.md). Rust details live here and in the references below; TypeScript structure, hooks, formatting, config purity, and test paths do not define Rust defaults.

## Decision defaults

- Structure by responsibility and actual complexity. A small tool can remain `src/main.rs`; grow modules and crates when real boundaries emerge.
- Prefer `name.rs` with children under `name/` for new modules. Preserve a coherent existing `mod.rs` structure.
- Keep internals private and expose deliberate public contracts. Rust module facades and targeted `pub use` exports are valid.
- Use idiomatic ownership, typed states and errors, and concrete types unless an abstraction solves a real problem.
- Prefer synchronous code when it meets the need. Make runtime, concurrency, shared state, and unsafe decisions explicit.
- Prefer observable behavior tests in crate-root `tests/`; private algorithm tests and executable API documentation have justified exceptions.
- Use rustfmt and Clippy, then the relevant Cargo tests and compatibility checks. Research time-sensitive tooling and dependency choices at the time of use.

These are decision criteria, not a scaffolding template. Avoid both giant implementation files and needless layers, traits, workspaces, or tiny files. Preserve compatibility and refactor only for a concrete improvement within the request.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Module/crate boundaries, entrypoints, config/shared ownership, visibility, file size | [Rust architecture](architecture.md) |
| Ownership, errors, types, traits/generics, public APIs, async selection, naming, performance | [Rust coding](coding.md) |
| Cargo manifests, dependency research, toolchain/MSRV, lockfiles, features, build scripts, releases | [Rust Cargo and tooling](cargo-and-tooling.md) |
| Test placement and discovery, binary/library tests, docs, rustfmt/Clippy, CI/platform checks | [Rust testing and verification](testing-and-verification.md) |
| External input, filesystem/path safety, environment, logging, concurrency/shutdown, unsafe/FFI | [Rust safety and runtime](safety-and-runtime.md) |
| Provider workflows/scripts, dependency automation, publishing, repository metadata | [Shared deployment routing](../deployment/index.md), composed with this profile |

Read the references that affect the current decision before implementation or review. For a new Rust project, use the architecture and coding defaults and establish the Cargo and verification baseline. Load specialized safety sections when the code touches their boundaries; do not create those facilities merely because the guidance exists.
