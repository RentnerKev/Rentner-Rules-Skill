# Releases and repository metadata

Scope: [deployment routing](index.md) for releases, dependency labels, changelog categories, templates, and branded assets. Compose the active provider reference and [automation security](security.md).

## PR title policy

Follow the [shared Git rules](../../SKILL.md#git-branches-and-pull-requests). Validate Conventional Commit titles as `type(scope): description` or `type: description`, with optional `!` for breaking changes, for example `fix(auth): Anmeldung korrigieren`. Reject empty descriptions and multiline/control-character input. Rerun after title edits, not only source pushes.

Preserve a consistent established type set. The normal shared vocabulary is `feat`, `fix`, `docs`, `refactor`, `test`, and `chore`; `perf`, `build`, `ci`, `style`, and `revert` are useful additional Conventional Commit types where adopted. Define permitted types once in the owning validation policy and align branch/PR rules, bot commit messages, and changelog parsing with that policy. Do not maintain divergent GitHub/Forgejo regex lists or replace an established type set unnecessarily.

## Labels and changelog categories

Use a small common vocabulary, extended only for actual automation/product areas. A normal base for an active issue/PR workflow is `bug`, `enhancement`, `documentation`, `dependencies`, `security`, and `ci`; provision only labels that have real consumers. Add delivery, version and editorial labels as needed:

| Labels | Consumer/meaning |
| --- | --- |
| `major`, `minor`, `patch` | Actual SemVer dependency update classification; not arbitrary release severity inferred from an area |
| `release`, `deploy` | Real release/delivery changes |
| `breaking-change` | Explicit breaking behavior with a visible notes/compatibility category |
| `no-changelog` | Deliberate exclusion under the project's notes policy |
| `release-highlight` | Selected highlights, not every change |
| `area: auth`, `area: database`, `area: docker`, `area: ui`, or another real domain | Actual paths/responsibilities, only where that domain exists |

Reuse suitable existing names, casing, colors and descriptions. Do not copy RentnerProxy's proxy/certificate labels or TanstackDummy's extra maintenance/tooling labels without a corresponding target area/consumer.

Dependency PRs retain `dependencies` plus supported update-type and relevant area/tooling labels. Mixed minor/patch groups may carry their actual represented types, but never imply every change is a patch. Identify real vulnerability fixes as `security`; do not assign it to all routine updates. Pin/digest/lock maintenance changes need a deliberate non-SemVer mapping if labeled.

Derive ordered changelog categories from the labels/types actually used. A useful mapping is breaking changes → `breaking-change`/breaking commit marker, security → `security`, features → `enhancement`/`feat`, fixes → `bug`/`fix`, dependencies → `dependencies`, CI → `ci`, and documentation → `documentation`/`docs`, plus an honest fallback. Add performance/refactoring/deployment only when present. Define precedence for multiply labeled entries, exclusion policy, and highlight selection once; do not lose security or breaking information through a broad dependency category. Empty categories should be omitted.

When commits drive notes, explicitly map adopted labels and commit types to the same semantic categories; labels alone do not change a commit-based generator. Preserve the project's actual issue/PR/commit source of truth, release range/channel semantics, and maintainer-authored notes. Include useful version/date/channel, compare/source links, highlights and contributors where evidence supports them; never fabricate changes or a production-readiness claim from a channel name.

Before enabling updater, labeler, templates, or notes automation, verify the required labels exist. Synchronize missing labels through supported API tooling when the task already authorizes it, preserving unrelated labels. Otherwise report the exact missing names and maintainer step, and mark label-dependent automation as incomplete until provisioning is confirmed. Do not leave a supposedly finished workflow silently depending on nonexistent labels. Use trusted metadata-only automation for label writes; no PR code needs write tokens.

## Release identity, publish, and deploy

Distinguish a versioned release, publishing artifacts to a registry/download service, and deploying those artifacts to an environment. A release need not deploy anything. Use an existing release event or an explicitly defined tag/manual/version trigger; verify its provider semantics and guard trusted refs. Do not introduce a second independent publisher for the same destination.

A fitting sequence is checks → verify release identity → build exact source → inspect artifacts → assign/verify versions and tags → publish → update notes → appropriate smoke/runtime checks. Adapt the order to the existing process: a `release: published` event already has a tag/release, so validate it rather than creating another one. Do not apply this sequence as mandatory boilerplate.

- Validate repository, release/event identity, tag syntax, prerelease/channel agreement, permitted source refs/ancestry, and the resolved commit. Recheck identity before writes when source or event metadata could have changed. Build the expected commit/tag, not an unrelated default-branch checkout or untrusted PR revision.
- Keep trusted automation and build source distinct when their trust/revision differs. Pass exact validated identities between jobs and verify artifact provenance/digests/platforms rather than rebuilding a different artifact after approval/scan.
- Use immutable version/source tags and record image/artifact digests. Moving dev/channel tags are conveniences, not immutable identities. Protect existing versioned artifacts from silent overwrite/collision and make retries idempotent for the same verified release.
- Verify the published artifact/version/channel resolves to the expected digest and inspect packaging contents. Use SBOM/provenance/signature checks where supported and useful; their presence does not replace runtime validation.
- Publication success is not a push exit code alone. For runnable deliverables, perform suitable isolated startup/smoke/runtime verification. For a library or CLI, verify its actual package/binary behavior. Live-environment checks/deployments still require their real authorization and safe resources.
- Use the existing [hybrid release compatibility](../hybrid/workflow-and-verification.md#release-and-api-compatibility) and [Tauri bundle/signing/updater](../tauri/workflow-and-verification.md#bundles-signing-and-updates) rules where selected. Record supported component/client combinations, breaking API/protocol/persisted-format changes, rollout/rollback order, and recovery consequences when relevant. Do not infer database migration permission from compatibility work.

Serialize writes by target/channel/environment, including competing workflows. Keep registry, release, deployment and signing rights confined to the operation that needs them. Untrusted previews cannot publish releases or deploy to production; apply the [security handoff boundary](security.md#untrusted-input-and-privileged-automation).

## Release banners and assets

Projects with releases should have a professional project-branded release banner under `.github/assets/release-banners/` or `.forgejo/assets/release-banners/` according to the active provider. Detect real release channels before selecting variants. One channel needs only one suitable banner; alpha/beta/stable variants are appropriate only when those channels exist. RentnerProxy's `alpha-release-banner.png`, `beta-release-banner.png`, and `new-release-banner.png` illustrate channel-specific assets, not mandatory filenames or branding.

Reuse actual project identity, colors, logo and existing branding resources, or generate a genuine image when that capability is available. Verify the image decodes, its dimensions/legibility and format match the release design, and referenced filenames exist. Never copy another project's banner/name, rename text to `.png`, or create broken/empty placeholder assets.

When image generation is unavailable, use a suitable existing branding asset with the rights to use it or record a concrete maintainer step specifying required banner, channel, destination and expected design/format. Missing artwork must be explicit; do not emit a broken image link or claim banner completion. Do not introduce a guaranteed release failure for an acknowledged missing optional asset.

Render the banner with meaningful alt text and a provider-supported stable URL or uploaded release asset. Verify rendering/access from the release audience and channel/asset identity. Keep uploads and notes updates rerun-safe, preserve deliberate maintainer edits, and avoid recursive release triggers when automation edits notes. Templates should ask only project-relevant questions and route sensitive reports through the actual private reporting path.
