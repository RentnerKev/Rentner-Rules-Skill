# Docker images and Compose

Scope: requested container packaging/delivery, composed with the selected [deployment model](deployment-models.md) for actual servers. A CLI distribution or build-tool image can use the image rules without acquiring a server model, Compose stack or state services. Apply the owning language profile for build inputs, commands, locks, and runtime behavior; [automation security](security.md) and [migration restrictions](data-and-recovery.md#migration-authorization-boundary) remain authoritative.

## Production images

Prefer already built, verified images from the actual registry for production installation. Source checkout and `docker compose build` are development/build-maintainer workflows, not the normal customer installation prerequisite. CI verifies the exact source/image before publishing under [release rules](releases-and-metadata.md#release-identity-publish-and-deploy); deployment consumes that image under [operations](operations.md).

- Prefer [multi-stage builds](https://docs.docker.com/build/building/multi-stage/): committed manifests/locks and frozen/locked resolution in build stages, only needed runtime output/dependencies/resources in the final image. Do not hide migrations or extra ecosystem installs in ordinary checks/build hooks.
- TypeScript images contain the actual production runtime, emitted server/assets, and needed packages/native dependencies. Rust images normally contain the compiled release binary plus necessary shared libraries, CA certificates, timezone data, or resources; do not require `scratch`/Alpine when ABI/native requirements make another base appropriate. Check promised architecture, libc, dynamic linking, and target execution.
- Choose current compatible base images from upstream primary sources. Respect project constraints and record versions/digests for security-sensitive bases; reference pins are not skill-wide defaults. Verify the platform manifest/digest and maintain pins through the existing updater policy.
- Keep compilers, source-only development tools, unnecessary packages, and credentials out of the final image. Appliance runtime services and deliberately needed maintenance tools are runtime requirements, not reasons to include the entire builder.
- Define an appropriate `.dockerignore` or Dockerfile-specific ignore file and bounded build context. Exclude real environment files, keys, backups, local data, irrelevant outputs, and host caches. Never traverse forbidden `drizzle/` paths during inspection; existing migration-artifact packaging does not authorize agent access or execution.
- Never put secret values into `ARG`, `ENV`, labels, copied files, image layers, build logs, or artifacts. If a trusted build genuinely needs private access, use narrowly scoped [BuildKit secret/SSH mounts](https://docs.docker.com/build/building/secrets/); the consuming command must not copy or print their contents. Preserve the PR/credential boundary.
- Run application services with the least required privileges. If an appliance requires privileged initialization, scope it to validated owned resources and drop privileges for the actual services. Do not default to privileged containers, broad host mounts, Docker sockets, or recursive ownership changes over arbitrary operator paths.

For roles from one compatible application release, follow the [shared-image rule](deployment-models.md#standard-production). Version/source/platform and digest identify the deliverable; do not silently overwrite a versioned image. Channel/major/minor aliases are conveniences only for actual channels, with a concrete version/digest available for reproduction. Never rely exclusively on `latest`.

## Compose and configuration

When Compose is used, prefer one central production file and a short documented install/update path. Preserve an established filename such as `docker-compose.yml`; `compose.yaml` is a suitable new filename, not a rename requirement. Hybrid retains its [central root entrypoint](../hybrid/architecture.md#root-tooling-and-one-project-entrypoint). Add overlays/profiles only for a real environment/operating distinction; do not create competing language-specific deployments.

Compose declares images, real commands, environment/secrets, volumes, networks, ports, healthchecks, restart/dependency policies, and justified resource settings. Complex bootstrap/lifecycle logic belongs in the image's versioned runtime scripts, not a large inline shell program. These product runtime scripts can live with Docker/runtime files; provider-exclusive publishing/deploy automation follows [provider script ownership](ci-cd.md#provider-ownership-and-workflow-scripts).

Publish only ports required by the intended users/ingress. Keep database/cache/control interfaces off the host by default; services use internal network names, never another container's `localhost`. Inside a true single-container appliance, embedded services can use loopback or Unix sockets. Use bounded authorized maintenance access instead of permanently exposing PostgreSQL/Valkey. Select networks/firewall/TLS and reverse-proxy trust from the actual environment; do not blindly trust forwarded headers or all container networks.

Separate browser-public application settings, server runtime configuration, secrets, and build-time inputs. Minimize mandatory values, validate them early, use safe defaults, and document variable names/harmless examples through `.env.example`. A value baked into frontend assets cannot be assumed changeable through container environment at startup. Keep server secrets out of public client settings.

Use supported runtime secret injection, including [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/) or the established secret store when the application supports it. File mounts and automatic masking do not make arbitrary logs/permissions safe. Never read real `.env` files or secret material, embed passwords/credential-bearing connection strings in Compose/docs, or print rendered secret-bearing configuration.

Define explicit [persistent data ownership](data-and-recovery.md#persistent-storage-and-backups), an appropriate restart policy, and actual resource/logging bounds. Do not add a worker, database, cache, network, or volume merely to fill a sample topology. Check current Engine/Compose/orchestrator support before claiming a resource/dependency setting is enforced.

## Readiness and process lifecycle

`depends_on` order alone does not prove readiness. Use real bounded dependency probes and supported `condition: service_healthy` where appropriate under [Compose startup rules](https://docs.docker.com/compose/how-tos/startup-order/). Avoid fixed startup sleeps in place of observable readiness. Runtime clients still need bounded reconnect/retry behavior after dependency loss; initial ordering is not continuing availability management.

Choose useful health/readiness checks for the actual process or role: valid startup/configuration and needed dependencies, not just an open socket. Make timeouts/start periods fit measured startup, report safe failures, and distinguish readiness to serve work from basic process liveness. An appliance readiness result must reflect required internal components; a worker needs its real worker health signal rather than an unrelated HTTP endpoint. Healthchecks should not migrate, seed data, send mail, or mutate production state.

Use exec-form entrypoints/commands or an intentional supervisor so signals reach owned processes. An init helper can reap children but does not by itself supervise several services. For [multiple-process containers](https://docs.docker.com/engine/containers/multi-service_container/), define startup order, bounded readiness, child tracking, failure reporting, and what happens when a required child exits. Do not leave an apparently healthy primary container after a required internal service has failed.

On shutdown, stop admission, drain/cancel work according to its contract, signal and join owned children, flush durable state, and use a bounded forced-stop fallback. Keep state services available while their consumers drain where necessary. Align application, supervisor, worker-job and [Compose stop grace](https://docs.docker.com/reference/compose-file/services/#stop_grace_period) budgets; do not copy reference timeouts or kill unrelated processes. Verify the failure/restart and termination paths, not only the successful startup.

Emit useful structured diagnostics to the intended container/central logs, with role/correlation information, redaction and rotation/retention. Keep any deliberately persisted product logs bounded and owned; logs are not a backup. Runtime verification and operational handover live in [operations](operations.md#runtime-verification-and-diagnostics).

Official Docker sources above were checked on 2026-10-05. Recheck actual tool versions/platform behavior before concrete Docker/Compose configuration.
