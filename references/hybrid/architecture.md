# Hybrid architecture

Scope: [Hybrid profile](index.md). This reference defines repository separation and responsibility boundaries; internal TypeScript and Rust architecture stays in the existing language profiles.

## Default repository layout

For new normal projects, prefer `web/` for TypeScript and `core/` for Rust:

```text
project/
├── web/
├── core/
├── docs/           # when repository-wide documentation needs it
├── .forgejo/       # when Forgejo is the CI provider
├── renovate.json  # when Renovate is used
└── README.md
```

Only the two source areas define the language separation. A small project can start with `web/` and `core/`; do not create empty documentation, CI, config, or contract placeholders. The tree is an example, not a mandate to change providers or install tools. Root `.github/`, `.editorconfig`, `.gitignore`, container/compose files, and other project-wide files are valid when they serve the actual repository.

| Area | Local tooling and source ownership |
| --- | --- |
| `web/` | `package.json`, the selected package-manager lockfile (normally `bun.lock` in the preferred stack), `tsconfig.json`, and TypeScript source |
| `core/` | `Cargo.toml`, the appropriate `Cargo.lock`, Rust source, and crate targets |
| Root | Repository-wide docs, CI/update policy, optional orchestration, and genuine shared contract/system-test inputs |

Apply the [TypeScript architecture](../typescript/architecture.md) with paths rooted under `web/` and [Rust architecture](../rust/architecture.md) with paths rooted under `core/`. For example, existing TypeScript `src/tests` becomes `web/src/tests`; Rust crate-root `tests` becomes `core/tests`. Do not create a second internal architecture or require every sample Rust config/shared module. A Cargo workspace can exist within the Rust area when the Rust profile's crate-boundary criteria are met.

## Keep implementation sharing language-local

Do not intermingle `.ts`/`.tsx` and `.rs` implementation modules in a single source tree. Do not create a root `shared/` that mixes TypeScript helpers/config with Rust errors/filesystem code.

Reusable TypeScript UI stays under the web area's `src/shared`; UI-free code uses the existing TypeScript ownership rules. Rust shared modules stay within the core area under its own rules. The same business concept does not make source implementations interchangeable between languages.

An optional root `contracts/` or `schemas/` may own a genuine transport/schema source, such as an API schema. It is not a mixed implementation folder. Do not require that directory if the existing code-first contract source or a few simple tested transport types are sufficient. See [contract ownership](contracts-and-boundaries.md#source-of-truth-and-generation).

## Capability ownership and dependency direction

Assign each operation to one authoritative owner. Typical web responsibilities include UI, client state, browser interactions, forms, and presentation. Typical Rust responsibilities include core business rules, system/filesystem access, proxy/network operations, and sensitive or intensive server processing. These are examples; the actual product decides the split. TypeScript server code can retain its genuinely distinct responsibilities.

When Rust owns a core operation, TypeScript calls it and processes its result rather than maintaining an independent implementation of the same business policy. UX checks, display formatting, local browser work, and generated contract validation remain useful without becoming a second policy authority. Do not move a trivial local UI operation to Rust or expose each internal step of a coherent Rust workflow separately.

The usual boundary direction is:

```text
TypeScript web / existing TypeScript server adapter
    → defined transport and contract
    → Rust boundary/adapter
    → Rust application/core operation
```

Keep React, TanStack, Bun/browser state, and UI-component details out of the Rust core. Place transport/serialization adaptation at its outer boundary when the distinction matters. TypeScript depends on the reachable contract, not Rust module paths, internal struct layout, or implementation folders. An internal Rust reorganization should not require web changes when the external contract is unchanged.

If a TypeScript server/proxy participates, use the TypeScript profile's existing backend/service boundaries for outbound I/O and identity handling. Do not force an extra proxy/BFF into a project that can safely use its existing direct boundary. Do not move server-only credentials or Rust internals into browser code to avoid an adapter.

## Choose the communication boundary

Reuse the project's suitable established transport first. Otherwise choose based on process/deployment boundaries, trust, request/streaming needs, latency, platform support, and operational complexity. HTTP/REST, WebSocket/SSE, sockets or queues, ordinary IPC, FFI/WASM, and generated bindings can fit different needs. Transport and encoding are separate choices; JSON, MessagePack, Protobuf, or another suitable representation are not universal defaults.

Keep operations cohesive, typed, documented, and small enough to maintain without making the API excessively chatty. Use separate internal Rust, transport, and frontend models where their responsibilities differ; reuse an identical representation when that is genuinely sufficient. Do not require DTO copies, conversion layers, a protocol crate, or an interface per operation without a benefit. Wire semantics and trust belong to [contracts and boundaries](contracts-and-boundaries.md).

## Existing layouts and larger repositories

Preserve clear existing names such as `frontend/` and `backend/` when renaming would provide little value. Before an authorized migration, inspect imports, Cargo paths, build contexts, CI filters, deploy paths, scripts, external consumers, and docs. New normal projects use `web/` + `core/` rather than inventing names for the same split repeatedly.

When multiple independent apps, crates, reuse, or release/deployment boundaries actually exist, `apps/web/`, `crates/core/`, `crates/protocol/`, and a shared contract area can become appropriate. Introduce those boundaries for the real scale of the project, not because two languages automatically demand a large monorepo.
