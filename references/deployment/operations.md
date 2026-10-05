# Deployment operations and verification

Scope: production/runtime changes under a selected [deployment model](deployment-models.md), composed with [Docker/Compose](docker-and-compose.md), [data/recovery](data-and-recovery.md), and the affected language/runtime rules. Building, publishing, deploying, database conversion, and recovery are distinct operations with their own existing authorization. Preparing rules or documentation does not authorize live changes.

## Deployment sequence

Use the real target environment and release process, preserving a coherent existing pipeline. A fitting container delivery path is verified source → exact image build → image tests/scans → version/digest publication → target pulls that verified image → controlled service update → readiness and useful smoke checks. The CI/publisher follows [release identity](releases-and-metadata.md#release-identity-publish-and-deploy) and provider [CI/CD security](security.md); the operator path consumes registry images without a source build.

Before an authorized deployment, establish target identity/access, current and candidate image digests/platforms, actual roles/configuration/volumes, data/protocol compatibility, backup/recovery readiness, downtime expectations, and the supported update mechanism. Validate using harmless configuration without reading real environment files/secrets. A successful CI run or registry push does not establish these target facts.

Serialize competing writes to the same target, check current state before applying changes, and preserve existing data. Pull the exact candidate, update only affected roles in their dependency/drain order, and wait for bounded readiness. Use the selected model's actual restart/rollout controls; recreating a single-host Compose service is not a zero-downtime promise. Scale/HA rollouts require real capacity, traffic draining, failure-domain and mixed-version guarantees.

After the update, verify the running version/digest and intended configuration/platform, role readiness, needed dependency access, and a representative user/runtime operation. Worker/scheduler deployments need relevant processing/coordination checks rather than only the web process. Report success only when the agreed checks pass; record the precise failed or unavailable check otherwise.

## Upgrade and rollback

Document supported previous/candidate combinations for application roles, persisted state, database/cache formats, protocols and cached/independently updated clients. Same-release images do not prove state compatibility. Use [major-format upgrade planning](data-and-recovery.md#persistent-format-and-postgresql-major-upgrades) for PostgreSQL or other incompatible persisted changes; never hide conversion in a routine image update.

For a failed update, stop/drain the failing candidate as appropriate, preserve evidence/data, and restore the previous **compatible** image/configuration through the actual target mechanism. Recheck readiness, version/digest and smoke behavior. If the candidate changed state incompatibly, an image-only rollback is insufficient: use the explicit operator recovery plan, with a verified state restore/conversion path, downtime and possible lost writes acknowledged. Do not improvise a database downgrade or restore over active writers.

Keep previous immutable image references, compatible configuration and required protected backups available according to the product's rollback window. A moving channel tag cannot identify the previous deployment reliably. Registry publication does not automatically authorize target rollback or production restore; follow the established authorization and [migration boundary](data-and-recovery.md#migration-authorization-boundary).

## Runtime verification and diagnostics

Verify the operational contract that changed: startup/configuration failures, readiness/dependency loss, required child failures, restart/recovery behavior, graceful termination/drain budgets, and persistence across container replacement where relevant. Do not claim reliability from `docker build`, an open port, a running container, or an image scan alone.

Use meaningful bounded smoke checks and isolated fixtures. Diagnostics should identify the failing role, expected/running version, readiness reason, and useful resource/log context with secret/private data redacted. Do not dump rendered Compose environment, full process environments, credentials, database contents, or backups into logs/artifacts. Health/diagnostic commands must not introduce permission synchronization, migration, seeding, real mail, or another external side effect.

For persistent systems, keep both [normal and failed-startup maintenance paths](data-and-recovery.md#maintenance-when-startup-fails) documented, together with backup/restore verification and format-upgrade ownership. Operator documentation should state install/update commands, required variable names, published ports, data locations/ownership, image selection, health/log access, maintenance/recovery and compatibility limits concisely. Do not expose unnecessary internal implementation details in the installation flow.

## Infrastructure verification

Inspect Docker stages, package/build scripts, entrypoints, health/maintenance commands, and deployment callers before running them. Existing authorized runtime migration mechanisms can be documented, but agent execution through a build/startup wrapper remains prohibited under [automation safety](security.md#migration-and-side-effect-boundary).

Validate changed Docker/Compose configuration against the actual installed tooling/schema and target runtime. For [Compose config validation](https://docs.docker.com/reference/cli/docker/compose/config/), explicitly select harmless environment input and prevent implicit real `.env` or service `env_file` reads; use quiet output and supported `--no-env-resolution` or safe fixture files as appropriate. `--no-interpolate` is not a complete required-value/configuration check, and quiet output alone does not prevent secret-file reads. Keep unsafe runtime tests unexecuted with concrete prerequisites.

Where the execution chain is permitted and the change needs it, build/inspect the actual image, verify final artifacts/dependencies/platform and absence of build secrets, and run isolated startup/health/shutdown/persistence checks without publish credentials or production resources. Test restore/recovery with disposable authorized copies, never ordinary production volumes. Do not add every theoretical infrastructure test to a small change.

For Scale/HA, verify the actual replica/dependency failure, retry/queue/scheduler and rollout compatibility requirements using safe scenarios. A local Compose smoke does not prove managed service failover or multi-host HA. Keep native desktop checks in the [Tauri delivery profile](../tauri/workflow-and-verification.md), assessing additional server components separately.

Review the final diff, reference/routing consistency, side-effect boundaries and operator prerequisites. Report exactly which static, image, runtime, platform and recovery checks ran, which remain unverified, and why. A schema parse or documentation review cannot be reported as a production deployment/restore validation.

Official Docker configuration guidance above was checked on 2026-10-05. Recheck actual target/tool support and use current primary documentation for a selected production orchestrator.
