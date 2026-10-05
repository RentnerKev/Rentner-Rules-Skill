# Forgejo automation

Scope: [deployment routing](index.md) when Forgejo is the active provider. Compose [shared CI/CD](ci-cd.md), [security](security.md), and the selected language/project profiles.

## Canonical reference

For Kevin's projects, inspect an accessible `TanstackDummy` first: its `.forgejo/workflows/`, `.forgejo/scripts/`, `renovate.json`, `cliff.toml`, templates, and release banners. It is the canonical Forgejo style/reference, not a source of global product names, hosts, ports, registry paths, runner labels, credentials, or version pins. If unavailable, use a good reachable neighboring Forgejo implementation and official docs; state that the canonical reference was not inspected.

The local reference inspected on 2026-10-05 demonstrates title edits, scoped checks, workflow normalization/policy lint, redacted Gitleaks, scheduled security, separately verified dev/live image publishing, branded release changelogs, and daily/manual Renovate. Its scripts are currently flat; the [preferred provider script ownership](ci-cd.md#provider-ownership-and-workflow-scripts) guides new organization without requiring a wholesale migration. Its internal-package release-age exemptions and uses of `GT_TOKEN` are not general defaults.

## Version and runner capabilities

Inspect the deployed Forgejo and runner versions, configured action registry, supported events/contexts/actions, token behavior, runner labels/images, tools, and artifact/API support. Forgejo Actions is familiar to GitHub Actions but not identical. Check the deployed version's [workflow reference](https://forgejo.org/docs/latest/user/actions/reference/) and [known differences](https://forgejo.org/docs/latest/user/actions/github-actions/) before copying GitHub keys.

Current Forgejo documentation describes ignored GitHub-style `permissions` keys; they are not a permission boundary. Do not emit a cosmetic GitHub permissions block or treat it as protection. Enforce least privilege through actual event-token behavior, scoped credentials/authorized integrations, repository/runner controls, and separated privileged operations. OIDC, if needed, uses Forgejo's supported mechanism rather than assuming `permissions: id-token: write`. Prefer native Forgejo contexts/environment paths when supported; use verified GitHub compatibility aliases only where the installed actions require them.

For Kevin's `.forgejo/workflows/`, always load and apply the [specialized runner strategy](forgejo-runners.md): TypeScript/Bun jobs use `bun`, Cargo jobs use `rust`, and Tauri native build/packaging jobs use `tauri`; hybrid language jobs stay separate. Infrastructure/integration jobs follow their actual tool requirements. Verify the actual versions and OS/native/container capabilities rather than assuming every tool or target from a label. The fixed mapping is scoped to that infrastructure and directory; other installations and legacy fallback workflows use their verified runner configuration.

Apply [runner and cache isolation](security.md#secrets-runners-caches-and-evidence). Use supported concurrency groups to serialize destination writes; current documentation describes best-effort exclusion, so strict deployment locking may need a target-side guard.

## Select the workflows

Use `.forgejo/workflows/` and `.forgejo/scripts/{ci,security,release,deploy,lib}/` as needed. The following names describe capabilities; preserve suitable existing names and combine/split according to the [shared selection rules](ci-cd.md#select-workflows-from-evidence).

| Workflow | Applicable behavior |
| --- | --- |
| Pull Request | Conventional Commit title validation on `opened`, `reopened`, `synchronize`, and `edited` so title changes rerun; add other events only when supported. Use the [consistent types](releases-and-metadata.md#pr-title-policy) |
| CI | Relevant PR/default-branch pushes and useful manual runs; actual format/lint/type/test/lock/build checks, optional identity checks, Compose validation and runtime-image checks where used; distinct language and actual boundary/integration checks for hybrid |
| Workflow Lint | YAML/expressions, action sources/inputs, and provider security policies; validate actual Forgejo behavior as well as supported GitHub-like syntax |
| Gitleaks | Incoming PR/push commits and useful manual full scans, sufficient history/range, findings redacted, narrow justified allowlists |
| Security Scheduled | Useful scheduled/manual audits for the real ecosystems and artifacts: Cargo or Bun/npm vulnerabilities, container scans, relevant SBOM/static checks; reuse risk-appropriate coverage |
| Publish Dev / Publish Live | Real distributable artifacts with distinct channels, trusted triggers, verified commit/artifact identity, scoped publication rights, and appropriate smoke/runtime verification |
| Release Changelog | Published/defined releases, exact release source, project design and label/category alignment under [release metadata](releases-and-metadata.md) |
| Release Compatibility | Actual separately updated components/protocol/API consumers or persistent contracts, using their promised compatibility window |
| Preview Builds | A beneficial isolated channel and verified trusted handoff; no automatic library/CLI/desktop preview suite |
| Renovate | Daily 03:00 UTC plus manual execution on trusted automation, dashboard and the update policy below |

Keep title-only checks metadata-oriented; pass the title as data and do not needlessly grant secrets. Ordinary PR source checks use `pull_request`. Do not use `pull_request_target` to run PR checks with write tokens; any exceptional metadata-only use requires the explicit trusted-code boundary and real provider policy. TanstackDummy's prohibition of that event is a sound existing policy to preserve.

An actionlint pass can help but does not prove Forgejo compatibility. If qualified URLs/SHA pins prevent input validation, a checked adapter may normalize **temporary copies** to the correct upstream/version for linting. Verify the URL/host and SHA/version provenance, do not rewrite source workflows or silently map an unrelated host to a GitHub action, and keep suppressions narrow. Add policy checks for pinning, disabled persisted checkout credentials, timeouts, unsupported permission keys, secret/event misuse, and unsafe runners. Use current [actionlint documentation](https://github.com/rhysd/actionlint/tree/main/docs) and Forgejo docs rather than copying the reference's regex rules as a complete parser.

## Renovate

Prefer Renovate for Forgejo, preserving coherent existing automation unless migration is part of the request. Run it from trusted default-branch automation daily at **03:00 UTC** and additionally through `workflow_dispatch`:

```yaml
on:
    schedule:
        - cron: '0 3 * * *'
    workflow_dispatch:
```

Keep UTC explicit; on a version supporting schedule timezones, do not set a different timezone for this convention. Cron config describes intended execution time, not a guarantee of immediate runner capacity. A repository-level Renovate `schedule` limits allowed updates; it does not start the bot. Reuse an existing central bot when it already provides these runs rather than creating competing runners.

Configure the bot's `platform=forgejo`, actual API endpoint and explicit repository scope (or a deliberately bounded central discovery scope) in trusted runner/bot configuration. Keep credentials out of repository JSON. Preserve supported existing config filenames such as `renovate.json`; validate with the installed Renovate config validator. See [Forgejo platform configuration](https://docs.renovatebot.com/modules/platform/forgejo/).

Use a current validated repository configuration with a dependency dashboard and a one-day buffer for ordinary new versions. A minimal policy fragment is:

```json
{
    "$schema": "https://docs.renovatebot.com/renovate-schema.json",
    "extends": ["config:recommended"],
    "dependencyDashboard": true,
    "minimumReleaseAge": "1 day",
    "minimumReleaseAgeBehaviour": "timestamp-required",
    "internalChecksFilter": "strict",
    "automerge": false,
    "labels": ["dependencies"],
    "packageRules": [
        { "matchUpdateTypes": ["major"], "addLabels": ["major"] },
        { "matchUpdateTypes": ["minor"], "addLabels": ["minor"] },
        { "matchUpdateTypes": ["patch"], "addLabels": ["patch"] }
    ]
}
```

Recheck the installed version/schema before using the fragment. Keep majors separate from any selected minor/patch groups, derive PR limits from review capacity, and enable automerge only for an actual requested policy with verified required checks. Use `addLabels` for additive rules so `dependencies` is retained. Pin/digest/lock maintenance changes are not automatically SemVer patches; add only meaningful existing labels. Follow [shared label provisioning](releases-and-metadata.md#labels-and-changelog-categories).

The buffer needs registry/datasource release timestamps. Keep missing timestamps visible in the dashboard rather than silently bypassing the policy; do not copy TanstackDummy's private-package exemptions. Digest changes, pinning and lockfile maintenance have different coverage, and a tag's commit timestamp is not proof of immutable publication age. Check the actual datasource and transitive-resolution limitations; document a specific missing prerequisite rather than claiming every dependency is aged. See [minimum release age](https://docs.renovatebot.com/key-concepts/minimum-release-age/).

Security fixes must not be intentionally delayed by the normal buffer. Verify the actual vulnerability source and manager/platform support: ordinary updater PRs do not constitute a complete vulnerability-remediation service on Forgejo. Enable supported security automation or use scheduled advisory checks and a concrete expedited fix path, with `security` labeling. Current [Renovate vulnerability options](https://docs.renovatebot.com/configuration-options/#vulnerabilityalerts) and optional OSV coverage need their own applicability check; do not promise GitHub-native security alerts on Forgejo.

### Managers and action updates

Detect actual Bun/npm packages/locks, Cargo workspaces, Dockerfiles, Compose and other present inputs. Use the relevant native managers (`bun` or `npm`, `cargo`, `dockerfile`, `docker-compose`, `github-actions`) rather than adding unused ecosystems or duplicate manifest ownership. Current [Bun manager](https://docs.renovatebot.com/modules/manager/bun/) support is distinct from npm; check installed lockfile compatibility.

The [native `github-actions` manager](https://docs.renovatebot.com/modules/manager/github-actions/) already matches `.forgejo/workflows/` and action files. Start there; do not add a regex manager just to recognize that directory. For GitHub-hosted actions, use supported digest pinning, such as `helpers:pinGitHubActionDigests`, and maintainable version comments. Check extraction and SHA/comment updates for the actual fully qualified action hosts. If a host or a meaningful existing annotation scheme needs a custom manager, scope it narrowly, verify datasource/digest support and replacement behavior, and prevent duplicate native/custom ownership. Do not set `pinDigests` on a datasource that cannot resolve them.

### Available secret names

Kevin's Forgejo repositories conventionally provide these names; check that the target has the required name/authorized scope without reading values:

| Name | Intended use |
| --- | --- |
| `RENOVATE_TOKEN` | Primary scoped Renovate/Forgejo bot token |
| `RENOVATE_GH_TOKEN` | Optional GitHub metadata/changelog access; map to Renovate's supported GitHub token setting only when that integration needs it |
| `GT_TOKEN` | Powerful general-purpose repository token; use only for a necessary operation that narrower credentials/the automatic token cannot perform |

Never pass any of these to untrusted PR code, install scripts, or artifacts. Private registry access needs the narrowest suitable credential and host/path scope. Do not use `GT_TOKEN` as a convenience default for CI, labels, releases, or Renovate. See [Forgejo token/runner security](https://forgejo.org/docs/latest/user/actions/security/) and the common [secret rules](security.md#secrets-runners-caches-and-evidence).

## Templates and release design

Use the deployed Forgejo version's [issue/PR template support](https://forgejo.org/docs/latest/user/repository/issue-pull-request-templates/). Current documentation accepts `.forgejo/ISSUE_TEMPLATE/` and `.forgejo/issue_template/`, plus `.forgejo/pull_request_template.md`; preserve a supported existing spelling and use the actual Forgejo schema rather than assuming identical GitHub form fields. Derive questions, labels, ownership metadata, and private reporting links from the project.

For changelog design, adapt TanstackDummy's branded banner, version/channel/date header, compare link, prominent breaking changes, and readable ordered categories. Its git-cliff/Conventional Commit source is a reference; align categories with the actual labels/commit types and preserve deliberate existing notes. Do not require the same generator, host, dev/live names, or categories everywhere. Verify release API/asset support and use rerun-safe asset/notes updates under the common [release rules](releases-and-metadata.md).

Official sources above were checked on 2026-10-05. Recheck deployed Forgejo/runner behavior and Renovate manager/schema/API support before concrete configuration.
