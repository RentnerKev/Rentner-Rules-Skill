# Rust testing and verification

Scope: [Rust profile](rust.md). Apply shared authorization and verification-side-effect constraints from [SKILL.md](../SKILL.md). Discover the project's real targets, aliases, scripts, features, and CI before choosing commands.

## Preferred test layout and Cargo discovery

Prefer crate-root `tests/` for observable behavior and public API tests, keeping normal implementation files focused on production code:

```text
tests/
├── common/
│   └── mod.rs
├── copy.rs
├── archive.rs
└── config.rs
```

Cargo compiles each integration-test target as a separate crate, so tests use the library's reachable public API. `tests/common/mod.rs` is support code imported with `mod common;`, not a standalone test target. This is a deliberate exception to the new-production-module preference for `name.rs`.

When one suite grows, retain a discoverable entrypoint and split its cases:

```text
tests/
├── common/
│   └── mod.rs
├── copy.rs
└── copy/
    ├── basic.rs
    ├── errors.rs
    └── edge_cases.rs
```

For example, `tests/copy.rs` explicitly includes the case files:

```rust
mod common;

#[path = "copy/basic.rs"]
mod basic;
#[path = "copy/errors.rs"]
mod errors;
#[path = "copy/edge_cases.rs"]
mod edge_cases;
```

Arbitrary nested case files alone are not automatically test targets. A supported `tests/<suite>/main.rs` entrypoint or explicit `[[test]]` target is another option. Avoid accidentally running a suite twice through overlapping discovery/manifest declarations. See [Cargo targets](https://doc.rust-lang.org/cargo/reference/cargo-targets.html#integration-tests).

Do not automatically add inline `#[cfg(test)] mod tests` to every production file. Colocated unit tests are justified for complex private algorithms or internal invariants that cannot usefully be exercised through the public API. They may live in a dedicated test-only child file. Keep items private rather than adding `pub`, hidden public exports, or production feature flags solely for test access.

A larger binary package can expose genuinely reusable logic through its library target. For executable behavior, use `std::process::Command` and Cargo's `CARGO_BIN_EXE_<name>` path, asserting exit status and appropriate stdout/stderr. This also works for small binary-only tools without inventing a public library API.

## Behavior and isolation

Test meaningful behavior, failures, boundaries, and regressions. For filesystem/runtime work, include relevant overwrite/symlink/path, interruption, resource-limit, and shutdown cases. Select property tests or fuzzing when a parser/algorithm's input space or risk justifies them; do not add a framework for trivial cases.

Use isolated temporary directories, injected clocks/configuration, and deterministic inputs. Tests may run concurrently; do not depend on ordering, a real home directory, process-wide environment mutation, global logger installation, or timing sleeps to coordinate behavior. Control concurrency with appropriate synchronization and bounded timeouts. Assert stable semantics rather than platform-specific error wording when wording is not the contract.

Network/database/process tests need explicit isolation and the applicable authorization. Keep any opt-in infrastructure suite clearly identified and report when it was skipped; never silently use an ordinary service as a test fixture. Shared migration and secret restrictions remain in force.

Public library examples should compile and, when appropriate, execute as doctests. Use `no_run` for examples that must compile but should not execute external side effects; use `compile_fail` for intentional rejection contracts. Avoid `ignore` simply to hide a stale example. Doctests are a useful documentation exception to the preference for a separate test directory.

## Formatting, lints, and baseline checks

rustfmt and normal Clippy checks are required for Rust changes. Use the established configuration and scope checks to the affected package/workspace. A normal single-package baseline with a committed lockfile is:

```text
cargo fmt --all --check
cargo check --locked --all-targets
cargo clippy --locked --all-targets
cargo test --locked
```

Add the actual manifest/package/workspace and feature flags needed by the project. A missing lockfile requires an intentional lockfile decision, not silently dropping reproducibility claims. `cargo check` does not execute tests or prove final linking succeeds. `cargo test` normally includes library doctests; an `--all-targets` test invocation does not replace doctest coverage, so run `cargo test --locked --doc` separately when that mode is used. See [cargo test](https://doc.rust-lang.org/cargo/commands/cargo-test.html).

Treat new warnings seriously and generally fail CI on them. For toolchains supporting Cargo's `build.warnings` setting (available since Cargo 1.97), use the project's CI configuration or `CARGO_BUILD_WARNINGS=deny`; older supported toolchains can use `cargo clippy ... -- -D warnings`. Choose the policy consistently with the pinned checking toolchain and existing baseline. Do not turn an unrelated task into a blanket lint migration or hide existing failures. See [Clippy usage](https://doc.rust-lang.org/clippy/usage.html) and [Cargo warning configuration](https://doc.rust-lang.org/cargo/reference/config.html#buildwarnings).

Do not add `#![allow(warnings)]` or broad suppressions. Use narrowly scoped, justified `#[allow(...)]`, or `#[expect(...)]` when supported and suitable. Select additional pedantic/restriction lints for actual requirements; never enable all of `clippy::restriction` blindly because some lints conflict.

## CI, compatibility, and release checks

For the changed behavior, run the relevant tests first, then formatting, compilation, and Clippy. Add builds, docs, feature matrices, or platform checks where the change needs them. Do not broaden/repeat checks after passing without a new reason.

- Use selected workspace/package targets rather than assuming the root default covers every changed crate.
- Test supported default, minimal/no-default, and significant feature combinations; use all-features only when valid. Optional dependencies can hide compilation and API regressions.
- Test declared MSRV and current stable separately when compatibility is promised. Check freshly resolved compatible dependencies in an isolated job in addition to the committed lock, as explained in [Cargo tooling](rust-cargo-and-tooling.md#cargolock-and-reproducible-dependency-resolution).
- Run native tests on promised operating systems when platform behavior matters. Cross-compilation checks compilation; execution/linking requires the correct target toolchain, native dependencies, and runner.
- Build/test the real release profile for release-only logic, overflow/panic strategy, binary size, or performance changes. Use representative benchmarks with a before/after baseline only for a real performance requirement.
- Verify public docs/API/package contents when the change affects a published library. Use `cargo doc --no-deps` and an appropriate rustdoc warning policy when documentation is part of the deliverable.
- For unsafe/FFI or high-risk parsers, consider Miri, sanitizers, fuzzing, or platform-specific tools based on applicability. Diagnostic tooling may need a separate nightly lane; that does not make production nightly the default. These checks have coverage/platform limitations and do not prove soundness.

Inspect resulting Git changes, including lockfiles and generated artifacts. Report exact checks and configurations, pre-existing failures, unavailable checks, skipped infrastructure, and remaining maintainer steps. Never claim a cross-platform, security, or MSRV check passed based only on a local stable build.
