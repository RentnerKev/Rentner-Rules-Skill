![Rentner Rules – TypeScript, Rust, Hybrid and Tauri](.github/assets/release-banners/new-release-banner.png)

# Rentner Rules Skill

Reusable coding conventions by Kevin Sträßler, with four profiles: TypeScript, Rust, a shared TypeScript web / Rust core product, and Tauri.

A shared deployment area adds project-appropriate GitHub/Forgejo CI/CD, Docker/Compose and server operating models, data/recovery, dependency automation, security, releases, labels, and branded release assets without replacing those profiles.

The TypeScript profile covers React and TanStack Start feature structure, presentation components, grouped logic hooks, declarative configuration, clean package usage, and verified changes. The Rust-only profile covers responsibility-oriented modules, idiomatic ownership and errors, Cargo, testing, and runtime safety for ordinary Rust projects. General hybrid adds web/core repository and boundary rules. Tauri reuses the language conventions with its client frontend, native IPC, capabilities, and desktop lifecycle. It is packaged like [Hybrid Coding Skill](https://github.com/RentnerKev/Hybrid-Coding-Skill).

## Project and language profiles

| Target | Status | Instructions |
| --- | --- | --- |
| TypeScript / React / TanStack Start | Established conventions | [TypeScript profile](references/typescript/index.md) |
| Rust-only | Established, framework-independent conventions | [Rust profile](references/rust/index.md) |
| TypeScript web + Rust core in one product/repository | Established general hybrid conventions | [Hybrid profile](references/hybrid/index.md), plus both language profiles |
| Tauri | Established native IPC and desktop integration conventions | [Tauri profile](references/tauri/index.md), with language rules and its client/native override |

The skill identifies the affected application and package/crate before loading relevant details. A Tauri application selects its own profile before general hybrid, even inside a larger repository. React hooks, grouped returns, TypeScript formatting, and `src/tests` are TypeScript conventions; Rust has its own module, visibility, formatting, and test rules. General hybrid uses both language profiles plus web/core boundary rules. Tauri preserves client conventions and Rust core rules while replacing web/server defaults with native integration. Merely having files in both languages does not establish either product relationship.

## Installation

Install globally for Codex:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a codex
```

These examples pin Skills CLI 1.7.0 for reproducibility.

Alternatively, use `npx skills@1.7.0 add` with the same arguments.

Verify the installation:

```powershell
bunx skills@1.7.0 list -g -a codex
```

Install globally for Codex, Cursor, and Claude Code together:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a codex -a cursor -a claude-code
```

Install this skill in a target project for every agent supported by the pinned CLI:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -a '*'
```

The wildcard covers the CLI's supported agents; some targets support only project scope. For agent identifiers, locations, and invocation details, see [agents/README.md](agents/README.md), [Cursor](agents/cursor.md), and [Claude Code](agents/claude-code.md). The integration notes also cover Gemini CLI, GitHub Copilot, Windsurf, OpenCode, and manual setup for other tools.

## Update

```powershell
bunx skills@1.7.0 update rentner-rules -g
bunx skills@1.7.0 check -g
```

## Usage

```text
$rentner-rules

Identify the affected application and apply the relevant project and language profiles.
Implement the requested feature using established project conventions.
Preserve existing changes and run the relevant checks.
```

The skill can also be selected automatically when the task and project match its description. Explicit user requests and applicable repository instructions take precedence.

`$rentner-rules` is the Codex invocation above. Other agents use their native skill interface; see the [integration notes](agents/README.md). All integrations read the same `SKILL.md`, four profile folders, shared JS/TS tooling policy, and relevant deployment references.

For planning, ask for a plan or rules discussion first; the skill keeps that work at the planning stage.

It works independently of Hybrid Coding. When both are used, Hybrid Coding provides orchestration and Rentner Rules provides code and architecture conventions.

## Git branches and pull requests

New PR branches use a fitting change type and a short kebab-case description, such as `feat/user-settings` or `fix/session-timeout`. PR titles describe the change with the matching type, such as `feat: add user settings`; neither uses a `codex/` prefix or agent labels. Other suitable types include `docs`, `refactor`, `test`, and `chore`.

Explicit branch and workflow instructions take precedence, including requirements to work, commit, and push on `main`. The shared rules are in [SKILL.md](SKILL.md#git-branches-and-pull-requests) and apply to all four profiles and agent integrations.

## Shared JavaScript/TypeScript tooling

The central [tooling policy](references/typescript/tooling.md) defines Oxlint for linting and Oxfmt for formatting across all JS/TS areas, including hybrid, Tauri, auxiliary scripts, and future profiles. It owns React rules, type-aware compatibility decisions, format settings, scoped checks, and migrations with demonstrated coverage exceptions; profiles reference it instead of maintaining competing defaults.

## TypeScript conventions

- Prefer Bun, TypeScript strict, React, TanStack Start, Tailwind CSS, Zod, and the relevant TanStack libraries for new non-Tauri web projects; use the Tauri frontend override for its WebView.
- Use installed `@rentnerkev/*` packages as the primary source for their supported UI.
- Research current maintenance, compatibility, and suitable alternatives before adding dependencies.
- Keep TSX components focused on presentation; put behavior in `use...Logic` hooks.
- Use one public `use...Logic` per screen/component; avoid nested full logic hooks and forwarding wrappers. Focused custom hooks remain reusable.
- Return `state` and `handler`, with optional `setter`, `refs`, and named library instances such as `table` or `form`.
- Keep Table/Form/Modal submodules inside `Components/`.
- For actual TypeScript servers, separate Server Function adapters in `middleware.ts`, schemas in `validation.ts`, and backend domain logic in `src/server`.
- Put reusable UI in `src/shared` and UI-free helper modules in `src/lib`.
- Keep config files declarative and types in the owner's `Types/` directory.
- Use local constants where needed; avoid separate `constants.ts` and `queryKeys.ts` modules.
- Name public and authenticated shells `PublicLayout` and `AuthenticatedLayout`.
- Keep tests centralized under `src/tests`, mirroring source paths.
- Preserve secrets, existing user changes, security checks, and the Drizzle/migration boundary.

Full TypeScript instructions are in the [TypeScript profile](references/typescript/index.md), with examples in [Architecture](references/typescript/architecture.md) and [Frontend](references/typescript/frontend.md). Shared authorization, safety, and workflow constraints are in [SKILL.md](SKILL.md).

## Rust conventions

The [Rust profile](references/rust/index.md) applies to libraries, CLI tools, server cores, daemons/workers, filesystem tools, Tauri Rust cores, and other ordinary Cargo projects. Structure grows with actual responsibilities; a small tool can remain a single file. New modules prefer `name.rs` plus `name/`, and coherent existing `mod.rs` layouts remain valid.

The profile routes to focused references:

| Reference | Decisions |
| --- | --- |
| [Architecture](references/rust/architecture.md) | Entrypoints, module/crate boundaries, config/shared ownership, visibility, and coherent file sizes |
| [Coding](references/rust/coding.md) | Ownership, typed errors/states, traits/generics, APIs, async selection, and measured performance |
| [Cargo and tooling](references/rust/cargo-and-tooling.md) | Current dependency research, stable/MSRV, lockfiles, features, build scripts, and supply-chain checks |
| [Testing and verification](references/rust/testing-and-verification.md) | Crate-root `tests/`, private-test exceptions, Cargo discovery, docs, rustfmt/Clippy, and CI |
| [Safety and runtime](references/rust/safety-and-runtime.md) | Paths/filesystem operations, external data, environment/logging, bounded concurrency, shutdown, and unsafe/FFI |

No framework, runtime, or error/security crate is a mandatory default. Current recommendations include primary-source links and a 2026-10-02 source check; recheck time-sensitive choices when using the skill. Shared authorization and safety rules remain in [SKILL.md](SKILL.md).

## General hybrid conventions

The [Hybrid profile](references/hybrid/index.md) covers a TypeScript web application and Rust core/server that form one product in the same repository. New normal projects use `web/` for TypeScript source and `core/` for Rust. One root `package.json`, JS/TS lockfile, and root web tooling configs operate the product's installation, development, builds, and checks; do not create a duplicate web package or move root configs into `web/`. Cargo stays in `core/`, and application config stays in `web/src/config`. Compose, when used, has one central root entrypoint. Both language profiles retain their internal code rules; hybrid explicitly overrides web tooling placement.

| Reference | Decisions |
| --- | --- |
| [Architecture](references/hybrid/architecture.md) | Root web tooling and project entrypoint, central Compose ownership, language-local shared code, authoritative responsibilities, transport direction, and existing layouts |
| [Contracts and boundaries](references/hybrid/contracts-and-boundaries.md) | Contract ownership/generation, serialization/evolution, safe errors, authentication, HTTP-specific protections, and observability |
| [Workflow and verification](references/hybrid/workflow-and-verification.md) | Root development/build/check commands, separate JS/TS and Cargo resolution, config/secrets, containers, shutdown, CI, and release compatibility |

Transport, code generation, root contracts, additional task runners, and system tests depend on actual needs. Coherent existing source-area names remain valid; layout migrations require authorization for that scope. TypeScript tests retain `web/src/tests`; Rust tests use the Rust profile's `core/tests` rules and exceptions. Tauri is explicitly outside general hybrid and uses its own [integration profile](references/tauri/index.md).

## Tauri conventions

The [Tauri profile](references/tauri/index.md) preserves the frontend plus `src-tauri/` application layout. New normal desktop frontends prefer React, TypeScript, Vite, TanStack Router/Query/Form, and Tailwind. Client ownership/hooks and Rust module/core rules remain in their existing language references. Tauri adds the native integration and explicitly overrides TanStack Start/SSR/Server Function defaults.

The usual operation path is `component → owning hook/query/mutation → native.ts → Tauri IPC adapter → Rust core`. Commands handle request/response, channels carry ordered progress/streams, and events deliver suitable notifications. A separate HTTP/Axum server requires an actual external-server use case.

| Reference | Decisions |
| --- | --- |
| [Architecture](references/tauri/architecture.md) | Project shape, bootstrap/registration, core independence, managed resources, config, and optional servers |
| [Frontend and IPC](references/tauri/frontend-and-ipc.md) | Feature `native.ts`, Query integration, IPC primitive selection, contracts/errors, and subscription ownership |
| [Security and capabilities](references/tauri/security-and-capabilities.md) | Native validation, effective permissions/custom-command ACL, CSP, remote content, protocols, files/processes, and secrets |
| [Desktop and runtime](references/tauri/desktop-and-runtime.md) | Background jobs, cancellation/shutdown, windows, persistence, optional desktop integrations, and observability |
| [Workflow and verification](references/tauri/workflow-and-verification.md) | Current versions/plugins, development/builds, isolated tests/E2E, platform CI, bundles, signing, and updates |

Frontend tests remain in `src/tests`; Rust behavior tests normally use `src-tauri/tests`. Root system/E2E tests exist only for actual integration needs. Tauri recommendations link current official v2 sources checked on 2026-10-02; version/platform/tooling decisions must be rechecked when applied.

## Shared deployment, CI/CD and release automation

[Deployment routing](references/deployment/index.md) identifies the affected project, actual operating requirements/provider, existing runtime/automation, runner capabilities, and needed artifacts. Server operating model, language profile and provider are separate decisions. It composes with the four profiles; Tauri retains precedence over general hybrid. A provider folder alone does not establish the active host, and existing projects are not automatically migrated to a new pipeline or topology.

| Reference | Decisions |
| --- | --- |
| [Deployment models](references/deployment/deployment-models.md) | Appliance, Standard Production or Scale / HA from lifecycle, scaling, availability and state requirements; canonical architecture references |
| [Docker and Compose](references/deployment/docker-and-compose.md) | Published production images, multi-stage runtime packaging, one central Compose entrypoint, configuration/ports, readiness and supervised lifecycle |
| [Data and recovery](references/deployment/data-and-recovery.md) | PostgreSQL/Valkey selection, volumes/backups, maintenance without normal startup, persistent-format/major upgrades and unchanged migration authorization |
| [Operations](references/deployment/operations.md) | Target deployment, runtime verification, compatible upgrades/rollback, safe infrastructure checks and operator handover |
| [Shared CI/CD](references/deployment/ci-cd.md) | Conditional workflow selection, project verification matrix, provider-owned scripts, toolchains, and infrastructure validation |
| [Automation security](references/deployment/security.md) | Action SHA pins, minimal rights, trusted PR/artifact boundaries, secrets/runners/caches, and unchanged migration restrictions |
| [GitHub](references/deployment/github.md) | RentnerProxy as an adaptable reference, actual Dependabot ecosystems with a one-day version-update cooldown, security/repository/release automation |
| [Forgejo](references/deployment/forgejo.md) | TanstackDummy as an adaptable reference, version-aware Actions support, daily 03:00 UTC/manual Renovate, dashboard and one-day release age |
| [Forgejo runners](references/deployment/forgejo-runners.md) | Kevin's `.forgejo/workflows/`: TypeScript/Bun jobs on `bun`, Cargo jobs on `rust`, native Tauri delivery on `tauri`; infrastructure/integration by verified tools |
| [Releases and metadata](references/deployment/releases-and-metadata.md) | Exact release source/artifacts, publishing vs deployment, labels/categories, templates, compatibility, and project-specific banners |

Only add capabilities justified by the actual project. Separate hybrid language jobs and Tauri frontend/core/native delivery; do not add Rust checks to TypeScript-only products, web checks to Rust-only products, or automatic server/container deployment to desktop apps. Provider-exclusive scripts stay under `.github/scripts/` or `.forgejo/scripts/`; application development/build tooling retains its owner. Missing runner capabilities, labels, or genuine banner assets require concrete maintainer steps, not invented configuration or placeholders.

Simple self-hosting with a joint product lifecycle prefers Appliance, with RentnerProxy as the reference. Ordinary production web/business applications prefer Standard Production, with accessible TanstackDummy as the reference: app/worker can share one versioned image while required state services have their actual lifecycle. Scale / HA requires real scaling/availability/managed-infrastructure needs; code size or language count does not justify a cluster. Hybrid can use one product image or justified separate services. Pure Tauri desktop apps keep native delivery; additional servers are assessed separately.

Prefer Valkey for new compatible cache/session/queue/coordination needs and PostgreSQL for relational storage; do not add unused services or migrate existing Redis without a concrete request. Keep database/cache ports internal, durable data outside the container layer, and operator configuration small. Document backups, failed-startup recovery, explicit PostgreSQL major upgrades and rollback/state compatibility. Existing authorized runtime migrations may be documented, while agent execution, hidden migrations and reading real environment/secret or Drizzle files remain prohibited.

The deployment/provider references link official sources checked on 2026-10-05; recheck current schema/version/platform/image/upgrade support before concrete configuration. Reference tool versions, names, deployment paths, branding, and database-migration steps are not global defaults.

## Repository structure

```text
Rentner-Rules-Skill/
├── SKILL.md
├── README.md
├── LICENSE
├── .gitignore
├── agents/
│   ├── README.md
│   ├── openai.yaml
│   ├── codex.md
│   ├── cursor.md
│   ├── claude-code.md
│   ├── gemini-cli.md
│   ├── github-copilot.md
│   ├── windsurf.md
│   ├── opencode.md
│   └── universal.md
├── references/
│   ├── typescript/
│   │   ├── index.md
│   │   ├── architecture.md
│   │   ├── frontend.md
│   │   ├── dependencies-and-config.md
│   │   ├── backend-and-safety.md
│   │   ├── tooling.md
│   │   └── workflow-and-verification.md
│   ├── rust/
│   │   ├── index.md
│   │   ├── architecture.md
│   │   ├── coding.md
│   │   ├── cargo-and-tooling.md
│   │   ├── testing-and-verification.md
│   │   └── safety-and-runtime.md
│   ├── hybrid/
│   │   ├── index.md
│   │   ├── architecture.md
│   │   ├── contracts-and-boundaries.md
│   │   └── workflow-and-verification.md
│   ├── tauri/
│   │   ├── index.md
│   │   ├── architecture.md
│   │   ├── frontend-and-ipc.md
│   │   ├── security-and-capabilities.md
│   │   ├── desktop-and-runtime.md
│   │   └── workflow-and-verification.md
│   └── deployment/
│       ├── index.md
│       ├── ci-cd.md
│       ├── security.md
│       ├── github.md
│       ├── forgejo.md
│       ├── forgejo-runners.md
│       ├── releases-and-metadata.md
│       ├── deployment-models.md
│       ├── docker-and-compose.md
│       ├── data-and-recovery.md
│       └── operations.md
└── .github/
    └── workflows/
        └── release.yml
```

The repository contains one skill with four project/language profile folders and one shared deployment area, so `SKILL.md` lives directly in the repository root. Each area has a short `index.md` that routes to focused references. Shared JS/TS tooling lives once in the TypeScript folder. Agent Markdown files document integrations; only `openai.yaml` is Codex interface metadata. No application dependencies are installed by this skill.

## Validation and releases

Check local skill discovery without installing:

```powershell
bunx skills@1.7.0 add . --list
```

Expected skill: `rentner-rules`.

The GitHub workflow validates all four profile folders, the shared deployment references and agent files, local Markdown links recursively, Codex interface metadata, and CLI discovery on pushes, pull requests, and published releases. These checks validate packaging; they do not run each coding agent. Release tags use SemVer, for example `v1.0.0`.

## skills.sh

Directory page: [skills.sh](https://skills.sh/RentnerKev/Rentner-Rules-Skill/rentner-rules). Listing and installation counts are handled by the Skills CLI; see the [skills.sh FAQ](https://skills.sh/docs/faq).

## License

[MIT License](LICENSE). Copyright © 2026 Kevin Sträßler.
