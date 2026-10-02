# Rust Cargo and tooling

Scope: [Rust profile](rust.md). Apply the shared dependency-research and safety constraints in [SKILL.md](../SKILL.md); this reference adds Cargo-specific decisions.

## Toolchain, edition, and MSRV

For new projects, verify the current stable Rust release and stable edition against the [official release announcements](https://blog.rust-lang.org/releases/) and [Edition Guide](https://doc.rust-lang.org/edition-guide/). The current stable edition checked on 2026-10-02 is [2024](https://doc.rust-lang.org/edition-guide/rust-2024/index.html). Recheck when creating a project; this observation is not a permanent version pin. Use nightly only for a documented technical requirement.

Respect an existing `rust-toolchain.toml`, edition, and support policy. When reproducibility requires a toolchain pin, choose an explicit verified stable version and plan updates; a floating `stable` channel changes over time. Do not run a broad toolchain/edition upgrade as a side effect of an unrelated change.

For a library with compatibility requirements, declare and verify an MSRV via `package.rust-version`. This is a minimum supported compiler, not a toolchain pin or a guarantee that all resolved dependency versions support it. Account for edition, std APIs, features, build/dev dependencies, native toolchains, and target platforms. Publish a policy for MSRV changes and test the promised configurations. See [Cargo's Rust-version reference](https://doc.rust-lang.org/cargo/reference/rust-version.html).

Choose a resolver compatible with that policy. Edition 2024 packages imply resolver 3; a virtual workspace must set its resolver explicitly because it has no package edition to infer from. Resolver 3 prefers Rust-version-compatible dependencies, but this fallback is not a substitute for MSRV tests. Preserve older compatible projects deliberately. See [dependency resolution](https://doc.rust-lang.org/cargo/reference/resolver.html).

## Dependency selection

Start with std and already-installed suitable crates. Before adding a crate or proposing a version, establish the required capability and verify:

1. The newest suitable non-yanked stable release on its registry, release history, and official repository/docs. Avoid remembered tutorial pins, wildcard `*` requirements, and unjustified prereleases.
2. Maintenance and development activity in context, archive/deprecation/supersession notices, and established alternatives. Low release frequency alone does not mean a mature crate is abandoned.
3. RustSec and relevant maintainer/upstream advisories, including native dependencies where applicable. Popularity or a clean scan is not proof of safety.
4. Rust/MSRV, target, edition, runtime, native toolchain, API, and license compatibility, including required feature combinations.
5. Transitive dependencies, build scripts/proc macros, compile time, binary size, and actual enabled features. Use `cargo tree` and `cargo tree -e features` to inspect a surprising dependency graph when appropriate.

Prefer the latest suitable stable version with normal Cargo/SemVer requirements. An older release needs a documented compatibility reason and consideration of available security fixes. Do not claim “latest” without current evidence. If current sources cannot be checked, report that limitation rather than claiming the choice is verified.

Prefer a maintained registry release to a Git dependency. When a Git dependency is necessary, document why and use an explicit revision for a stable production input; a floating `main` branch is not the normal default. Local workspace path dependencies are valid; publishable paths need suitable registry version requirements too.

Use `[dev-dependencies]` for test-only dependencies and `[build-dependencies]` for build-time dependencies. Reduce unused features when it actually helps; `default-features = false` everywhere is not a policy. Feature unification can re-enable defaults through other edges, so inspect the resulting graph.

For errors, handwritten `std::error::Error` implementations or an existing error type may suffice. [thiserror](https://github.com/dtolnay/thiserror) is an optional derive candidate for typed errors; [anyhow](https://github.com/dtolnay/anyhow) is an optional context/reporting candidate at application boundaries. Their release histories were checked on 2026-10-02; neither is a mandatory dependency or universal public library error contract. Reassess current alternatives, maintenance, and versions when actually selecting one.

## Cargo.lock and reproducible dependency resolution

Commit `Cargo.lock` for applications/binaries and at the workspace root for a shared workspace resolution. For libraries, default to committing it too unless the project has a documented reason otherwise. Current Cargo guidance recommends checking it in when in doubt; the older blanket rule “libraries never commit Cargo.lock” is not this profile's policy. See the [Cargo guide](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html).

A library's lockfile reproduces contributor/CI resolution; consumers still resolve using the manifest. Pair locked checks with a deliberate job or isolated check of newly resolved compatible dependencies, so stale locks do not conceal consumer breakage. See [Cargo's FAQ](https://doc.rust-lang.org/cargo/faq.html#why-have-cargolock-in-version-control) and [latest-dependency CI guidance](https://doc.rust-lang.org/cargo/guide/continuous-integration.html#verifying-latest-dependencies).

Let Cargo update lockfiles; do not manually edit them. Scope dependency updates and inspect their diffs rather than running a blanket `cargo update` for an unrelated change. Use `--locked` for reproducible CI/release dependency resolution; `--frozen` also requires offline operation and a prepared cache/vendor source. Neither flag pins the compiler, system libraries, or build environment. Do not conceal lockfile drift by silently regenerating it in a reproducibility check.

## Feature flags and manifests

Design features to add capabilities rather than disable behavior: Cargo unifies enabled features across the graph. Avoid mutually exclusive library features where possible; if unavoidable, document and reject invalid combinations clearly. Test default, supported minimal/no-default, and important deployment combinations. `--all-features` is useful only when that combination is supported. Removing features or changing defaults can affect SemVer. See [Cargo features](https://doc.rust-lang.org/cargo/reference/features.html).

Keep `[workspace.dependencies]`, shared package metadata, and lint policy centralized when real reuse warrants it. Members opt into inheritance; do not assume a workspace setting silently applies everywhere. Prefer target-specific dependencies for platform-only integrations. Mark deliberately private application/internal packages `publish = false`; do not apply that to libraries meant for release.

## Build scripts, proc macros, and release work

Use `build.rs` or proc macros only for a concrete need; these run code during compilation and increase supply-chain/compile-time cost. Inspect relevant scripts and tool aliases before checks, especially when they invoke external programs or services. Keep build generation deterministic, declare relevant `rerun-if-changed`/`rerun-if-env-changed` inputs, and generate into `OUT_DIR` rather than editing source files. Do not rely on that directory being empty. Avoid hidden network downloads, credentials, or unrelated machine mutations in builds. See [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html).

Distinguish build host from target: build-script `cfg!` describes the host, while `CARGO_CFG_*` describes the target. Cross builds need the target linker, native libraries, and a suitable runner for execution. Proc-macro crates are legitimate separate crates when needed; prefer ordinary functions or declarative macros when they solve the task more simply.

Validate release behavior with the actual release profile when relevant. Change LTO, codegen units, stripping, optimization, or panic strategy only for measured size/performance or an explicit deployment requirement; consider debuggability, unwind/FFI behavior, and build time. Do not assume debug-only assertions or overflow behavior will protect production inputs.

For publication work, inspect packaged files, metadata, license/readme, documentation, supported features, and public API compatibility. Use `cargo package --list` to inspect inclusion and the relevant package verification before an authorized publish. Keep secrets and unrelated assets out. Validation does not itself authorize publication.

## Security and dependency policy

For professional projects, provide a dependency check appropriate to the risk and delivery workflow. Current candidates, checked against their official documentation and release histories on 2026-10-02:

| Need | Candidate |
| --- | --- |
| RustSec advisory checks on resolved dependencies | [cargo-audit](https://github.com/rustsec/rustsec/tree/main/cargo-audit) |
| Advisories plus allowed licenses, banned/duplicate crates, and allowed sources | [cargo-deny](https://embarkstudios.github.io/cargo-deny/) |

[RustSec](https://rustsec.org/) describes their overlap. Choose the checks the project needs; do not require both tools merely to duplicate advisory scanning. Duplicate versions are a cost to investigate, not automatically a vulnerability. Allow licenses and sources according to the project's actual policy.

Keep the advisory database current and distinguish a failed fetch/stale database from a successful scan. Document narrow exceptions with the advisory/policy item, applicability, reason, owner, and review/expiry condition. Prefer fixing affected dependencies to blanket ignores. These checks do not prove unsafe/FFI code or native libraries are secure.

Treat development tools and CI actions as dependencies too: check current stable releases, compatibility, and provenance, then pin reproducible inputs where appropriate. Do not install security tools or rewrite CI without a concrete task need. Release evidence: [cargo-audit](https://github.com/rustsec/rustsec/releases), [cargo-deny](https://github.com/EmbarkStudios/cargo-deny/releases), [thiserror](https://github.com/dtolnay/thiserror/releases), and [anyhow](https://github.com/dtolnay/anyhow/releases). These links support rechecking; they are not permanent version recommendations.
