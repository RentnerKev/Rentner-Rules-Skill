# Tauri workflow and verification

Scope: [Tauri profile](index.md). Reuse [TypeScript verification](../typescript/workflow-and-verification.md), the shared [JS/TS tooling policy](../typescript/tooling.md), and [Rust verification](../rust/testing-and-verification.md); this reference coordinates Tauri integration, platform delivery, and release checks.

## Current versions and useful dependencies

For a new project, verify current stable Tauri v2, compatible `tauri`/`tauri-build`, CLI/API packages, Rust/MSRV, frontend/runtime tools, and actual platform prerequisites from official docs/releases. Compatible packages/plugins need not share one identical version number. Preserve the chosen package manager, lockfiles, features, and established toolchain policy under the language dependency rules.

Prefer a maintained official plugin when it meets a concrete need. Check third-party/official provenance, current Tauri/API/Serde compatibility, permissions/scopes, supported platforms, security advisories, maintenance, and bundle/native-dependency impact. Do not install unused plugins, a binding generator, Axum, or a JavaScript server because a tutorial includes them. See [Tauri dependency updates](https://v2.tauri.app/develop/updating-dependencies/) and [platform prerequisites](https://v2.tauri.app/start/prerequisites/).

Read existing Tauri version/config/schema before edits. Use v2 command imports and capabilities in v2 applications; a v1 migration follows the [official migration guide](https://v2.tauri.app/start/migrate/from-tauri-1/) and a concrete compatibility plan within the request. Do not mix v1 global allowlist, config fields, or plugin APIs into v2 examples.

## Development and frontend/native builds

Keep meaningful package scripts for frontend development/build, native development, tests, typecheck, lint, formatting, and optional combined verification. Use the installed CLI and actual scripts; do not assume every repository has `verify`. The shared tooling policy defines lint/format commands once for all JS/TS profiles.

Align Vite's fixed dev port/host and Tauri `devUrl`, its output directory and `frontendDist`, and actual `beforeDevCommand`/`beforeBuildCommand` scripts. Avoid dev port fallback silently disconnecting the WebView. The Vite asset server is not an additional native HTTP API. Ensure the packaged app loads built assets without a running Vite/SSR server. Follow the current [Tauri Vite configuration](https://v2.tauri.app/start/frontend/vite/) rather than copying historical browser target/version pins.

Keep root JS dependencies/lockfiles and `src-tauri` Cargo dependencies/lockfiles separate. When `tauri build` invokes the frontend build hook, account for that real dependency rather than running redundant full builds or hiding side effects in unrelated tests. Inspect `build.rs`, CLI hooks, wrapper scripts, and plugin initialization for forbidden migration/secret/service actions before verification.

## Test placement and boundary coverage

| Test | Location and purpose |
| --- | --- |
| Frontend behavior | Existing `src/tests/` layout, mirroring source; native calls controlled through the owning adapter |
| Rust domain/native behavior | Crate-root `src-tauri/tests/`, plus the Rust profile's justified private-unit/doctest exceptions |
| Actual desktop/system integration | Optional root `tests/e2e/` or an established distinct suite, only for real cross-component risks |

Keep core behavior testable without starting a WebView. Native crate compilation can still need the platform toolchain/libraries; that is different from requiring a live UI in every Rust test. Extract a reusable core crate only if actual reuse or native dependency/platform constraints justify it.

Frontend behavior tests can replace the `native.ts` adapter or use Tauri's current `mockIPC`/window mocks. Assert actual command/argument/error/progress behavior where relevant and clear mocks/listeners between tests. TypeScript generics and mocked responses do not prove Rust serialization, command registration, capabilities, CSP, or packaged app behavior. See [Tauri API mocking](https://v2.tauri.app/develop/tests/mocking/).

For IPC changes, verify real registered names, command argument casing vs DTO casing, success/rejection serialization, native validation, and allowed/denied callers. Include subscription cleanup/remount, concurrent progress ownership, cancellation/partial work, persistent compatibility, and resource/process scope cases when changed. Tauri's mock runtime can exercise adapters without executing native WebView libraries; choose it when it actually verifies the integration. See [Tauri testing](https://v2.tauri.app/develop/tests/).

For genuine desktop E2E, choose a currently supported runner/driver for the promised platforms. The current [WebDriver guide](https://v2.tauri.app/develop/tests/webdriver/) describes the WebdriverIO Tauri service with an embedded provider for Windows/Linux/macOS and direct `tauri-driver` for Windows/Linux. Check the actual provider/plugins/prerequisites; do not infer macOS support from a different driver mode or repeat an old blanket unsupported-platform claim. Keep test automation plugins/servers out of production builds and use isolated app data, bounded readiness/timeouts, and owned-process cleanup.

## CI and final review

Use the existing CI provider and a proportionate pipeline:

- Run TypeScript typecheck, the central lint/format checks, affected frontend tests, and an appropriate frontend build.
- Run Rust formatting/check/Clippy/tests and suitable dependency/security checks with the actual manifest, lock, features, and platform flags from the Rust profile.
- Add contract-generation drift, Tauri packaging/smoke tests, and promised platform builds where the change warrants them. Do not rebuild every installer for every local UI edit.
- Include config/capabilities/plugins, shared contracts/generators, resources/sidecars, and root orchestration in affected-check selection. A path filter must not skip native checks when shared inputs change.
- Use real supported runners/native libraries and relevant Windows/Linux/macOS targets. Cross-compilation alone does not verify OS integrations, WebView behavior, or installation.

Inspect resulting Git changes and generated output. Review bootstrap/command registrations, managed-state types, capability unions/custom-command ACL, CSP/navigation, subscriptions/jobs/shutdown, frontend assets, platform resources, and changed persistence contracts where relevant. Report exact tested configurations, existing failures, skipped native/E2E infrastructure, and remaining maintainer steps without claiming broader coverage.

## Bundles, signing, and updates

Keep identifier, app version, icons, resource paths, installer targets, and platform configuration consistent with the actual product. Do not depend on the developer working directory or ship private config, credentials, debug automation servers, and build-only artifacts. Verify packaged startup and the changed OS integrations on the appropriate platform before promising their support.

Code signing/notarization and updater artifact signing serve different checks. Plan actual [Windows signing](https://v2.tauri.app/distribute/sign/windows/) and [macOS signing/notarization](https://v2.tauri.app/distribute/sign/macos/) for the distribution channel; a debug/native compilation is not evidence of a valid distributable installer. Use protected release infrastructure without reading/printing private keys or embedding them in source/assets.

If updates are used, follow the [Tauri updater](https://v2.tauri.app/plugin/updater/) signature verification, trusted endpoint/public-key configuration, correct platform/architecture artifacts, and compatible application/persisted-data versions. Test invalid signatures, unavailable updates, interrupted work, and safe restart where relevant. Preserve key continuity for installed clients; do not disable verification or rotate keys without a compatibility plan. Signing an updater artifact does not replace OS signing/notarization.

Build/validate only within the authorized scope. Signing-key creation/rotation, release publication, deployment, and database migrations are separate actual authorization boundaries; documented compatibility/migration considerations do not authorize running migrations.

Primary sources above were checked on 2026-10-02. Recheck current Tauri/OXC/plugin/platform support before choosing versions, test providers, or release tooling.
