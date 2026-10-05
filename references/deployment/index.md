# Deployment and CI/CD

Scope: a shared infrastructure area composed with the selected [project and language profiles](../../SKILL.md#select-the-project-and-language-profiles). Load it for CI/CD, workflow/script changes, dependency automation, release/publish work, or repository labels/templates. It does not replace a language profile or make Docker, a server, or deployment mandatory. This first scope covers automation and delivery boundaries; extend it with Docker/Compose and operations references when those rules are actually developed.

## Identify the provider and requirements

1. Identify the affected application and its profile first. Tauri still takes precedence over general hybrid. For documentation/skill repositories or infrastructure-only tasks, derive checks from their actual deliverables; auxiliary TS scripts alone do not select a TypeScript application or hybrid profile.
2. Inspect the existing workflows, their callers/scripts, updater configuration, manifest/lockfile/toolchain locations, branch/check requirements, release events, artifact destinations, and runner capabilities. Identify the hosting/CI provider from the actual remote host and configured automation without exposing credentials embedded in remote URLs.
3. Treat provider folders as evidence, not conclusive provider detection. Forgejo can use `.github/workflows` when `.forgejo/workflows` is absent. A GitHub mirror or a copied `.github` directory does not justify selecting GitHub. If both systems are active, scope each pipeline to its real host and purpose; avoid duplicate publishing or competing dependency bots.
4. Inspect the canonical provider reference and a neighboring implementation before proposing infrastructure changes. Preserve coherent existing structure, scripts, updater choices, and triggers unless a concrete improvement within the request justifies changing them. Do not migrate providers or generate a complete workflow suite merely because this skill is installed.
5. Select only capabilities justified by the product, artifacts, supported platforms, trust boundaries, and available services. Record the selected checks, release channels, runner assumptions, required label/secret names, and any unavailable prerequisite. Resolve an ambiguous provider or release target before dependent writes; continue independent inspection.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Any CI/CD setup or change: workflow selection, project matrix, script ownership, verification | [Shared CI/CD](ci-cd.md) and [automation security](security.md) |
| GitHub Actions, Dependabot, GitHub repository/release automation | [GitHub](github.md) |
| Forgejo Actions, Renovate, Forgejo repository/release automation | [Forgejo](forgejo.md) |
| Jobs under Kevin's `.forgejo/workflows/`: specialized `bun`/`rust`/`tauri` selection | [Forgejo runners](forgejo-runners.md), with the Forgejo reference |
| Release identity, publishing, compatibility, changelog categories, labels, templates, banners | [Releases and metadata](releases-and-metadata.md) |

Read only the active provider's reference. Load releases and metadata when its decisions are affected, including dependency label configuration. For another established provider, use the common rules and its current official documentation; do not invent a GitHub/Forgejo folder or force a provider conversion.

Language commands and delivery constraints remain in [TypeScript verification](../typescript/workflow-and-verification.md), [Rust verification](../rust/testing-and-verification.md), [hybrid coordination](../hybrid/workflow-and-verification.md), and [Tauri verification](../tauri/workflow-and-verification.md). Shared scope, authorization, secret, generated-file, and Drizzle/migration restrictions remain authoritative in [SKILL.md](../../SKILL.md#work-safely-and-finish-the-task).
