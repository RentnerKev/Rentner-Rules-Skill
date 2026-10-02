# Hybrid architecture

Scope: [Hybrid profile](index.md). This reference defines repository separation and responsibility boundaries; internal TypeScript and Rust architecture stays in the existing language profiles.

## Default repository layout

For new normal projects, use `web/` for TypeScript source and `core/` for Rust, with the web toolchain and project commands at the repository root:

```text
project/
├── package.json          # JS/TS dependencies and project commands
├── bun.lock              # selected JS/TS lockfile; Bun is the preferred stack
├── tsconfig.json         # targets web/src and the actual TS tooling
├── vite.config.ts        # when Vite is used; points to the web source/assets
├── .oxlintrc.json
├── .oxfmtrc.json
├── web/
│   ├── public/
│   └── src/
├── core/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── src/
│   └── tests/
├── scripts/              # when shared orchestration needs scripts
├── docker/               # when container build/runtime files are needed
├── docker-compose.yml    # when Compose is used; central product entrypoint
└── README.md
```

Source separation does not imply a separate JavaScript package or workspace for `web/`. The tree shows ownership, not mandatory scaffolding: retain the selected package manager and established Compose filename, and create only the configs, assets, tests, and deployment files the product needs. Repository-wide docs, `.github/` or `.forgejo/`, update policy, and editor settings remain valid root resources.

| Area | Tooling and source ownership |
| --- | --- |
| Root | One JS/TS `package.json` and lockfile, web tooling configs, public development/build/test commands, repository-wide docs/CI, central Compose orchestration, and genuine shared contract/system-test inputs |
| `web/` | TypeScript application source, public assets, application config under `src/config`, and TypeScript tests under `src/tests` |
| `core/` | `Cargo.toml`, the appropriate `Cargo.lock`, Rust toolchain settings, Rust source, and crate targets/tests |

Apply the [TypeScript architecture](../typescript/architecture.md) with source paths rooted under `web/` and [Rust architecture](../rust/architecture.md) with crate paths rooted under `core/`. For example, TypeScript `src/tests` becomes `web/src/tests`; Rust crate-root `tests` becomes `core/tests`. JS/TS package and tooling paths follow the root rule below rather than moving with TypeScript source. A Cargo workspace can exist within the Rust area when the Rust profile's crate-boundary criteria are met.

## Root tooling and one project entrypoint

- Keep one root JS/TS `package.json` for the hybrid product's web dependencies, auxiliary TS tooling, and project commands, with its package-manager lockfile alongside it. Do not introduce `web/package.json`, a second JS/TS lockfile, or a web workspace package merely because the application source lives in `web/`.
- Keep web toolchain configuration at the root: TypeScript configs, Vite/TanStack build tooling, Bun settings, and Oxlint/Oxfmt configs when used. Additional configs for genuinely different build/check targets also stay at the root. Existing root manifests/configs must not be moved into `web/` during a hybrid refactor.
- Start, build, test, typecheck, lint, and format the product through root package scripts. Expose independently runnable web and Rust checks there when needed. Use the project's actual script names; the root manifest owns these commands rather than forwarding to a duplicate web manifest.
- Cargo manifests, lockfiles, and Rust toolchain settings stay with `core/` under the Rust profile. Root scripts target that manifest or an explicitly selected Cargo working directory.
- Application configuration remains in `web/src/config` under the TypeScript declarative-config rules. Its runtime environment readers remain with the owning server/lib boundary. The root-tooling rule does not move application configuration into the repository root.
- When Compose is used, keep one central root `docker-compose.yml` or established equivalent for the combined product. Do not create competing web/core Compose files. Distinct service Dockerfiles and runtime files may live under `docker/`; additional Compose overlays require a real distinct environment or workflow and use the same central deployment arrangement.

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

Preserve clear existing source-area names such as `frontend/` and `backend/` when renaming would provide little value. Preserve established root JS/TS tooling and central Compose ownership. A focused feature request does not authorize migrating existing nested tooling; record any mismatch with the root rule for a separately authorized layout change. Before an authorized migration, inspect imports, Cargo paths, build contexts, CI filters, deploy paths, scripts, external consumers, and docs. New normal projects use `web/` + `core/` with root web tooling.

When multiple independent apps, crates, reuse, or release/deployment boundaries actually exist, `apps/web/`, `crates/core/`, `crates/protocol/`, and a shared contract area can become appropriate. Introduce those boundaries for the real scale of the project, not because two languages automatically demand a large monorepo.
