# Automation security

Scope: all providers selected through [deployment routing](index.md). The [shared safety rules](../../SKILL.md#work-safely-and-finish-the-task) remain authoritative; this reference applies them to automation trust boundaries.

## Actions, tools, and workflow rights

- Pin remote actions and reusable remote workflows to verified full commit SHAs wherever the action host and updater support them. Verify the commit belongs to the intended upstream repository/release; pinning unknown code does not establish trust. Add a readable version comment when the updater can maintain it reliably, for example `owner/action@FULL_COMMIT_SHA # vX.Y.Z` as a notation, never as executable configuration with a fake SHA.
- Do not use arbitrary `@main`/`@master` references for security-sensitive CI. Qualify Forgejo action hosts when shorthand would depend on an ambiguous configured action registry. Keep same-repository actions/workflows within the appropriate trusted revision.
- Verify downloaded binaries/images against upstream release checksums/signatures or digests where supported. Avoid unverified download-and-execute pipelines. Recheck stable upstream releases and runner/runtime compatibility rather than copying reference version numbers.
- Disable checkout credential persistence by default (`persist-credentials: false`). Give the automatic workflow token minimal effective rights; expand only the job that needs a specific write. Provider-specific enforcement is defined in [GitHub](github.md#permissions-and-trusted-execution) and [Forgejo](forgejo.md#version-and-runner-capabilities).
- Define job timeouts. Cancel superseded PR/CI checks with provider-supported concurrency. Serialize release/publish/deploy operations sharing a destination/environment without cancelling an in-progress write; use the same destination group across competing workflows. Check provider guarantees and use a target-side lock/idempotency guard where strict exclusion matters.

## Untrusted input and privileged automation

PR code, workflow changes, titles/bodies, refs, manual inputs, caches, and artifacts can be untrusted. A same-repository or dependency-bot PR is not a reason to grant it publication or signing rights.

- Run PR source checks with restricted tokens, no release/deploy/registry/signing or broad repository secrets, and isolated execution. If a private dependency cannot be fetched safely without a credential exposed to PR code or its install scripts, use a safe pre-provisioned dependency path, a narrower isolated mechanism, or report the missing prerequisite; never substitute a broad token.
- Privileged metadata automation must execute trusted base/workflow code and handle PR data as data. Do not checkout, install, source, evaluate, or run PR code in `pull_request_target` or a privileged follow-up workflow. Ordinary PR verification must not switch to that event to gain secrets.
- Pass titles/refs and other external strings through environment variables or structured arguments; validate semantics and quote them. Do not interpolate event expressions directly into shell code, use `eval`, or trust unvalidated data written into output/environment files. Reject control characters and invalid IDs/refs where the contract requires them.
- A successful workflow name/status alone is insufficient for privileged artifact handoff. Verify the source repository, trusted workflow identity/revision, event, run ID/attempt, exact tested commit, required-check provenance, current PR/release state, artifact identity and digest. Validate archive paths/types/sizes; treat downloaded contents as data and never execute them with publication credentials.
- Build previews without privileged secrets. If a separate trusted publisher is justified, let it validate and copy the exact artifact into an isolated preview namespace without running PR scripts, installers, or the preview runtime. Revalidate the current commit/state before writes; do not promote untrusted previews into release/production channels.

## Secrets, runners, caches, and evidence

Use secret names and documented purposes only; never inspect actual values. Scope required credentials to the specific operation and host/registry path, prefer short-lived or narrowly scoped access, and clean temporary authentication files after use. Keep shell tracing and verbose authentication/debug output disabled. Do not dump complete contexts/environments, authenticated URLs, secret-bearing errors, or raw private payloads. Automatic masking alone is insufficient; redact scanner findings and sanitize logs/reports before artifact upload.

Use isolated disposable runners for untrusted PR execution. Keep privileged publishing/signing/deployment runners separate from PR jobs and ordinary services. Check actual self-hosted runner trust, OS/architecture, container/host mode, network access, and persisted state. A runner label or job container does not prove isolation: host mounts, a Docker socket, privileged containers, and shared long-lived hosts can expose credentials or the host. Do not give untrusted jobs those capabilities without a verified isolation design.

Separate caches and artifacts by trust level and meaningful toolchain/lockfile/platform identity. Do not restore PR-writable caches into privileged jobs or rely on a cache hit as dependency verification. Store only needed sanitized artifacts, use appropriate retention, and clean up resources owned by the run even on failure. Avoid broad cleanup of unrelated runner resources.

## Migration and side-effect boundary

The [Drizzle and schema boundary](../typescript/backend-and-safety.md#drizzle-and-schema-boundary) and shared restrictions apply equally to CI scripts, builds, Dockerfiles, entrypoints, release hooks, and deployment automation. Do not read/traverse/change `drizzle/`, run Drizzle or database migrations, or introduce hidden migration commands into any execution chain. RentnerProxy's database-migration CI steps are project-specific exceptions in that reference, not conventions to copy or execute through this skill.

Database integration checks must use already permitted isolated fixtures or mocks/unit/contract checks without agent-run migrations. If preparation would require a prohibited step, report the specific maintainer-only prerequisite and unavailable check. Never use production databases, real environment files, backups/restores, permission synchronization, or external services as an implicit test fixture. A successful build/check does not authorize publication or deployment.

Existing separately authorized runtime migration mechanisms can be documented as an architecture/compatibility constraint; this does not authorize agent execution through a build, startup, recovery or deployment wrapper. Follow the [data/recovery migration boundary](data-and-recovery.md#migration-authorization-boundary) and keep safe inspection separate from maintainer-only conversion/restore steps.
