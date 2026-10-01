---
name: rentner-rules
description: Apply RentnerKev's coding conventions when planning, implementing, refactoring, or reviewing React, TypeScript, and TanStack Start applications. Covers feature structure, presentation components, grouped logic hooks, declarative config, dependencies, and verification. Use when these conventions are requested or the project follows them.
---

# Rentner Rules

Build maintainable applications using Kevin Sträßler's coding conventions. Keep features predictable, components readable, and runtime boundaries explicit.

## Scope and precedence

- Explicit user requirements and applicable repository instructions take precedence over this skill's defaults. Apply the conventions to the authorized work.
- For new web projects, prefer Bun, TypeScript strict, React, TanStack Start, Tailwind CSS, Zod, and the relevant TanStack packages. Verify current compatible versions rather than copying historical version pins.
- In existing projects, inspect the stack and a canonical neighboring implementation first. A feature request or skill installation does not authorize a repository-wide conversion.
- When the user asks to plan, discuss, or collect ideas, produce the plan before changing files. Start implementation when it is requested.
- Installed `@rentnerkev/*` packages are the primary source for their supported UI. Use their documented components and APIs.
- This skill defines coding conventions. It does not depend on Hybrid Coding or prescribe models or delegation.

## Core conventions

1. Keep routes thin. Organize feature UI in `src/features`, reusable UI in `src/shared`, UI-free helpers in `src/lib`, backend domain logic in `src/server`, and configuration data in `src/config`.
2. A feature may contain `index.tsx`, `Components/`, `Hooks/`, `Types/`, `middleware.ts`, and `validation.ts`. Create only the parts the feature needs.
3. Keep TSX components as presentation templates: imports, typed props, hook wiring, and JSX. Put state, queries, mutations, effects, derived business values, and action workflows in `use...Logic` hooks.
4. Give each screen or complex component one public `use...Logic` entrypoint. Do not nest full screen/component logic hooks or add presentation wrappers that forward their complete results. Focused custom hooks remain valid; see the frontend composition rules.
5. Return named hook groups: `state` and `handler`, with optional `setter`, `refs`, and clearly named library instances such as `table` or `form`. Include only the groups actually needed.
6. Place a complex Table, Form, or Modal inside `Components/<Component>/`, with its own components, hooks, and types when useful. Use TanStack Table and the existing shared table components.
7. Use feature `middleware.ts` for the Server Function boundary: method, input validation, authentication, permission, rate limit, and service delegation. Put business logic, database access, queues, mail, and storage in backend services.
8. Use `validation.ts` for input schemas and pure normalization. It describes the validated contract; it does not perform authentication or persistence.
9. Keep configuration files declarative: values, objects, and arrays. Put types in the owner's `Types/` directory and runtime computations in hooks, lib, or server modules.
10. Dissolve feature `Helpers/` folders into the appropriate lib modules. Do not create separate `constants.ts`, `queryKeys.ts`, or query-key directories.
11. Inline simple values used once. For repeated use in one file, define a local constant there. Keep meaningful cross-file reuse with its domain implementation; keep policy and security settings in config.
12. Use `PublicLayout` for public pages and `AuthenticatedLayout` for authenticated pages. Layouts and client guards never replace server authorization.
13. Keep tests centralized in `src/tests`, mirroring the source path below `src/`.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Feature structure, tables, shared/lib ownership, constants, query keys | [Architecture](references/architecture.md) |
| Components, typed hook returns, refs, TanStack state, styling, accessibility, i18n | [Frontend](references/frontend.md) |
| Config purity, environment wiring, installed packages, new dependency research | [Dependencies and config](references/dependencies-and-config.md) |
| Server boundaries, authorization, transactions, secrets, Drizzle restrictions | [Backend and safety](references/backend-and-safety.md) |
| Planning, focused changes, naming, formatting, tests, Git, handover | [Workflow and verification](references/workflow-and-verification.md) |

Read the references that affect the current task before implementation or review. Do not load unrelated references merely because they exist.

## Work safely and finish the task

- Check Git status and preserve existing user changes. Read only the relevant files, callers, contracts, and tests.
- Never read, list, modify, move, or delete `drizzle/`. Never run Drizzle commands or database migrations, including through wrapper scripts. Edit schema sources only when explicitly requested; leave migration creation to the maintainer.
- Never read or print real `.env` files, tokens, keys, or credentials. Use `.env.example` for configuration work.
- Never manually edit generated routes, build output, or other generated artifacts.
- Do not weaken permissions, same-origin checks, rate limits, hashing, encryption, audit logs, or path validation to make a check pass.
- Avoid unnecessary dependencies. Research current primary sources before choosing a new package.
- Continue within established authorization. Ask only when missing information or an actual permission boundary prevents progress; explain the concrete reason.
- Verify the changed behavior with the project's real tooling. Report checks, existing failures, skipped checks, and remaining maintainer steps accurately.
- In German prose, write actual umlauts and ß, for example: “Öfters gehe ich Eis essen und laufe dabei über den Fluss.”
