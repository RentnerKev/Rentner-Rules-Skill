# Rentner Rules Skill

Reusable coding conventions by Kevin Sträßler for React, TypeScript, and TanStack Start applications.

The skill covers predictable feature structure, presentation components, grouped logic hooks, declarative configuration, clean package usage, and verified changes. It is packaged like [Hybrid Coding Skill](https://github.com/RentnerKev/Hybrid-Coding-Skill).

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

Install for another supported agent by replacing `codex` with its agent identifier, or omit `-a codex` to select agents interactively.

## Update

```powershell
bunx skills@1.7.0 update rentner-rules -g
bunx skills@1.7.0 check -g
```

## Usage

```text
$rentner-rules

Implement the requested feature using these conventions.
Preserve existing changes and run the relevant checks.
```

The skill can also be selected automatically when the task and project match its description. Explicit user requests and applicable repository instructions take precedence.

For planning, ask for a plan or rules discussion first; the skill keeps that work at the planning stage.

It works independently of Hybrid Coding. When both are used, Hybrid Coding provides orchestration and Rentner Rules provides code and architecture conventions.

## Conventions

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

Full instructions are in [SKILL.md](SKILL.md), with examples in [references](references/architecture.md).

## Repository structure

```text
Rentner-Rules-Skill/
├── SKILL.md
├── README.md
├── LICENSE
├── .gitignore
├── agents/
│   └── openai.yaml
├── references/
│   ├── architecture.md
│   ├── frontend.md
│   ├── dependencies-and-config.md
│   ├── backend-and-safety.md
│   └── workflow-and-verification.md
└── .github/
    └── workflows/
        └── release.yml
```

The repository contains one skill, so `SKILL.md` lives directly in the repository root. No application dependencies are installed by this skill.

## Validation and releases

Check local skill discovery without installing:

```powershell
bunx skills@1.7.0 add . --list
```

Expected skill: `rentner-rules`.

The GitHub workflow validates required files, local Markdown links, Codex interface metadata, and CLI discovery on pushes, pull requests, and published releases. Release tags use SemVer, for example `v1.0.0`.

## skills.sh

Directory page: [skills.sh](https://skills.sh/RentnerKev/Rentner-Rules-Skill/rentner-rules). Listing and installation counts are handled by the Skills CLI; see the [skills.sh FAQ](https://skills.sh/docs/faq).

## License

[MIT License](LICENSE). Copyright © 2026 Kevin Sträßler.
