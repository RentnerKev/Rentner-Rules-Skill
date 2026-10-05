# Tauri profile

Status: established conventions for Tauri applications, with current Tauri v2 as the baseline for new projects. Identify the actual app, version, platform targets, commands/plugins, and configuration first. Preserve coherent existing projects; a v1 application needs a scoped migration decision rather than silently receiving v2 configuration.

Select this profile before general hybrid when the affected application is Tauri, even in a larger repository containing other web/core products. Tauri keeps its frontend plus `src-tauri/` arrangement and native IPC. The [general hybrid profile](../hybrid/index.md) governs a different product arrangement and is not a prerequisite for this profile.

## Compose the existing rules

| Scope | Source and Tauri difference |
| --- | --- |
| TypeScript WebView frontend | [TypeScript profile](../typescript/index.md): retain feature ownership, presentation/hooks, grouped returns, `Components/`/`Hooks/`/`Types/`, config purity, Tailwind, and tests; use the frontend/runtime override below |
| Native Rust code | [Rust profile](../rust/index.md): retain modules, ownership/errors, Cargo, tests, safety, and concurrency; add Tauri adapters at the edge |
| JavaScript/TypeScript tooling | The single shared [JS/TS tooling policy](../typescript/tooling.md) |
| Tauri integration | This profile's focused references below |

For new normal desktop frontends, prefer React, strict TypeScript, Vite, TanStack Router/Query/Form, Tailwind, and suitable installed RentnerPackages. Deliver client assets to the WebView. TanStack Start, SSR, Server Functions, a TypeScript server, and an internal Axum/HTTP server are not desktop defaults. A genuinely required separate server is an additional component with its own boundaries.

Read the TypeScript frontend/architecture rules through this override: routes are client routes; native work uses feature `native.ts`; server-only adapters, `src/server`, HTTP semantics, and server naming apply only where a real server exists. Do not introduce a second hook architecture or replace existing ownership with lowercase example folders.

The default operation direction is:

`React component → owning hook/query/mutation → native.ts → Tauri IPC adapter → Rust core → native infrastructure`

Shared authorization, secret, generated-file, migration, and handover restrictions remain in [SKILL.md](../../SKILL.md). Profile selection does not grant native-operation or release permissions.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Root/source layout, bootstrap, core independence, config, managed-state ownership, optional servers | [Architecture](architecture.md) |
| `native.ts`, Query/mutations, commands/channels/events, typed contracts, errors, subscriptions | [Frontend and IPC](frontend-and-ipc.md) |
| WebView trust, capabilities/permissions, custom-command exposure, CSP, paths/processes/protocols | [Security and capabilities](security-and-capabilities.md) |
| Background work, window/app lifecycle, persistence, multi-window, sidecars, optional desktop features | [Desktop and runtime](desktop-and-runtime.md) |
| Versions/plugins, development/builds, test placement, desktop E2E, CI, bundling/signing/updates | [Workflow and verification](workflow-and-verification.md) |
| CI/CD provider, workflows/scripts, dependency automation, releases, repository metadata | [Shared deployment routing](../deployment/index.md), retaining this profile's native delivery override |
| Deployment of additional actual server services | [Server deployment models](../deployment/deployment-models.md); desktop delivery remains installer/bundle/updater |

Load the details affected by the task. A UI-only edit does not require redesigning native services, creating every sample module, or building all installers.
