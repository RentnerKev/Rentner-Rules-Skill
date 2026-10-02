# Tauri frontend and IPC

Scope: [Tauri profile](index.md). Reuse [frontend hook/presentation rules](../typescript/frontend.md) and [TypeScript ownership](../typescript/architecture.md); this reference defines the native adapter and IPC choices.

## Feature-owned native access

Place native calls in the owning feature's `native.ts`, alongside its existing `Components/`, `Hooks/`, `Types/`, and `validation.ts` when needed. Reusable native domain operations can use a meaningful UI-free lib module under the existing ownership rules. Do not scatter `invoke()` throughout routes, components, and unrelated hooks, or introduce a generic wrapper per trivial call.

For example, a frontend adapter with existing input/result contracts can be:

```ts
import { invoke } from '@tauri-apps/api/core'
import type { AnalyzeDocumentInput, AnalyzeDocumentResult } from './Types/documents.types.ts'

export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentResult> {
    return invoke<AnalyzeDocumentResult>('analyze_document', { input })
}
```

The corresponding registered command must accept an `input` argument with the agreed wire shape. Match command names, JS argument keys, Serde field/enum names, and return/error serialization explicitly. Tauri command arguments normally use camelCase keys for snake_case Rust parameters unless configured otherwise; that does not automatically rename fields inside a serialized DTO. Use current [Tauri v2 command APIs](https://v2.tauri.app/develop/calling-rust/), not old v1 import paths.

Keep Rust/domain error decoding and safe frontend error normalization at the adapter when needed. Catch values start as `unknown`; validate known external errors rather than casting arbitrary rejections to `NativeError`. An `invoke<T>` generic is a compile-time expectation, not runtime validation or proof that the Rust response matches it.

The owning `use...Logic` hook uses TanStack Query for async native reads and mutations for meaningful native changes/actions. It retains the existing grouped return contract; presentation consumes the selected values/actions. Keep ordinary dialog, selection, and temporary UI state local. Mutations update/invalidate the relevant query cache; native change notifications can trigger the same reconciliation. Preserve scoped query keys and do not duplicate Rust's authoritative state in independent React state.

Choose retry behavior for actual native operations. Avoid accidental repetition of destructive/expensive commands through query retry, refetch, or remount behavior; configure the installed Query version and operation's idempotency accordingly. A dismissed UI or cancelled query does not cancel a running native command automatically.

## Commands, channels, and events

| Need | Tauri primitive |
| --- | --- |
| Request/response, returning data or a domain result | Registered command; the normal operation default |
| Ordered progress or sustained/frequent Rust-to-frontend data | Channel, with operation ownership and lifecycle |
| Small loose notifications or a multi-listener broadcast | Event, targeted to the intended recipients |

Use cohesive operations rather than one IPC call per internal Rust step. Keep the Rust IPC adapter thin and register deliberate public commands centrally through the app's invoke handler. Group related commands in an IPC domain module as size warrants.

Channels are designed for ordered delivery, but do not imply unlimited buffering, durability, automatic producer cancellation, or successful processing by the UI. Bound payloads/work, handle failed sends or lost consumers, and define completion/failure/cancellation states. Events do not provide request/response error semantics or fine-grained capability control of their payloads/event names; do not use them to bypass command permissions or broadcast secrets. Follow [Tauri frontend delivery guidance](https://v2.tauri.app/develop/calling-frontend/).

Use operation/correlation IDs for concurrent jobs when useful. Keep progress relevant to its owning request/window; a delayed message from a previous operation must not overwrite the next one's state. Subscribe before starting work when missing an early notification matters, and reconcile authoritative state on startup/reconnect instead of treating transient events as durable storage.

Frontend native event subscriptions return an unlisten function asynchronously. Own registration/disposal in a focused hook or adapter lifecycle: clean up on unmount, remount, or owner change, including registration completing after disposal. Avoid duplicate listeners under React Strict Mode and retain Rust listener/task handles when their lifetime matters. Query/React cancellation requires a deliberate native cancellation command or cooperative job mechanism for cancellable work.

## Contracts and external errors

Keep concrete command input/result/progress/error types with their language owner. Avoid `any`, unstructured `serde_json::Value`, or opaque maps for a known contract; genuinely open data starts as untrusted and needs its own validation. Domain models, IPC DTOs, and frontend models can differ where responsibilities differ, without mandatory DTO copies.

For small interfaces, manual types with a clear authoritative contract and shared serialization fixtures can suffice. At larger scale, evaluate a maintained current binding/schema generator against actual Tauri v2, Serde, TypeScript, enum/null/number, and plugin compatibility. Do not mandate one crate or add generation just for a few fields. Document source, generator/version/command, output owners, and committed-vs-build-generated policy; check deterministic drift and new outputs in CI. Regenerate rather than hand-edit outputs.

Define wire semantics for field casing, absence/null, discriminants, integer precision, time/binary encoding, and error codes. Tauri JSON IPC does not make wide Rust integers lossless JavaScript numbers; select a bounded or explicit lossless representation where needed. Preserve readers and persisted contracts when schemas evolve, and check old/new compatibility if components or stored data can outlive a build. These are contract decisions, not a requirement to apply general hybrid repository architecture.

Keep typed internal Rust errors under the [Rust error rules](../rust/coding.md#errors-and-invariants). Map expected IPC failures to a small serializable representation with stable machine-readable codes and safe display information when clients distinguish them. Tauri command `Result` errors reject the frontend promise; test that rejection shape as well as successful values. Never forward raw `Debug`, source chains, credentials, or sensitive file contents merely to make serialization easier. Reuse existing domain validation instead of maintaining a second frontend policy authority.

Test actual names, argument shapes, serialization, error codes, progress ownership, and subscription cleanup through the [Tauri verification strategy](workflow-and-verification.md). Primary sources above were checked on 2026-10-02; verify current APIs and generator support before integration.
