# Tauri desktop and runtime

Scope: [Tauri profile](index.md). Put Tauri/window/tray/lifecycle integration in a meaningful `desktop.rs`/`desktop/` area when needed; domain computation and owned native services remain under [Rust rules](../rust/index.md).

## Background work and operation ownership

Use the existing [Rust concurrency and shutdown rules](../rust/safety-and-runtime.md#concurrency-and-shutdown) for async I/O, blocking/CPU workers, bounds, ownership, synchronization, and partial effects. Tauri integration additionally owns who starts a job, its progress recipient, and what survives window closure or app exit.

Do not block the WebView/event-loop thread or an async executor with OCR, compression, hashing, large file operations, or synchronous subprocess waits. Select the appropriate runtime blocking facility, owned worker, or pool for actual work; `async fn` alone does not make CPU/blocking work asynchronous. Avoid a second runtime or unlimited parallel jobs merely because commands can be async.

Use channels for sustained progress and events for suitable notifications under the [IPC rules](frontend-and-ipc.md#commands-channels-and-events). Bound native admission and progress output, handle consumer loss, and retain tasks/child handles when completion/cleanup matters. Define cancellation and cleanup explicitly; a frontend timeout, dropped subscription, or lost window does not roll back committed native effects or necessarily stop blocking work.

## Window and application lifecycle

Distinguish closing a window, hiding it to a tray, stopping one operation, and exiting the whole app. Multi-window/tray products need a documented last-window/explicit-exit policy and a way to actually quit; do not leave invisible processes unintentionally.

At actual app exit, coordinate rejecting new work, cooperative cancellation/drain, persistence, and joining owned workers/processes within bounded time. Use the installed Tauri lifecycle/exit APIs and avoid synchronous deadlocks on the event loop. Do not rely on destructors or an immediate process exit to flush critical settings or finish jobs. Keep crash recovery separate from orderly shutdown.

For multi-window apps, assign native resources, operation ownership, query reconciliation, and capabilities per actual recipient. Target notifications instead of broadcasting private results globally. A shared Rust settings store can notify windows to reread their projections; do not let each window maintain an independent authoritative copy. Restore subscriptions/state on reload and dispose them when the owner disappears.

Use [Tauri's process model](https://v2.tauri.app/concept/process-model/) and current platform APIs when lifecycle behavior changes. Platform-specific Rust work follows existing encapsulation rules; do not scatter identical `cfg` policy across every module.

## Persistence and recovery

Choose files, a local database, a maintained settings plugin, or secure storage according to the data's durability/security/query needs. Browser `localStorage` is suitable for disposable UI preferences when appropriate, not an automatic authority for the desktop app's core data or credentials.

Own native settings/data paths explicitly using the platform's appropriate application directories. Apply Rust's atomic replacement, overwrite, validation, and crash-durability rules where promised. Define persisted format versions and recovery/backup behavior for important data, handling corrupt/old files without silently discarding user data. Compatibility design does not authorize database migration generation/execution; the shared migration restrictions remain in force.

Keep offline behavior explicit where the feature needs it: authoritative local data, queued external work, reconnect/retry policy, and conflict handling. Do not add an offline synchronization framework to an app with no such workflow.

## Optional desktop integrations

Introduce only features the product uses; keep their plugin setup and permissions aligned with actual supported platforms:

| Feature | Integration decisions |
| --- | --- |
| Tray and notifications | Explicit app/window lifetime; targeted actionable messages; no secret payloads; platform/permission behavior |
| Deep links/file associations | Validate schemes/routes/paths and payloads as external input; handle cold start and already-running delivery; establish readiness and duplicate handling |
| Updater | Trusted endpoints, signed artifacts, compatible versions/data, user interaction, and safe shutdown/restart; follow [release verification](workflow-and-verification.md#bundles-signing-and-updates) |
| Sidecar/process manager | Needed binary per platform/architecture, validated invocation, bounded output, readiness/failure handling, and owned-process cleanup |

Deep links cannot authenticate an operation by themselves. If single-instance/deep-link plugins are used, preserve their documented registration order and platform delivery behavior; do not discard a cold-start link before the UI/native services are ready or log credential-bearing URLs. See [deep linking](https://v2.tauri.app/plugin/deep-linking/).

For sidecars, use Tauri's configured bundle paths and matching target-specific binaries; do not accidentally choose the build host's binary during cross-compilation. Resolve [bundled resources](https://v2.tauri.app/develop/resources/) through the application's resource APIs rather than the current working directory. Treat resources as distribution assets; place writable state in appropriate app data paths. See [embedding external binaries](https://v2.tauri.app/develop/sidecar/).

## Observability and crash handling

Reuse Rust logging/tracing and shared privacy rules. Correlate commands, jobs, channels, and native failures where useful; frontend and Rust logs can differ while sharing safe operation context. Bound logs/output and avoid recording personal document contents, credentials, private paths, or raw invocation payloads.

Handle expected native errors through the IPC contract; panics are not a domain-error policy. Preserve useful safe diagnostics and recovery behavior for interrupted jobs. Add crash reporting only for an actual operational requirement, with appropriate consent/data minimization and release-symbol handling. Do not install a new tracing or telemetry stack by default.

Primary sources above were checked on 2026-10-02. Optional desktop features require current plugin/platform research and focused tests of their actual lifecycle.
