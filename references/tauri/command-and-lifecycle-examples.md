# Tauri command and lifecycle examples

Scope: [Tauri profile](index.md). Read the relevant example when implementing [IPC](frontend-and-ipc.md) or [native jobs](desktop-and-runtime.md#background-work-and-operation-ownership). These are focused excerpts for existing owners, not a new architecture, mandatory scheduler, or complete app. General TypeScript/React and Rust rules remain in their language profiles.

## Serializable errors and short managed-state locks

In an owning Rust IPC module, return a deliberate wire error and an owned snapshot. Actual loading, persistence, validation, and internal diagnostic causes stay with the existing native owner.

```rust
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize)]
#[serde(tag = "code", rename_all = "snake_case")]
pub enum IpcError {
    Unavailable,
    JobNotFound,
    Cancelled,
    Failed,
}

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    pub dark_mode: bool,
}

#[derive(Default)]
pub struct PreferencesStore {
    pub current: Mutex<Preferences>,
}

#[tauri::command]
pub fn read_preferences(
    store: State<'_, PreferencesStore>,
) -> Result<Preferences, IpcError> {
    let snapshot = {
        let current = store.current.lock().map_err(|_| IpcError::Unavailable)?;
        current.clone()
    };

    Ok(snapshot)
}
```

Register `PreferencesStore::default()` with `manage` and the command in the existing invoke handler. Registration/extraction must use the same concrete type. The guard ends at the block: serialization, later I/O, and any `.await` use the owned snapshot. No extra `Arc<PreferencesStore>` is needed merely for state injection. Handle poison under the [Rust policy](../rust/safety-and-runtime.md#concurrency-and-shutdown).

Serde emits `{ "darkMode": false }` and, on the illustrated failure, `{ "code": "unavailable" }`. Command `Err` rejects `invoke`; it is not an HTTP response or successful error object. The wire enum is distinct from richer internal errors. Apply the [application-command ACL](security-and-capabilities.md#capabilities-permissions-and-application-commands), not just registration. See [commands/errors](https://v2.tauri.app/develop/calling-rust/) and [managed state](https://v2.tauri.app/develop/state-management/).

## Frontend contracts and feature-owned native access

In the owning feature's `Types/jobs.types.ts`, for example:

```ts
export type Preferences = {
    darkMode: boolean
}

export type NativeError = {
    code: 'unavailable' | 'job_not_found' | 'cancelled' | 'failed'
}

export type JobFinished = {
    jobId: string
}
```

Keep the actual preference type with its real domain; these excerpts use one small example feature. A focused guard in `validation.ts` recognizes the known wire error:

```ts
import type { NativeError } from './Types/jobs.types.ts'

export function isNativeError(value: unknown): value is NativeError {
    if (typeof value !== 'object' || value === null || !('code' in value)) {
        return false
    }

    return value.code === 'unavailable'
        || value.code === 'job_not_found'
        || value.code === 'cancelled'
        || value.code === 'failed'
}
```

Use it from the adapter's existing error normalizer where needed; unexpected rejections remain `unknown`. Map codes to safe translated messages in the UI workflow. `invoke<T>` does not validate success data or type the rejected value.

The feature's `native.ts` owns invocation and a window-targeted subscription:

```ts
import { invoke } from '@tauri-apps/api/core'
import type { UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import type { JobFinished, Preferences } from './Types/jobs.types.ts'

export function readPreferences(): Promise<Preferences> {
    return invoke<Preferences>('read_preferences')
}

export function requestJobCancellation(jobId: string): Promise<boolean> {
    return invoke<boolean>('cancel_job', { jobId })
}

export function subscribeJobFinished(
    onFinished: (event: JobFinished) => void,
    onInvalidPayload: (error: unknown) => void,
): Promise<UnlistenFn> {
    return getCurrentWebviewWindow().listen<unknown>('job-finished', event => {
        const payload = event.payload

        if (typeof payload === 'object' && payload !== null
            && 'jobId' in payload && typeof payload.jobId === 'string') {
            onFinished({ jobId: payload.jobId })
        } else {
            onInvalidPayload(new Error('Invalid job notification'))
        }
    })
}
```

The validated notification contains no result/secret; it triggers a reread. Larger payloads use the existing schema boundary. Callbacks are synchronous and handle any work/rejections they start. The native producer targets the intended window/webview. Events do not replace [native authorization](security-and-capabilities.md).

## Listener registration completing after cleanup

Inside the existing `use...Logic` hook, use the selected `jobId`, stable Query client, and an imported non-throwing `reportNativeError`. Import `subscribeJobFinished` from `native.ts` and `UnlistenFn` as a type. This observes completion without changing the public grouped hook return.

```ts
useEffect(() => {
    if (jobId === null) {
        return
    }

    let disposed = false
    let unlisten: UnlistenFn | undefined

    const refreshJob = () => {
        void queryClient.invalidateQueries({ queryKey: ['jobs', jobId] })
            .catch(reportNativeError)
    }

    void subscribeJobFinished(
        event => {
            if (!disposed && event.jobId === jobId) {
                refreshJob()
            }
        },
        error => {
            if (!disposed) reportNativeError(error)
        },
    ).then(stop => {
        if (disposed) {
            stop()
        } else {
            unlisten = stop
            refreshJob()
        }
    }).catch(error => {
        if (!disposed) reportNativeError(error)
    })

    return () => {
        disposed = true
        unlisten?.()
    }
}, [jobId, queryClient])
```

If cleanup precedes registration, the late unlisten function runs immediately. Old callbacks cannot update a new job. Refreshing after registration reconciles earlier completions. Handle registration failure through the normal UI error/retry policy rather than declaring readiness. If every early message matters, await readiness before starting work; this observer Effect is not a start barrier. See [event delivery](https://v2.tauri.app/develop/calling-frontend/) and the [shared Effect rules](../typescript/frontend.md#effects-own-setup-and-cleanup).

## Cooperative native cancellation with verified ownership

The existing native admission owner allocates a unique ID, bounds concurrent work, and registers a record before starting its worker. It records the verified initiating window, not a client-provided owner. The record and worker share one flag. These excerpts reuse the wire `IpcError` above; actual job/domain types remain with their Rust owner.

```rust
use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

pub struct JobControl {
    pub owner_window: String,
    pub cancel_requested: Arc<AtomicBool>,
}

#[derive(Default)]
pub struct JobRegistry {
    pub running: Mutex<HashMap<String, JobControl>>,
}

pub fn request_cancel(
    jobs: &JobRegistry,
    caller_window: &str,
    job_id: &str,
) -> Result<bool, IpcError> {
    let running = jobs.running.lock().map_err(|_| IpcError::Unavailable)?;
    let job = running
        .get(job_id)
        .filter(|job| job.owner_window == caller_window)
        .ok_or(IpcError::JobNotFound)?;

    Ok(!job.cancel_requested.swap(true, Ordering::Relaxed))
}

#[tauri::command]
pub fn cancel_job<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    jobs: State<'_, JobRegistry>,
    job_id: String,
) -> Result<bool, IpcError> {
    request_cancel(&jobs, window.label(), &job_id)
}
```

Tauri injects caller identity. Missing/foreign jobs share a safe error; an ID is not authority. Enforce finer principal/resource ownership where required. Register the exact `JobRegistry` type and use the established ACL. The runtime generic belongs to the Tauri adapter, not every domain operation.

`true` means newly requested cancellation; `false` means already requested. Neither confirms the worker stopped. `Relaxed` suffices for this Boolean signal, not publication of other data. Reuse an existing cancellation token if its async/wakeup support helps; no new crate is required for this example.

An independent core worker checks between bounded units and returns its own domain error:

```rust
#[derive(Debug)]
pub enum WorkError {
    Cancelled,
    Failed,
}

pub fn process_items(
    items: &[String],
    cancel_requested: &AtomicBool,
    mut process_item: impl FnMut(&str) -> Result<(), WorkError>,
) -> Result<(), WorkError> {
    for item in items {
        if cancel_requested.load(Ordering::Relaxed) {
            return Err(WorkError::Cancelled);
        }

        process_item(item)?;
    }

    if cancel_requested.load(Ordering::Relaxed) {
        return Err(WorkError::Cancelled);
    }

    Ok(())
}
```

Run genuinely blocking/CPU work through an owned blocking worker. For example, inside the existing async orchestration, with owned `items`, a cloned job flag, and a suitable owned `process_item` function:

```rust
let outcome = match tauri::async_runtime::spawn_blocking(move || {
    process_items(&items, &cancel_requested, process_item)
})
.await
{
    Ok(result) => result.map_err(|error| match error {
        WorkError::Cancelled => IpcError::Cancelled,
        WorkError::Failed => IpcError::Failed,
    }),
    Err(_) => Err(IpcError::Failed),
};
```

Pass `outcome` to the existing finalization path before returning: record terminal state and retire the entry on success, cancellation, operation error, and join failure. Emit completion after recording authoritative state; observe send errors without losing it. Retain/await handles under the shutdown policy. This excerpt deliberately does not invent a separate start/finalization API.

Cancellation cannot interrupt a blocking unit that never checks, undo writes, or guarantee that a racing successful completion becomes cancelled. Keep units bounded and preserve/report partial effects. The frontend cancel handler requests cancellation and reconciles state; it does not mark completion merely because `cancel_job` resolved. See [native lifecycle rules](desktop-and-runtime.md#background-work-and-operation-ownership) and [async commands](https://v2.tauri.app/develop/calling-rust/#async-commands).
