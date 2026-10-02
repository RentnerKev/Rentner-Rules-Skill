---
name: rentner-rules
description: Apply RentnerKev's coding conventions when planning, implementing, refactoring, or reviewing TypeScript, Rust, or shared TypeScript web and Rust core projects. Select the project scope first. TypeScript covers React/TanStack and grouped hooks; Rust covers ordinary Cargo projects; the non-Tauri hybrid profile defines web/core separation and cross-language boundaries. Use when these conventions are requested or the project follows them. Tauri integration rules are reserved for a separate profile.
---

# Rentner Rules

Build maintainable applications using Kevin Sträßler's coding conventions. Select the project scope and applicable profiles before applying architecture, naming, formatting, or test-layout rules.

## Scope and precedence

- Explicit user requirements and applicable repository instructions take precedence over this skill's defaults. Apply the conventions to the authorized work.
- In existing projects, inspect the target package or crate, its stack, and a canonical neighboring implementation first. A feature request or skill installation does not authorize a repository-wide conversion.
- When the user asks to plan, discuss, or collect ideas, produce the plan before changing files. Start implementation when it is requested.
- This skill defines coding conventions for any compatible coding agent. It does not depend on Hybrid Coding or prescribe models or delegation.

## Select the project and language profiles

Identify a declared Tauri application or its framework dependencies/configuration before applying the general hybrid profile. Tauri is outside that profile's scope; its integration rules remain reserved for separate work.

| Target | Evidence in the affected package | Profile | Status |
| --- | --- | --- | --- |
| TypeScript-only | `.ts`/`.tsx`, `tsconfig.json`, and the stack declared in `package.json` | [TypeScript](references/typescript/index.md) | Established conventions; React/TanStack rules where used |
| Rust-only | `.rs` and the owning `Cargo.toml` or Cargo workspace | [Rust](references/rust/index.md) | Established conventions for ordinary Cargo projects |
| TypeScript + Rust hybrid | A TypeScript web area and Rust core/server form one non-Tauri product in the same repository | [Hybrid](references/hybrid/index.md), plus the language profiles | Established web/core and boundary conventions |
| Tauri | Declared Tauri application or Tauri framework dependencies/configuration | Separate profile reserved | General hybrid rules do not provide Tauri integration coverage |

- Use the user's requested target and the actual affected files. A root `package.json` does not make a nested Rust crate TypeScript, and a Cargo workspace does not change React files into Rust.
- Read the matching profile before implementation or review, then only the references it requires. During architecture planning, read the profile being planned.
- Apply TypeScript hooks, `state`/`handler`/`setter`/`refs`, `Components/`/`Hooks/`/`Types/`, TanStack boundaries, formatting, and `src/tests` only to the TypeScript area. Do not translate these conventions into `.rs` modules or Rust structs by analogy.
- The Rust profile is framework-independent and covers libraries, CLI tools, server cores, workers, daemons, filesystem tools, Tauri Rust cores, and system tools. Select frameworks, runtimes, and crates only for a concrete project need.
- In a non-Tauri hybrid project, apply the full TypeScript profile inside the web area and the full Rust profile inside the core area. Read the hybrid profile for shared architecture, contracts, or build/test work; it adds boundary rules rather than a third internal architecture.
- Keep language-local changes scoped to their owner. Unrelated tooling files or the mere presence of both languages do not establish a shared web/core product. Do not route a Tauri application to general hybrid merely because both languages are present, or claim that a complete Tauri profile exists.

## Shared conventions

- Preserve clear ownership, small coherent modules, explicit runtime boundaries, and readable public contracts. The concrete structure belongs to the language profile.
- Reuse the project's installed dependencies and established APIs. Research current primary sources before selecting a new package or crate; avoid unnecessary dependencies.
- Prefer Tailwind CSS for web styling. Keep any necessary plain CSS exception small; this does not select a Rust UI framework.
- Keep changes focused on the actual request. Separate agreed requirements from proposals during planning.

## Work safely and finish the task

- Check Git status and preserve existing user changes. Read only the relevant files, callers, contracts, and tests.
- Never read, list, modify, move, or delete `drizzle/`. Never run Drizzle commands or database migrations, including through wrapper scripts. Edit schema sources only when explicitly requested; leave migration creation to the maintainer.
- Never read or print real `.env` files, tokens, keys, or credentials. Use `.env.example` for configuration work.
- Never manually edit generated routes, build output, or other generated artifacts.
- Do not weaken permissions, same-origin checks, rate limits, hashing, encryption, audit logs, or path validation to make a check pass.
- Continue within established authorization. Ask only when missing information or an actual permission boundary prevents progress; explain the concrete reason.
- Verify the changed behavior with the affected package or crate's real tooling. Inspect verification scripts for forbidden migration side effects. Report checks, existing failures, skipped checks, and remaining maintainer steps accurately.
- In German prose, write actual umlauts and ß, for example: “Öfters gehe ich Eis essen und laufe dabei über den Fluss.”

## Agent compatibility

The portable entrypoint is this `SKILL.md` and its relative references. All compatible agents use the same language selection and rules. `agents/openai.yaml` provides Codex interface metadata; other agent integrations are documented in [agents/README.md](agents/README.md). Read those notes only for installation, invocation, or compatibility work.
