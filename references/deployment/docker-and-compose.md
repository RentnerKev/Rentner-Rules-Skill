# Docker images and Compose

Scope: requested container packaging/delivery, following [complete product image delivery](deployment-models.md) for actual servers. A CLI distribution or build-tool image can use the image rules without acquiring a server model, Compose stack or state services. Apply the owning language profile for build inputs, commands, locks, and runtime behavior; [automation security](security.md) and [migration restrictions](data-and-recovery.md#migration-authorization-boundary) remain authoritative.

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

Publish only ports required by the intended users/ingress. Keep database/cache/control interfaces off the host by default; services use internal network names, never another container's `localhost`. Inside a true single-container appliance, embedded services can use loopback or Unix sockets. Use bounded authorized maintenance access instead of permanently exposing PostgreSQL/Valkey. Select networks/firewall/TLS and reverse-proxy trust from the actual environment; do not blindly trust forwarded headers or all container networks.

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
