# GitHub automation

Scope: [deployment routing](index.md) when GitHub is the active provider. Compose [shared CI/CD](ci-cd.md), [security](security.md), and the selected project profiles.

## Canonical reference and workflow selection

Inspect the current [RentnerProxy `.github` infrastructure](https://github.com/RentnerKev/RentnerProxy/tree/main/.github) before substantial GitHub setup. It is the canonical reference for workflow quality and the main reference for a genuine non-Tauri TypeScript + Rust product, not a copy-paste template. For focused existing changes, also inspect the corresponding neighboring workflow and scripts.

The reference checked on 2026-10-05 at commit `4c390f82b3aa35b984f36811cb00fb6d61c9568f` demonstrates separate language checks, Conventional Commit titles including edits, actionlint, redacted Gitleaks, CodeQL, dependency review/audit, Scorecard, PR labeling, issue/PR templates, CODEOWNERS, Dependabot, release notes/pipeline, dev images, separate preview build/publish, production smokes, compatibility, reliability, and scale checks. These are selectable concepts under the [capability matrix](ci-cd.md#select-workflows-from-evidence), not a required workflow suite or permanent toolchain pins.

- Select CodeQL languages from real source and the current supported language/build-mode matrix. Do not add Rust analysis to TypeScript-only projects or JS/TS analysis to a Rust-only project; Actions analysis is a separate infrastructure decision. Check repository plan/feature availability and upload permissions. See [CodeQL support](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning).
- Dependency review checks incoming dependency changes; advisory audits catch resolved vulnerabilities, including new advisories without a PR. Use each for its actual coverage. Scorecard is an optional repository/supply-chain assessment, not a replacement for either.
- Derive runtime smokes/reliability/scale from the actual service and isolated fixtures. Do not copy proxy, certificate, appliance, backup/restore, database-migration, or historical release matrices into unrelated projects. Apply the [migration boundary](security.md#migration-and-side-effect-boundary) before reusing any reference check.
- Dev/preview/container jobs require actual artifacts and channels. Keep privileged preview publishing separate from untrusted builds under the [handoff rules](security.md#untrusted-input-and-privileged-automation).

## Provider files and metadata

Use `.github/workflows/` and appropriate `.github/scripts/{ci,security,release,deploy,lib}/` ownership from [shared CI/CD](ci-cd.md#provider-ownership-and-workflow-scripts). Create only needed files:

| Path | Purpose |
| --- | --- |
| `.github/dependabot.yml` | Actual dependency ecosystems and update policy |
| `.github/labeler.yml` | Path rules derived from actual product areas and their tests/configuration |
| `.github/ISSUE_TEMPLATE/` | Relevant issue forms/templates and optional contact configuration |
| `.github/pull_request_template.md` | Project-specific change context, verification, risks, and relevant issue references |
| `.github/CODEOWNERS` | Actual accountable repository/team owners; include automation ownership when appropriate |
| `.github/assets/release-banners/` | Genuine branded assets for actual release channels |

Read [labels and changelog rules](releases-and-metadata.md#labels-and-changelog-categories) before adding label consumers. RentnerProxy's labeler illustrates domain-derived rules; `area: proxy` and `area: certificates`, its users, and its issue questions are not global defaults. Validate form syntax and ownership against current GitHub support.

## Permissions and trusted execution

Use a restricted workflow default such as `permissions: {}` or `contents: read` according to actual checkout/read needs. Grant only specific jobs `pull-requests: write`, `contents: write`, `packages: write`, `security-events: write`, or OIDC rights when required by their operation. Prefer the automatic token to a broad PAT when it suffices.

Metadata-only labeling may use `pull_request_target` with minimal rights and trusted automation; never checkout or execute PR source in that context. A `workflow_run` publisher must validate the exact source run, workflow/check provenance, commit and artifact, not just a successful name. Protect release/deploy targets and credentials using the project's supported environment/branch controls. Follow [GitHub's secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use) and the common [security rules](security.md).

## Dependabot

Prefer Dependabot for GitHub dependency automation, preserving a coherent existing updater unless a requested change justifies migration. Use `.github/dependabot.yml`, `version: 2`, and entries only for ecosystems with real manifests/locks/build inputs. Verify current GitHub/GHES support before writing config. Current keys include:

| Actual input | `package-ecosystem` |
| --- | --- |
| Bun package and lockfile | `bun` |
| npm, or actual pnpm/Yarn projects supported through that ecosystem | `npm` |
| Cargo package/workspace | `cargo` |
| Dockerfiles | `docker` |
| Compose image dependencies | `docker-compose` |
| GitHub Actions / remote reusable workflows | `github-actions` |

Add other supported ecosystems only where used. Derive `directory`/`directories` from their owning manifests, workspace/build files, and the language profiles; a hybrid web source directory is not automatically a package directory. Avoid duplicate Bun/npm ownership of the same manifest. Include Actions updates whenever GitHub Actions are used.

Set the following inside **each selected ecosystem entry** for ordinary version updates:

```yaml
cooldown:
    default-days: 1
```

Use the officially supported cooldown rather than a custom sleep/date filter. Keep security updates enabled where supported; this cooldown governs version updates and must not intentionally delay vulnerability fixes. Do not add blanket exclusions or copy reference project exceptions. Check ecosystem timestamp/support limitations and report any gap instead of claiming universal coverage. See the [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

Derive schedules/timezones, PR limits, and groups from review capacity and ecosystem churn; Forgejo's fixed Renovate run time is not a global GitHub schedule. Minor/patch grouping is useful when it improves reviewability. Keep majors separate from routine groups; use `groups.update-types`/`applies-to` where supported rather than indiscriminate cross-ecosystem grouping.

Keep `dependencies` and meaningful ecosystem/area labels. Provision `major`, `minor`, and `patch` for SemVer updates; current Dependabot applies existing SemVer labels alongside defaults/custom labels. Explicit `labels` replaces default dependency/ecosystem labels, so retain needed ones; missing custom labels can be ignored by the platform. Security fixes need an identifiable `security` label through verified updater/platform metadata or trusted metadata automation, not by labeling every version update as security. Non-SemVer/digest updates must not be mislabeled as patch changes. See [label consistency](releases-and-metadata.md#labels-and-changelog-categories).

## Releases

Use RentnerProxy's release design as a reference for a clear channel/version/date header, project banner, highlights, ordered label-driven categories, relevant contributors, and compare links. Its generator uses eligible completed issues/milestones and release windows; preserve the target project's actual issue/PR/commit source of truth instead of forcing issue-based notes everywhere.

Separate preparation/identity checks, exact-source builds, artifact publication, and notes updates with the rights each operation needs. Only add container tables, registry tags, compatibility, or runtime steps when relevant. Follow the common [release identity and banner rules](releases-and-metadata.md), and validate the published digest and appropriate runtime before reporting delivery success.

Official sources above were checked on 2026-10-05. Recheck time-sensitive ecosystem, CodeQL, action/runtime, permission, and release API support when applying these rules.
