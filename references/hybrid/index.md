# TypeScript + Rust hybrid profile

Status: established conventions for a TypeScript web/frontend application and a Rust core/backend/system/server area that form one product in the same repository. Examples include a web application with a Rust core, a TypeScript UI with Rust system logic, and a web interface for a Rust proxy/server, including RentnerProxy-like projects.

Tauri is explicitly outside this profile. Select the separate [Tauri profile](../tauri/index.md) first for a Tauri application; its native IPC and frontend/`src-tauri/` layout are governed there. Unrelated applications in a larger repository retain their own profile.

## Compose the existing profiles

| Scope | Source of rules |
| --- | --- |
| `web/` TypeScript source | The complete [TypeScript profile](../typescript/index.md) and its relevant references, with the hybrid root-tooling override |
| `core/` Rust area | The complete [Rust profile](../rust/index.md) and its relevant references |
| Repository root and the boundary between those areas | This profile and the hybrid references below |

The language profiles remain the sources of truth for internal code. Interpret TypeScript source paths under `web/` and Rust crate paths under `core/`. For JS/TS manifests, web tooling configuration, and project commands, the [hybrid root-tooling rule](architecture.md#root-tooling-and-one-project-entrypoint) takes precedence over package-local placement. Do not introduce hybrid-specific hooks, module layouts, naming, formatting, config purity, or test conventions inside either language. Shared authorization, safety, dependency research, and handover rules remain in [SKILL.md](../../SKILL.md).

## Decision defaults

- For new normal hybrid projects, separate TypeScript source under `web/` and Rust under `core/`. Operate the product from the repository root through one JS/TS `package.json`, its lockfile, and root web tooling configs; do not create a separate web package merely for language separation. Add documentation and contract/system-test areas only for actual needs.
- When Docker Compose is used, keep one central root entrypoint for the combined product. Do not duplicate it under `web/` and `core/`.
- Keep shared implementations inside their owning language area. Use an optional root contract/schema source when a real cross-language source of truth is useful.
- Assign each capability an authoritative owner. Frontend UX validation can support the user but cannot replace core policy or security enforcement.
- Communicate through a deliberate, small transport/contract surface, preserving each side's internal architecture. Select the transport and encoding for the concrete deployment and workflow.
- Resolve JS/TS dependencies through the root manifest/lockfile and Rust dependencies through Cargo in `core/`. Keep language checks independently runnable through root commands; coordinate builds, generated contracts, integration tests, startup/shutdown, and release compatibility where the system actually needs it.

For existing projects, inspect their separation, contracts, and build/deployment assumptions before proposing changes. Preserve a clear existing layout unless a migration has a concrete benefit within the request. A shared repository does not require a large monorepo or one deployment/version for everything.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Root layout/names, language-local shared code, responsibility ownership, dependency/transport direction, existing projects | [Hybrid architecture](architecture.md) |
| Contract source/generation, serialization/evolution, external errors, authentication/trust boundaries, observability | [Hybrid contracts and boundaries](contracts-and-boundaries.md) |
| Root tooling/configuration, development/build coordination, test placement, CI, containers, shutdown, releases | [Hybrid workflow and verification](workflow-and-verification.md) |
| CI/CD provider, workflow/script structure, dependency automation, release metadata | [Shared deployment routing](../deployment/index.md), composed with both language profiles and this profile |
| Appliance, Standard Production or Scale / HA, container/runtime boundaries, data and recovery | [Shared deployment routing](../deployment/index.md); operating requirements decide service splitting, not the language boundary |

Read the hybrid details affected by the task and each applicable language profile. A local presentation change does not require redesigning the transport; a Rust module refactor does not justify new frontend models if the boundary contract remains unchanged.
