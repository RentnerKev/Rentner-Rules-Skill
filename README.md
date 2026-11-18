![Rentner Rules – TypeScript, Rust, Hybrid and Tauri](.github/assets/release-banners/new-release-banner.png)

# Rentner Rules Skill

[![Validation](https://github.com/RentnerKev/Rentner-Rules-Skill/actions/workflows/release.yml/badge.svg)](https://github.com/RentnerKev/Rentner-Rules-Skill/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/RentnerKev/Rentner-Rules-Skill)](https://github.com/RentnerKev/Rentner-Rules-Skill/releases/latest)
[![MIT License](https://img.shields.io/github/license/RentnerKev/Rentner-Rules-Skill)](LICENSE)

Reusable coding and delivery conventions by Kevin Sträßler. One portable skill selects the affected application, loads its relevant rules, and preserves existing project structure and user instructions.

## Covered areas

| Area | Rules |
| --- | --- |
| [TypeScript / React / TanStack](references/typescript/index.md) | Feature ownership, presentation and logic hooks, config, backend, tests |
| [Rust](references/rust/index.md) | Modules, ownership, errors, Cargo, runtime safety, tests |
| [Go](references/go/index.md) | Package boundaries, standard library, errors and concurrency, module tooling, central `tests/` |
| [Hybrid web/core](references/hybrid/index.md) | Root tooling, language boundaries, contracts, coordinated checks |
| [Tauri](references/tauri/index.md) | Native IPC, capabilities, lifecycle, platform delivery; takes precedence over general hybrid |
| [Dependencies and documentation](references/dependencies-and-documentation.md) | Installed-version APIs, local `/ai` helpers, dependency research |
| [HTTP APIs and credentials](references/http-apis-and-credentials.md) | Versioned endpoints and `pub_<id>.pvt_<secret>` integration keys |
| [Deployment and CI/CD](references/deployment/index.md) | Kiri, complete product images, PostgreSQL/Valkey, GitHub/Forgejo, releases and recovery |

[SKILL.md](SKILL.md) owns shared permissions, Git conventions, concise documentation, validation, and cleanup. Language references own their implementation details. React action feedback uses [`@rentnerkev/toasts`](references/typescript/frontend.md#action-feedback-and-toasts) with both title and content.

## Install

Install globally for Codex using the pinned Skills CLI:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a codex
bunx skills@1.7.0 list -g -a codex
```

Use `npx` instead of `bunx` when Bun is unavailable. Omit `-g` for a project installation. Keep the entire skill directory, including all supporting references. Installation adds instructions, not application dependencies.

For other agents, multiple targets, installation paths, and manual setup, see [agent integrations](agents/README.md).

## Update

```powershell
bunx skills@1.7.0 update rentner-rules -g
bunx skills@1.7.0 check -g
```

Updates follow the installed source/ref. To change a pinned release, repeat `add` with the desired GitHub `/tree/<tag>` URL; each [release](https://github.com/RentnerKev/Rentner-Rules-Skill/releases) includes its exact installation command.

## Use

```text
$rentner-rules

Apply the relevant project/language profiles to this task.
Preserve existing changes and run the affected checks.
```

Compatible agents can also select the skill by relevance. Explicit user requirements and repository instructions take precedence. Planning requests remain planning until implementation is requested. The skill works independently of any model or orchestration package.

## Validate

```powershell
bunx skills@1.7.0 add . --list
bun --no-env-file test ./.github/scripts/ci/format-policy.test.ts
```

Expected skill: `rentner-rules`. [CI](.github/workflows/release.yml) checks required files, local references, interface metadata, discovery, and formatter behavior. It does not claim runtime validation in every supported coding agent. Releases use SemVer tags.

## License

[MIT](LICENSE). Copyright © 2026 Kevin Sträßler. Listed on [skills.sh](https://skills.sh/RentnerKev/Rentner-Rules-Skill/rentner-rules).
