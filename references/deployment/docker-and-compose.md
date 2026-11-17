# Docker images and Compose

Scope: local container development and requested container packaging/delivery, following [complete product image delivery](deployment-models.md) for actual server delivery. A CLI distribution or build-tool image can use the image rules without acquiring a server model, Compose stack or state services. Apply the owning language profile for build inputs, commands, locks, and runtime behavior; [automation security](security.md) and [migration restrictions](data-and-recovery.md#migration-authorization-boundary) remain authoritative.

## Local development with Kiri

Use **Kiri** for local development containers. Docker Desktop is no longer the local runtime; do not start its application, services, or WSL distribution as a fallback when a Docker command fails. The Docker CLI, Compose, and buildx can still be used against Kiri. Inspect the effective context and explicitly select `kiri` when other engines are installed or a command must be independent of the shell's default:

```sh
docker context show
docker --context kiri ps
docker --context kiri compose version
```

Use `docker context use kiri` when configuring Kiri as the user's default. Check relevant `DOCKER_HOST`/`DOCKER_CONTEXT` overrides and the selected buildx builder without exposing credentials; a Docker CLI installed with Docker Desktop does not itself require Desktop to run. Prefer CLI/API operations in the background over UI automation when they support the requested operation. Kiri on Windows uses WSL2 and a named-pipe Docker API; follow the current [Windows setup documentation](https://docs.runkiri.com/windows/). A runtime switch does not copy another engine's images, containers, or volumes automatically. Preserve existing data and check available Kiri resources before recreating anything; do not delete volumes, prune another engine, or shut down unrelated WSL distributions to switch runtimes.

### Disposable test environments and cleanup

Use the [standing local-development permission](../../SKILL.md#local-development-tests-and-cleanup) to create and run needed Kiri test containers without another confirmation. Use synthetic/demo data in isolated storage; never mount existing application data or use an ordinary service as a disposable fixture.

- Inspect existing resources first. Give test containers, Compose projects, images, volumes, and networks unique task-specific names/tags or labels, and record which resources the task creates. Keep Docker/Compose/buildx operations explicitly on Kiri and verify the selected builder's endpoint.
- Arrange cleanup before starting checks, using automatic container removal where appropriate and a `finally`/trap or equivalent teardown for the remaining resources. Remove owned containers, disposable volumes/networks, test images and temporary fixture files after the checks. Remove images pulled only for these tests when they were absent beforehand and are not needed by another workload.
- Isolate temporary image-build caches in a task-specific builder when needed so they can be removed with that builder after the final iteration. Reuse the task's cache while iterating. Preserve pre-existing/shared images and caches; do not use `docker system prune`, unrestricted volume/cache pruning, or forced removal of resources used by another task as cleanup shortcuts.
- Verify removal using the recorded resource IDs, names, or labels in the `kiri` context, and check any task-specific builder/cache and host fixture directories as well. Report failed cleanup and remaining resources accurately.

### Valkey access from host-run applications

Use [Valkey](data-and-recovery.md#valkey-standard-and-compatibility) for compatible cache, session, queue, and coordination requirements. When the application runs directly on the development host and Valkey runs in Kiri, publish container TCP port 6379 on **`127.0.0.1:6379`** by default. Set the host application endpoint accordingly, for example the credential-free local URL `redis://127.0.0.1:6379`; retain the protocol name required by the client.

Use the explicit mapping `127.0.0.1:6379:6379` with `--publish`/`-p`, or the equivalent `ports` entry in existing authorized development orchestration. `EXPOSE 6379` and Compose `expose` alone do not publish a host port. An automatically assigned host port does not satisfy a program expecting 6379. Check for an existing listener, including one from Docker Desktop; do not kill unrelated processes or silently select another port. If projects need isolated simultaneous instances, assign deliberate distinct host ports and update each application's endpoint instead of sharing queue/session data accidentally.

Prefer retaining an existing container and its data when changing its published ports. Kiri's [port controls](https://docs.runkiri.com/docker/network/#publishing-ports) support editing mappings on a running container. Verify the installed version's CLI/API or UI support before changing them; do not assume Docker's ordinary `update` command can change port bindings. Persist the intended mapping through the existing development owner so it survives normal restarts/recreation.

For background operation, Kiri's [own API implementation](https://github.com/libracoder/kiri/blob/main/crates/kiri/src/daemon/api.rs) supports `POST /kiri/containers/<id>/ports` on its local Docker API connection, including the Windows named pipe. The body `{"ports":[{"container_port":6379,"host_port":6379,"proto":"tcp","host_ip":"127.0.0.1"}]}` replaces the container's published-port list without recreating it. Inspect existing mappings and retain unrelated required entries; verify installed-version support and the result instead of treating this Kiri extension as a standard Docker endpoint.

Verify the mapping with `docker --context kiri port <container> 6379/tcp`, then perform a bounded, read-only Valkey `PING` through the **host endpoint** and expect `PONG`. A container-internal `valkey-cli ping` alone does not prove Windows/host connectivity. Check required readiness and reconnect behavior in the actual client. Other containers use their network's service/container address; their own `localhost` is not the development host.

Keep the published development port on loopback. This local access does not add database/cache ports or alternative Compose variants to the production installation: [production Compose](#compose-and-configuration) still ships one complete image/service and keeps internal dependency ports private. Stop Docker Desktop and disable its autostart when the user requests that host configuration; installing or applying this skill alone does not authorize machine-wide service changes.

Kiri's Windows/context and port guidance was checked against the official sources above on 2026-11-17. Recheck installed versions and platform support when applying it.

## Production images

Prefer already built, verified images from the actual registry for production installation. Source checkout and `docker compose build` are development/build-maintainer workflows, not the normal customer installation prerequisite. CI verifies the exact source/image before publishing under [release rules](releases-and-metadata.md#release-identity-publish-and-deploy); deployment consumes that image under [operations](operations.md).

- Prefer [multi-stage builds](https://docs.docker.com/build/building/multi-stage/): committed manifests/locks and frozen/locked resolution in build stages, only needed runtime output/dependencies/resources in the final image. Do not hide migrations or extra ecosystem installs in ordinary checks/build hooks.
- The complete image contains the actual TypeScript production runtime/server/assets/packages and compiled Rust release binaries where used, plus required shared libraries, CA certificates, timezone data, resources, and bundled runtime services. Prefer Alpine under the base-image policy below; verify musl/native dependencies and execution on every promised target.
- Prefer **Alpine-based images wherever compatible**, for build and runtime stages and bundled components such as PostgreSQL/Valkey; use supported `*-alpine` tags when available. Check musl/native-library compatibility, required extensions/tools, and target platforms. Use another base only for a concrete compatibility requirement and document the reason; this is not permission to drop required functionality. Choose current compatible versions from upstream primary sources, verify platform manifests/digests, and maintain pins through the existing updater policy.
- Keep compilers, source-only development tools, unnecessary packages, and credentials out of the final image. Bundled runtime services and deliberately needed maintenance tools are runtime requirements, not reasons to include the entire builder.
- Define an appropriate `.dockerignore` or Dockerfile-specific ignore file and bounded build context. Exclude real environment files, keys, backups, local data, irrelevant outputs, and host caches. Packaging/inspection follows the [database policy](../typescript/backend-and-safety.md#drizzle-and-schema-boundary) and grants no permission for generated-file changes or database execution.
- Never put secret values into `ARG`, `ENV`, labels, copied files, image layers, build logs, or artifacts. If a trusted build genuinely needs private access, use narrowly scoped [BuildKit secret/SSH mounts](https://docs.docker.com/build/building/secrets/); the consuming command must not copy or print their contents. Preserve the PR/credential boundary.
- Run application services with the least required privileges. If an appliance requires privileged initialization, scope it to validated owned resources and drop privileges for the actual services. Do not default to privileged containers, broad host mounts, Docker sockets, or recursive ownership changes over arbitrary operator paths.

Deliver all required roles in [one complete product image](deployment-models.md#one-delivery-model). Version/source/platform and digest identify the deliverable; do not silently overwrite a versioned image. Channel/major/minor aliases such as `latest` are installation conveniences, with a concrete version/digest available for reproduction.

## Compose and configuration

Ship one minimal central production Compose file and a short install/update path. Preserve an established filename such as `docker-compose.yml`; `compose.yaml` is a suitable new filename, not a rename requirement. Hybrid retains its [central root entrypoint](../hybrid/architecture.md#root-tooling-and-one-project-entrypoint). Use one service consuming the complete published image; remove superseded Docker/Compose variants within authorized consolidation work. Do not offer source-build installation, separate infrastructure services, Compose overlays/profiles, or per-language deployments.

Keep Compose to the product image, restart policy, init helper where needed, justified stop grace, public application port, `env_file`, and required persistent data/backup mounts. Keep internal commands, process wiring, healthchecks, resource/logging defaults where supported, and lifecycle logic in the image/runtime implementation. Add a Compose setting only when the operator actually needs it. Product runtime scripts can live with Docker/runtime files; provider-exclusive publishing/deploy automation follows [provider script ownership](ci-cd.md#provider-ownership-and-workflow-scripts).

For production, publish only ports required by the intended users/ingress. Keep database/cache/control interfaces off the host by default; services use internal network names, never another container's `localhost`. Inside a true single-container appliance, embedded services can use loopback or Unix sockets. Use bounded authorized maintenance access instead of permanently exposing PostgreSQL/Valkey. Host-run development applications use the explicit [local loopback mapping](#valkey-access-from-host-run-applications). Select networks/firewall/TLS and reverse-proxy trust from the actual environment; do not blindly trust forwarded headers or all container networks.

Separate browser-public application settings, server runtime configuration, secrets, and build-time inputs. Minimize mandatory values, validate them early, use safe defaults, and document variable names/harmless examples through `.env.example`. A value baked into frontend assets cannot be assumed changeable through container environment at startup. Keep server secrets out of public client settings.

Use supported runtime secret injection, including [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/) or the established secret store when the application supports it. File mounts and automatic masking do not make arbitrary logs/permissions safe. Never read real `.env` files or secret material, embed passwords/credential-bearing connection strings in Compose/docs, or print rendered secret-bearing configuration.

Define explicit [persistent data ownership](data-and-recovery.md#persistent-storage-and-backups), an appropriate restart policy, and actual resource/logging bounds. Do not add a worker, database, cache, network, or volume merely to fill a sample topology. Check current Engine/Compose/orchestrator support before claiming a resource/dependency setting is enforced.

## Minimal installation example

This user-provided TanStack Dummy shape is the installation reference. Adapt names, registry, ports, mount targets, shutdown budget, and environment variables to the actual image contract. `latest` is a channel alias; also publish and record immutable versions/digests. The long stop grace is specific to this example's workload, not a universal timeout.

```yaml
services:
    tanstackdummy:
        image: git.straessler.dev/kstraessler/tanstackdummy:latest
        restart: unless-stopped
        init: true
        stop_grace_period: 4h10m
        ports:
            - '${APP_PORT:-6600}:3000'
        env_file:
            - .env
        volumes:
            - tanstackdummy_data:/data
            - ${BACKUP_PATH:-./backups}:/data/backups

volumes:
    tanstackdummy_data:
```

Ship the matching `.env.example` with harmless placeholders; operators create their real `.env` themselves. Include only settings the product needs. Keep internal database/cache URLs, internal ports, worker commands, derived passkey settings, and application defaults inside the image. Validate required secrets and reject unchanged placeholders before serving traffic.

```dotenv
# Application
APP_PORT=6600
ORIGIN=https://dummy.example.com

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME

# Authentication
# Generate: openssl rand -base64 32; keep unchanged across updates.
AUTH_ENCRYPTION_KEY=CHANGE_ME

# Backups
BACKUP_PATH=./backups

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=

# Wrap secrets containing $, #, or spaces in single quotes.
# For this image, SMTP_SECURE=false requires STARTTLS.
# The image supplies the sender display name from @project:defaultName
# ("TanStack Dummy"). Passkey settings inherit ORIGIN and app defaults.
```

The SMTP/TLS behavior, sender name, and passkey inheritance above describe this example's image contract. Implement and verify the corresponding product behavior before documenting it; variable names alone do not enforce STARTTLS or derive authentication settings. Do not copy unneeded variables into other products.

## Readiness and process lifecycle

The single product service supervises internal dependency startup with real bounded probes. Do not add Compose services or `depends_on` just to express internal ordering. Avoid fixed startup sleeps in place of observable readiness. Runtime clients still need bounded reconnect/retry behavior after dependency loss; initial ordering does not ensure continuing availability.

Choose useful health/readiness checks for the actual process or role: valid startup/configuration and needed dependencies, not just an open socket. Make timeouts/start periods fit measured startup, report safe failures, and distinguish readiness to serve work from basic process liveness. An appliance readiness result must reflect required internal components; a worker needs its real worker health signal rather than an unrelated HTTP endpoint. Healthchecks should not migrate, seed data, send mail, or mutate production state.

Use exec-form entrypoints/commands or an intentional supervisor so signals reach owned processes. An init helper can reap children but does not by itself supervise several services. For [multiple-process containers](https://docs.docker.com/engine/containers/multi-service_container/), define startup order, bounded readiness, child tracking, failure reporting, and what happens when a required child exits. Do not leave an apparently healthy primary container after a required internal service has failed.

On shutdown, stop admission, drain/cancel work according to its contract, signal and join owned children, flush durable state, and use a bounded forced-stop fallback. Keep state services available while their consumers drain where necessary. Align application, supervisor, worker-job and [Compose stop grace](https://docs.docker.com/reference/compose-file/services/#stop_grace_period) budgets; do not copy reference timeouts or kill unrelated processes. Verify the failure/restart and termination paths, not only the successful startup.

Emit useful structured diagnostics to the intended container/central logs, with role/correlation information, redaction and rotation/retention. Keep any deliberately persisted product logs bounded and owned; logs are not a backup. Runtime verification and operational handover live in [operations](operations.md#runtime-verification-and-diagnostics).

Official Docker sources above were checked on 2026-10-05. Recheck actual tool versions/platform behavior before concrete Docker/Compose configuration.
