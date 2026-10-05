# TypeScript profile

Status: established conventions for TypeScript, React, and TanStack Start. The rules in this profile and its references apply to the TypeScript area; they do not define Rust architecture.

For non-Tauri hybrid products, interpret source paths under `web/` and apply the [hybrid root-tooling override](../hybrid/architecture.md#root-tooling-and-one-project-entrypoint) before placing manifests or tooling configs. The JS/TS package, lockfile, and web toolchain live at the repository root; application config remains under `web/src/config`.

For new non-Tauri web projects, prefer Bun, TypeScript strict, React, TanStack Start, Tailwind CSS, Zod, and the relevant TanStack packages. The [Tauri profile](../tauri/index.md) overrides frontend/server defaults for its WebView while retaining these client conventions. Verify current compatible versions rather than copying historical version pins. In existing projects, follow the installed stack and the canonical neighboring implementation; apply React and TanStack rules only where those frameworks are used.

When TanStack Dummy is available as the user's reference project, inspect the relevant implementation and preserve its hook structure. If it is unavailable, use the documented contracts below and the target project's matching examples without claiming to have inspected TanStack Dummy.

Installed `@rentnerkev/*` packages are the primary source for their supported UI. Use their documented components and APIs.

## Core conventions

1. Keep routes thin. Organize feature UI in `src/features`, reusable UI in `src/shared`, UI-free helpers in `src/lib`, backend domain logic in `src/server`, and configuration data in `src/config`.
2. A feature may contain `index.tsx`, `Components/`, `Hooks/`, `Types/`, `middleware.ts`, and `validation.ts`. Create only the parts the feature needs.
3. Keep TSX components as presentation templates: imports, typed props, hook wiring, and JSX. Put state, queries, mutations, effects, derived business values, and action workflows in `use...Logic` hooks.
4. Give each screen or complex component one public `use...Logic` entrypoint. Do not nest full screen/component logic hooks or add presentation wrappers that forward their complete results. Focused custom hooks remain valid; see the frontend composition rules.
5. Return named hook groups: `state` and `handler`, with optional `setter`, `refs`, and clearly named library instances such as `table` or `form`. Include only the groups actually needed.
6. Place a complex Table, Form, or Modal inside `Components/<Component>/`, with its own components, hooks, and types when useful. Use TanStack Table and the existing shared table components.
7. For actual TypeScript servers, use feature `middleware.ts` for the Server Function boundary: method, input validation, authentication, permission, rate limit, and service delegation. Put business logic, database access, queues, mail, and storage in backend services.
8. Use `validation.ts` for input schemas and pure normalization. It describes the validated contract; it does not perform authentication or persistence.
9. Keep configuration files declarative: values, objects, and arrays. Put types in the owner's `Types/` directory and runtime computations in hooks, lib, or server modules.
10. Dissolve feature `Helpers/` folders into the appropriate lib modules. Do not create separate `constants.ts`, `queryKeys.ts`, or query-key directories.
11. Inline simple values used once. For repeated use in one file, define a local constant there. Keep meaningful cross-file reuse with its domain implementation; keep policy and security settings in config.
12. Use `PublicLayout` for public pages and `AuthenticatedLayout` for authenticated pages. Layouts and client guards never replace server authorization.
13. Keep tests centralized in `src/tests`, mirroring the source path below `src/`.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Feature structure, tables, shared/lib ownership, constants, query keys | [Architecture](architecture.md) |
| Components, typed hook returns, refs, TanStack state, styling, accessibility, i18n | [Frontend](frontend.md) |
| Config purity, environment wiring, installed packages, new dependency research | [Dependencies and config](dependencies-and-config.md) |
| Shared JS/TS lint/format defaults, React rules, type-aware checks, and compatible migrations | [JavaScript/TypeScript tooling](tooling.md) |
| Server boundaries, authorization, transactions, secrets, Drizzle restrictions | [Backend and safety](backend-and-safety.md) |
| Planning, focused changes, naming, formatting, tests, Git, handover | [Workflow and verification](workflow-and-verification.md) |
| CI/CD workflows/scripts, dependency automation, releases, repository metadata | [Shared deployment routing](../deployment/index.md), composed with this profile |

Read the references that affect the current task before implementation or review. Do not load unrelated references merely because they exist.
