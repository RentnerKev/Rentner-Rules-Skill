# Forgejo runner strategy

Scope: Kevin's Forgejo infrastructure for workflows under **`.forgejo/workflows/` only**. Apply this strategy when creating or revising those workflows. It does not prescribe GitHub runner labels or override unrelated providers/Forgejo installations. Compose [Forgejo automation](forgejo.md), the selected project profile, and [runner security](security.md#secrets-runners-caches-and-evidence).

## Route each job by its toolchain

Kevin's infrastructure provides three specialized labels. Select from them according to the **job's responsibility**, not the repository's overall language/profile:

| Job responsibility | Required specialized label | Examples |
| --- | --- | --- |
| TypeScript / Bun | `runs-on: bun` | Dependency installation, Oxfmt/Oxlint, typecheck, Bun tests/audits, TanStack builds, frontend/backend and other JS/TS tooling, TypeScript release builds |
| Rust / Cargo | `runs-on: rust` | rustfmt, check, Clippy, tests, Cargo builds/releases, Rust audits, MSRV and supported feature checks |
| Tauri native delivery | `runs-on: tauri` | Tauri/native desktop builds, Windows/EXE builds where supported, installers/bundles, native packaging/integration, release artifacts and actual signing/updater preparation |

The `bun` runner supplies the Bun/TypeScript toolchain; the `rust` runner supplies the Rust/Cargo base toolchain; the `tauri` runner supplies the prepared Tauri toolchain/build environment. Check actual versions against the project's runtime/toolchain requirements before commands. Reuse suitable preinstalled tools instead of reinstalling Bun or Rust in every job. Select/add a particular project compiler or MSRV toolchain deliberately when the existing version cannot cover that promised configuration.

The labels do not establish every installed scanner, Node/action runtime version, native library, container capability, OS/architecture, cross-compiler, signing service, or trust level. Inspect the existing repository/runner configuration and canonical job before relying on those properties. In particular, verify that a Windows/EXE or other platform build is supported by the `tauri` environment and its target toolchain; the name alone is not evidence of native execution on every OS.

## Hybrid jobs

Do not run a non-Tauri TypeScript + Rust product's entire CI on one runner. Keep web and core checks/builds independently runnable on their specialized runners:

```yaml
jobs:
    web:
        runs-on: bun
        # Project-specific JS/TS steps
    core:
        runs-on: rust
        # Project-specific Cargo steps
```

This fragment illustrates routing only; generated workflows still need real steps, timeouts and the applicable security policy. Release-build jobs select the runner for the artifact they actually build; registry publication/notes jobs are infrastructure jobs with separate needs.

For cross-system tests, determine whether they consume already built artifacts or truly require both live toolchains. Prefer separate builds/checks and a verified artifact handoff, or an existing suitable runner. Use a combined job only when both toolchains are demonstrably required and available on its selected runner. Do not assume `bun` contains a full Rust toolchain or `rust` contains Bun. Validate platform/ABI compatibility and artifact identity when consuming another job's output.

## Tauri jobs

The [Tauri profile](../tauri/index.md) takes precedence over general hybrid. Use:

```text
Frontend TypeScript checks → bun
Rust core checks          → rust
Tauri native build/bundle → tauri
Tauri release build       → tauri
```

Ordinary language checks should not occupy the heavier `tauri` runner. If a test/build genuinely needs the WebView, platform libraries, native bundle, or Tauri packaging environment, classify that job as native integration/build and use `tauri`. Keep promised OS/architecture targets and signing/updater checks from [Tauri delivery](../tauri/workflow-and-verification.md); neither a frontend build nor a generic cross-build proves a distributable installer.

## Infrastructure jobs and missing prerequisites

For PR title checks, workflow lint, Gitleaks, Renovate, changelog generation, label synchronization, and other repository automation, select the available runner by actual tools. Inspect accessible TanstackDummy's matching canonical job first: its current infrastructure jobs use `bun`, but verify the relevant script/runtime, actionlint, scanner, git-cliff, container and API-tool requirements rather than making every metadata job a Bun-language check. A Rust-only or Tauri repository does not force those jobs onto `rust` or `tauri`.

Do not invent `ubuntu-latest` or other GitHub-style/generic runner labels for Kevin's `.forgejo/workflows/`. Use the existing `bun`, `rust`, or `tauri` according to the job. If none reliably supplies a required capability, inspect the existing configuration and supported toolchain/target options first; report the concrete runner prerequisite when unresolved. Do not fabricate a new label or silently route to an unsuitable runner to produce a complete-looking workflow.

The same named runner pool can need separate isolated instances/trust boundaries for PR and privileged jobs. Never assume specialization makes it safe to share a persistent host, secrets, caches, Docker socket, or signing environment with untrusted code; apply the common [runner isolation rules](security.md#secrets-runners-caches-and-evidence).
