# Rentner Rules Skill

Reusable coding conventions by Kevin Sträßler, with separate profiles for TypeScript and Rust.

The TypeScript profile covers React and TanStack Start feature structure, presentation components, grouped logic hooks, declarative configuration, clean package usage, and verified changes. The Rust-only profile covers responsibility-oriented modules, idiomatic ownership and errors, Cargo, testing, and runtime safety for ordinary Rust projects. It is packaged like [Hybrid Coding Skill](https://github.com/RentnerKev/Hybrid-Coding-Skill).

## Language profiles

| Target | Status | Instructions |
| --- | --- | --- |
| TypeScript / React / TanStack Start | Established conventions | [TypeScript profile](references/typescript.md) |
| Rust-only | Established, framework-independent conventions | [Rust profile](references/rust.md) |
| Mixed TypeScript and Rust | Detected; combined profile reserved for later planning | Language selection in [SKILL.md](SKILL.md) |

The skill identifies the affected package or crate before loading language-specific details. React hooks, grouped returns, TypeScript formatting, and `src/tests` are TypeScript conventions. Rust uses its own module, visibility, formatting, and test rules while respecting coherent existing projects. Authorized mixed changes use the independent profiles for their own files; a combined architecture has not been designed.

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

Identify the target language and use its applicable profile.
Implement the requested feature using established project conventions.
Preserve existing changes and run the relevant checks.
```

The skill can also be selected automatically when the task and project match its description. Explicit user requests and applicable repository instructions take precedence.

`$rentner-rules` is the Codex invocation above. Other agents use their native skill interface; see the [integration notes](agents/README.md). All integrations read the same `SKILL.md` and language references.

For planning, ask for a plan or rules discussion first; the skill keeps that work at the planning stage.

It works independently of Hybrid Coding. When both are used, Hybrid Coding provides orchestration and Rentner Rules provides code and architecture conventions.

## TypeScript conventions

- Prefer Bun, TypeScript strict, React, TanStack Start, Tailwind CSS, Zod, and the relevant TanStack libraries for new web projects.
- Use installed `@rentnerkev/*` packages as the primary source for their supported UI.
- Research current maintenance, compatibility, and suitable alternatives before adding dependencies.
- Keep TSX components focused on presentation; put behavior in `use...Logic` hooks.
- Use one public `use...Logic` per screen/component; avoid nested full logic hooks and forwarding wrappers. Focused custom hooks remain reusable.
- Return `state` and `handler`, with optional `setter`, `refs`, and named library instances such as `table` or `form`.
- Keep Table/Form/Modal submodules inside `Components/`.
- Separate Server Function adapters in `middleware.ts`, schemas in `validation.ts`, and backend domain logic in `src/server`.
- Put reusable UI in `src/shared` and UI-free helper modules in `src/lib`.
- Keep config files declarative and types in the owner's `Types/` directory.
- Use local constants where needed; avoid separate `constants.ts` and `queryKeys.ts` modules.
- Name public and authenticated shells `PublicLayout` and `AuthenticatedLayout`.
- Keep tests centralized under `src/tests`, mirroring source paths.
- Preserve secrets, existing user changes, security checks, and the Drizzle/migration boundary.

Full TypeScript instructions are in [references/typescript.md](references/typescript.md), with examples in [Architecture](references/architecture.md) and [Frontend](references/frontend.md). Shared authorization, safety, and workflow constraints are in [SKILL.md](SKILL.md).

## Rust conventions

The [Rust profile](references/rust.md) applies to libraries, CLI tools, server cores, daemons/workers, filesystem tools, Tauri Rust cores, and other ordinary Cargo projects. Structure grows with actual responsibilities; a small tool can remain a single file. New modules prefer `name.rs` plus `name/`, and coherent existing `mod.rs` layouts remain valid.

The profile routes to focused references:

| Reference | Decisions |
| --- | --- |
| [Architecture](references/rust-architecture.md) | Entrypoints, module/crate boundaries, config/shared ownership, visibility, and coherent file sizes |
| [Coding](references/rust-coding.md) | Ownership, typed errors/states, traits/generics, APIs, async selection, and measured performance |
| [Cargo and tooling](references/rust-cargo-and-tooling.md) | Current dependency research, stable/MSRV, lockfiles, features, build scripts, and supply-chain checks |
| [Testing and verification](references/rust-testing-and-verification.md) | Crate-root `tests/`, private-test exceptions, Cargo discovery, docs, rustfmt/Clippy, and CI |
| [Safety and runtime](references/rust-safety-and-runtime.md) | Paths/filesystem operations, external data, environment/logging, bounded concurrency, shutdown, and unsafe/FFI |

No framework, runtime, or error/security crate is a mandatory default. Current recommendations include primary-source links and a 2026-10-02 source check; recheck time-sensitive choices when using the skill. Shared authorization and safety rules remain in [SKILL.md](SKILL.md). The combined TypeScript + Rust profile will be planned separately.

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
│   ├── typescript.md
│   ├── rust.md
│   ├── rust-architecture.md
│   ├── rust-coding.md
│   ├── rust-cargo-and-tooling.md
│   ├── rust-testing-and-verification.md
│   ├── rust-safety-and-runtime.md
│   ├── architecture.md
│   ├── frontend.md
│   ├── dependencies-and-config.md
│   ├── backend-and-safety.md
│   └── workflow-and-verification.md
└── .github/
    └── workflows/
        └── release.yml
```

The repository contains one skill with language profiles, so `SKILL.md` lives directly in the repository root. Agent Markdown files document integrations; only `openai.yaml` is Codex interface metadata. No application dependencies are installed by this skill.

## Validation and releases

Check local skill discovery without installing:

```powershell
bunx skills@1.7.0 add . --list
```

Expected skill: `rentner-rules`.

The GitHub workflow validates language and agent files, local Markdown links, Codex interface metadata, and CLI discovery on pushes, pull requests, and published releases. These checks validate packaging; they do not run each coding agent. Release tags use SemVer, for example `v1.0.0`.

## skills.sh

Directory page: [skills.sh](https://skills.sh/RentnerKev/Rentner-Rules-Skill/rentner-rules). Listing and installation counts are handled by the Skills CLI; see the [skills.sh FAQ](https://skills.sh/docs/faq).

## License

[MIT License](LICENSE). Copyright © 2026 Kevin Sträßler.
