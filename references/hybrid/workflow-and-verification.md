# Hybrid workflow and verification

Scope: [Hybrid profile](index.md). This reference coordinates the two areas; formatting, dependency selection, and language tests remain in their existing profiles. Shared permission, secret, generated-file, and migration restrictions remain in [SKILL.md](../../SKILL.md).

## Root tooling, configuration, and development

Put genuinely repository-wide README/docs, CI, update policy, editor settings, and optional container/orchestration files at the root. Keep web manifests/toolchain settings and Cargo manifests/toolchain settings with their actual owning areas unless an established workspace arrangement needs otherwise. Dependencies and lockfiles stay independent; a root script does not replace either ecosystem's resolver or security checks.

Document real working directories, startup/build commands, required component versions, addresses/ports, and the transport/authentication/configuration path. Use the language profiles' configuration validation and `.env.example` rules, with explicit ownership of values each component consumes. A setting needed on both sides requires agreed semantics and deployment wiring, not one mixed runtime config module. Keep browser-public settings distinct from privileged server/core settings, including build-time vs runtime behavior.

For local development, use established package/Cargo commands and existing orchestration first. Add a Makefile, justfile, task runner, or small root script only for meaningful shared workflows. Do not add a task system to save one command. Any wrapper must select the right directory/manifest, propagate failure status, and preserve the shared safety restrictions; do not hide dependency installs, migrations, or unrelated services inside a check.

If both components must run, define readiness, useful startup failure reporting, signal handling, and cleanup of owned child processes. Do not treat a launched process as ready or kill unrelated processes to free a port. Use only safe isolated resources for test/development side effects within the actual authorization.

## Build and deployment coordination

Maintain independent web and core builds. Use actual package scripts, Cargo targets, profiles, and features; do not assume every project has identically named scripts. Use each language's committed-lock/reproducibility policy. Do not run full cross-system builds for a local change unless its effects warrant them.

Declare order when one artifact really consumes another: contract generation before compilation, or web assets before assembling a release that serves them. Record inputs/outputs and avoid hidden second-language installs/builds inside normal unit tests or unrelated Cargo build scripts. Generated assets/bindings still belong to the appropriate artifact/adapter, not the Rust domain's knowledge of React or frontend source paths.

Choose container/service splitting according to the runtime and deployment: web static assets, a TypeScript server, and a Rust process may be separate or assembled into one deliverable. Use explicit build contexts, runtime config, credentials, readiness, and artifact boundaries; do not require one container per language. Keep reproducible generator/native-toolchain inputs and avoid shipping build-only dependencies/secrets.

For a jointly running system, coordinate stopping new work, draining/cancelling cross-component requests, and shutting down owned processes within the agreed timeout. Reuse each component's lifecycle mechanisms and the [operation contract](contracts-and-boundaries.md#external-errors-and-operation-lifecycle). A successful web shutdown does not prove core work has completed or persisted.

## Test ownership

| Test | Location/rules |
| --- | --- |
| TypeScript behavior | `web/src/tests/`, mirroring source under `web/src/`, as defined by the [TypeScript verification profile](../typescript/workflow-and-verification.md#tests-and-checks) |
| Rust behavior | `core/tests/` and the documented private-test/doctest exceptions in [Rust verification](../rust/testing-and-verification.md) |
| Actual cross-system/E2E behavior | Optional root `tests/e2e/` or an existing appropriate system-test area |

Keep tests in their owning language area. Create a root test suite only when tests exercise the combined system. Generated type checks complement behavior tests; they do not prove serialization semantics, authorization, or version compatibility.

For boundary changes, verify relevant shared fixtures or producer/consumer contract tests on both sides: serialized names, missing/null fields, enum variants, wide values, error codes/statuses, and significant incompatible inputs. Include authorization/tenant/origin checks, retries/partial work, or stream/cancellation cases when the boundary change affects them. Use real adapters where their behavior matters rather than two mocks that agree with each other while both differ from the wire contract.

System tests should start isolated components with explicit readiness, test addresses/ports, bounded timeouts, and cleanup, then assert externally visible behavior. Keep external infrastructure opt-in and correctly authorized; do not substitute an ordinary service or production credential when the isolated fixture is unavailable. Report skipped configurations accurately.

## CI and final verification

Use the existing CI provider (`.forgejo/`, `.github/`, or another established system). Separate TypeScript and Rust checks, then add contract-generation/drift and actual integration checks where needed. Read their language references for the real commands instead of copying a third list of formatter/lint/test rules.

- Keep single-area checks focused while accounting for dependencies across the boundary.
- A contract/schema/generator change can affect both areas even if only one directory changed. Make CI path filters include those inputs, shared orchestration, and relevant root configuration; do not let them suppress required compatibility tests.
- Use meaningful runtime/toolchain, Rust MSRV/features/targets, and deployment matrices rather than every theoretical combination. Cross-compilation is not a substitute for execution tests on a promised platform.
- Check generated drift according to the documented committed-vs-build-generated policy. Include new/untracked output when a tracked-files-only diff would miss it.
- Run system tests for the relevant component combinations and record exact configurations. Do not claim security, platform, or old-client compatibility from a compilation-only check.

Review Git changes in all affected areas, config/deployment consequences, lockfiles, generated outputs, and the boundary consumers. Report checks, skipped infrastructure, pre-existing failures, and remaining authorized or maintainer-only steps under the shared handover rules.

## Release and API compatibility

Decide whether components share one product version/release or version independently based on actual deployment/reuse needs. Do not force Cargo and package versions to match mechanically. Either approach still needs a documented compatible web/core/protocol combination when components or cached clients can update separately.

Record breaking contract changes, generation inputs, configuration changes, rollout/rollback order, and supported older clients where relevant. Keep API/protocol compatibility distinct from artifact version numbers; simultaneous builds do not guarantee every deployed client is current. Prefer a small compatibility policy and tests over a new release framework without a concrete need.

Perform packaging, publication, or deployment only within the actual request's authorization. Building or testing a hybrid system does not itself authorize a release.
