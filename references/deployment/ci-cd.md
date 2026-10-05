# Shared CI/CD

Scope: [deployment routing](index.md). Compose with the selected language/project verification rules and the active provider. Use [automation security](security.md) for every workflow and script decision.

For container image workflows, use [Docker/Compose](docker-and-compose.md). For actual server delivery, also select the [operating model](deployment-models.md) independently of CI provider/language and use relevant [operations verification](operations.md#infrastructure-verification). A CLI distribution or build-tool image does not select a server model. Separate language checks can still assemble one product image; runtime topology does not change the specialized Forgejo job routing.

## Select workflows from evidence

Workflows are capabilities, not a required file count. Reuse suitable existing jobs, combine small related checks, and split jobs/workflows when their triggers, permissions, failure reporting, runtime, or artifact boundaries differ.

| Capability | Select when |
| --- | --- |
| CI | The repository has source, packages, documentation, or artifacts with real verification commands; include relevant PRs, default-branch pushes, and useful manual execution |
| Conventional Commit PR title | The repository uses typed PR titles; include title edits as well as open/reopen/source changes |
| Workflow lint | Actions workflows exist; check syntax/expressions, action inputs, and security policy with tools appropriate to the provider |
| Gitleaks | Secret scanning is needed; cover incoming PR/push commits and offer a manual full-history scan where useful, with findings redacted |
| Dependency audit / scheduled security | Actual dependency ecosystems or shipped artifacts need advisory checks, including new advisories without source changes |
| CodeQL / dependency review / Scorecard | GitHub feature availability, language support, repository risk, and existing security coverage justify each distinct check |
| Labeling / issue and PR templates / ownership | Maintainers and consumers benefit from those metadata workflows; use actual areas, labels, and owners |
| Release notes / release pipeline | Published releases or a defined release process exist |
| Dev/live publish | Containers or other distributable artifacts have real channels and destinations; derive triggers from the product |
| Preview build/publish | A useful isolated preview channel and safe artifact handoff exist; not an automatic library, CLI, or desktop feature |
| Release compatibility | Independently updated components, API/protocol consumers, or persisted formats have a promised compatibility window |
| Smoke / runtime reliability / scale | A shipped runtime has concrete startup, operation, lifecycle, or capacity requirements and isolated fixtures; use bounded representative checks |

Choose suitable dependency, container, SBOM, and static analysis checks for scheduled security. Reuse existing coverage; do not install every scanner or duplicate the same advisory check without a benefit. Configure meaningful severity/policy decisions and narrow reviewed exceptions. An unavailable scanner/database or stale advisory fetch is not a successful check.

## Compose the project verification matrix

| Project | Applicable verification and artifact boundaries | Do not infer |
| --- | --- | --- |
| TypeScript-only | Actual package manager and frozen lockfile, [shared JS/TS tooling](../typescript/tooling.md), typecheck/tests/build from [TypeScript verification](../typescript/workflow-and-verification.md); frontend/backend and container checks only where present | Rust/Cargo jobs, Rust CodeQL, hybrid compatibility, or Rust runtime checks |
| Rust-only | Actual Cargo manifests/targets, locks, toolchain/MSRV, supported feature combinations, rustfmt/Clippy/tests/docs and relevant release packaging under [Rust verification](../rust/testing-and-verification.md) and [Cargo tooling](../rust/cargo-and-tooling.md) | Bun/React/TanStack/web checks or a JS runtime merely to orchestrate Cargo |
| Non-Tauri TypeScript + Rust hybrid | Independently runnable language checks, genuine contract/drift and integration checks; root JS/TS tooling and Cargo ownership from [hybrid coordination](../hybrid/workflow-and-verification.md) | A duplicate web package, every feature/target combination, one mandatory version, or a container per language |
| Tauri | Frontend plus native checks, IPC/capabilities/config/resources, real platform runners/builds, bundles and protected signing/updater verification from [Tauri delivery](../tauri/workflow-and-verification.md) | General hybrid layout, Docker/server deployment, web previews, or identical build/signing support on every OS |

For other repository types, preserve their existing verification and check the actual deliverable. Do not add TypeScript/Rust application tooling to a documentation-only repository.

Path filters and caches must include relevant root manifests/locks/toolchain configs, provider scripts/workflows, shared contracts/generators, native resources, and build inputs. A boundary change can require both languages even when only one source area changed. Required checks must still produce the status expected by branch protection when work is skipped; do not leave required workflows permanently pending through inappropriate filters.

Use the project's pinned toolchains and declared support policy. Research current stable primary sources before a new tool/version/action decision. Versions in RentnerProxy or TanstackDummy are observations, not permanent skill defaults. Check action runtime requirements against the real runner. Cross-compilation does not prove native execution or installer behavior.

## Provider ownership and workflow scripts

CI/CD-only scripts belong to the repository's provider infrastructure. Preferred paths, created only for actual content:

```text
.github/ or .forgejo/
├── workflows/
├── scripts/
│   ├── ci/
│   ├── security/
│   ├── release/
│   ├── deploy/
│   └── lib/
└── assets/
    └── release-banners/
```

Provider references define updater and metadata files. Do not create empty directories or dummy files to match this tree. Preserve a coherent existing flat script layout unless a scoped reorganization helps actual ownership.

- Workflow YAML primarily orchestrates triggers, jobs, dependencies, permissions, environments, and artifacts. Single clear commands can stay inline; do not create a script for every one-liner.
- Extract complex reusable logic into the appropriate provider script area. Use `scripts/lib/` for coherent shared script helpers rather than an unspecific `utils/` collection.
- Shell suits process orchestration. TypeScript or another installed language can suit structured validation/API/data logic. Choose for clarity, safety, runner support, and testability; neither Bash nor TypeScript is mandatory. Auxiliary JS/TS still follows the [central tooling policy](../typescript/tooling.md).
- Repository-root `scripts/` can own genuine application development/build orchestration or shared product tooling, as in the [hybrid architecture](../hybrid/architecture.md). Do not move provider-exclusive scripts there by default; application/source paths and language test layout stay with their profiles.
- Use explicit working directories, manifests, inputs/outputs, exit codes, and owned temporary resources. Separate read-only verification from fixes and external writes; keep policy consistent across callers rather than maintaining divergent inline copies.

## Verify an infrastructure change

Inspect the executable chain before running it: package scripts, shell wrappers, Cargo aliases/build scripts, Docker build stages/entrypoints, and release/deploy hooks. Apply the [migration boundary](security.md#migration-and-side-effect-boundary) before execution.

Validate changed YAML/config against the active provider and installed updater schema. Check referenced scripts/actions, inputs, executable invocation, secret names/permissions, events, title edits, path filters, timeouts, cancellation/serialization, artifact identity, and actual label/category references. Exercise meaningful success and rejection paths in new structured scripts; lint shell and check types where the established tools support it. Test locally without publishing/deploying or reading secret values.

Review the diff and report exactly which checks/configurations passed, which provider/platform behavior remains unverified, and concrete maintainer prerequisites. Preserve the existing language verification and [shared handover rules](../../SKILL.md#work-safely-and-finish-the-task).
