# Tauri architecture

Scope: [Tauri profile](index.md). Apply existing language architecture with the explicit frontend override; this reference owns Tauri integration and bootstrap decisions.

## Keep the Tauri project shape

For a new normal application, keep frontend tooling/source at the app root and the Cargo application in `src-tauri/`:

```text
project/
├── package.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── router.tsx
│   ├── routes/
│   ├── features/
│   ├── shared/
│   └── tests/
└── src-tauri/
    ├── Cargo.toml
    ├── Cargo.lock
    ├── build.rs
    ├── tauri.conf.json
    ├── capabilities/
    ├── icons/
    ├── src/
    │   ├── main.rs
    │   ├── lib.rs
    │   ├── ipc.rs
    │   └── documents.rs
    └── tests/
```

This is an ownership example, not mandatory scaffolding. Create only actual modules and generated/tool-required resources. Respect existing package-manager/config alternatives and meaningful frontend/Cargo workspaces; do not migrate Tauri to the general hybrid `web/` + `core/` layout. The official [project structure](https://v2.tauri.app/start/project-structure/) explains Tauri's Cargo/build/config files.

Inside `src/`, reuse the [TypeScript architecture](../typescript/architecture.md), including its feature folders and `src/shared`/`src/lib` split. `native.ts` replaces the normal server adapter for native calls; no empty `middleware.ts`, `server.ts`, or `src/server` is needed. Keep client routes and bootstrap focused. Inside `src-tauri/src/`, reuse [Rust architecture](../rust/architecture.md); frontend and Rust shared implementations stay language-local.

## Bootstrap and native boundaries

Keep desktop `main.rs` as a thin call to the library's bootstrap/run function. `lib.rs` composes Tauri setup, deliberate command registration, needed plugins, managed resources, and lifecycle hooks. Retain applicable generated mobile entrypoint attributes when the existing app supports mobile; this desktop profile does not invent a mobile architecture.

Move growing responsibilities into owned modules such as `ipc.rs` + `ipc/documents.rs`, `state.rs` + meaningful children, and `desktop.rs` + window/lifecycle handlers. Keep the domain near its owner, for example `documents.rs` with children when needed. Group cohesive commands by capability/domain; one file per command, one crate per layer, and fixed sample modules are not requirements.

Commands receive/validate input, obtain trusted context/state, call the core operation, and map the result to the IPC contract. Keep business policy out of command bodies. Avoid growing `lib.rs`, `ipc.rs`, `main.tsx`, or `router.tsx` into collections of unrelated implementations; use the language profiles' cohesion criteria rather than a new line limit.

Reusable domain/core functions accept ordinary Rust values and dependencies. Keep `AppHandle`, `WebviewWindow`, `State`, event emission, and plugin wiring in IPC/desktop adapters unless the operation itself truly owns that integration. Do not make the core import its adapter. Testability does not require a trait for every function or a separate crate by default.

## Managed resources and configuration

Use Tauri managed state for needed long-lived pools, clients, stores, workers, or device/process services. Split resources by responsibility and register/access the same concrete types; a mismatched managed-state type can fail at runtime. Tauri already manages shared ownership, so an additional `Arc` is justified by actual ownership needs, not habit. Select synchronization using the existing [Rust concurrency rules](../rust/safety-and-runtime.md#concurrency-and-shutdown), not one giant `Mutex<Everything>`. See [Tauri state management](https://v2.tauri.app/develop/state-management/).

Frontend state owns visible dialogs, form drafts, selections, and presentation. Rust owns authoritative native resources, persistent settings/data, and core workflows. Query caches expose projections; do not create two independent authoritative settings/process states. Window-local state and app-global state need explicit owners.

Keep Tauri build/bundle/security configuration in the appropriate Tauri files; runtime application config follows [Rust config rules](../rust/architecture.md#config-shared-code-and-platform-code). User settings and secret storage have separate lifecycles. Do not put every runtime value or secret into `tauri.conf.json`; frontend build variables and bundled resources are public distribution inputs. See [Tauri configuration](https://v2.tauri.app/develop/configuration-files/).

## A server only for a real external interface

Use Tauri IPC for ordinary internal frontend/native operations. Vite's development asset server is tooling, not a production native API. Do not install Axum or another server simply because Rust implements backend-like work.

If the product actually serves browser/device/network clients, companion applications, or another process requiring HTTP/WebSocket, treat that server as an additional component. A coherent `server.rs` + children or existing suitable crate can own its routes, extractors, real HTTP/Tower middleware, binding/authentication policy, limits, and shutdown. Research current server dependencies then; no HTTP framework or server folder is a Tauri default. IPC keeps its own validation/permissions/state/mapping rules rather than copying HTTP middleware into commands.

For existing projects, inspect app/version, frontend/native boundaries, command registration, resources/plugins, consumers, build paths, and concrete problems before refactoring. Preserve working contracts and introduce only requested improvements. Official Tauri sources above were checked on 2026-10-02; recheck version-dependent decisions.
