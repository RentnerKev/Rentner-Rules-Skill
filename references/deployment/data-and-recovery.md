# Persistent data and recovery

Scope: selected [server deployment models](deployment-models.md) with state, infrastructure components, or maintenance requirements. Reuse the owning language's runtime safety and [shared authorization/secret restrictions](../../SKILL.md#work-safely-and-finish-the-task). Documentation of an operator procedure does not authorize executing it against production.

## PostgreSQL

Prefer PostgreSQL for applications that need a relational database. Do not add it to applications without that requirement. Under Standard Production it normally runs as a separate service or the actual external database; application services use the internal service address and least required database access. Do not publish PostgreSQL's host port by default or document passwords/real connection strings.

An operator can use the running DB service for authorized maintenance, for example the pattern `docker compose exec <db-service> psql ...`, with authentication derived from the project. This is a documented access pattern, not an instruction for the agent to inspect credentials or execute SQL/migrations. External databases use their approved private access path.

In an intentional appliance, PostgreSQL may be embedded in the application image. Bind it internally, persist its actual data outside the writable image layer, and explicitly handle initialization, readiness, consumer ordering, shutdown, backups, and access independent of the web application's startup. Never reinitialize or replace an existing data directory because readiness failed. Bundling the server also makes its data-format/major-version upgrade a product responsibility.

## Valkey preference and compatibility

For new appropriate projects, prefer **Valkey** to Redis for caching, sessions, rate limits, Pub/Sub, queues, and short-lived coordination. Introduce it only when needed. Check the actual client's supported protocol/features, framework/queue library and Lua behavior, modules, persistence formats, authentication/TLS, and existing production infrastructure before selection. A Redis-specific technical or organizational requirement can justify Redis.

Respect coherent existing Redis infrastructure. This preference does not authorize a rename, replacement, or data migration. Use Valkey product names in owned application/config/docs while retaining required protocol/library identifiers such as `redis://` or `ioredis`, as defined in [TypeScript configuration](../typescript/dependencies-and-config.md#environment-and-product-naming).

Choose a current suitable stable image/version/digest at implementation time; no global Valkey pin. Compatibility is version/feature-specific, not a blanket guarantee from a shared protocol. Use current [Valkey compatibility documentation](https://valkey.io/topics/migration/) and the installed library's primary sources, including [BullMQ connection support](https://docs.bullmq.io/guide/connections) when that library is actually used.

Decide whether each dataset is disposable, recoverable from authoritative storage, or durable. An intentionally ephemeral cache needs safe reconstruction/reconciliation after loss; sessions, queues, locks, and rate limits can have different failure consequences. Do not silently disable persistence for durable queue/business state or promise recovery from a cache backup alone. Sharing cache/coordination across instances requires a suitable shared service and consistency/failure policy, not independent per-replica caches presented as shared state.

## Persistent storage and backups

Keep durable data separate from the image and container writable layer. Containers must be replaceable while required data survives. Use named volumes or intentional bind mounts according to the actual deployment; document each mount's purpose, path, ownership/permissions, writer, backup inclusion, retention, and compatibility. Never infer a mandatory data path from a reference project's image or a different PostgreSQL image version.

Prefer a small understandable appliance data surface, using one/few volumes when technically sufficient. Internal subdirectories still need correct ownership and recovery boundaries. Avoid unnecessary implementation volumes, but do not merge unrelated failure/backup/security requirements merely to reach one volume. Scale/HA storage needs its actual concurrent access and durability guarantees; sharing an ordinary data directory between database servers is not an HA design.

For every persistent production deployment, define backup and tested restore procedures covering the actual database, uploaded/object data, configuration/state, and required operator-managed encryption material. The agent documents names/ownership without reading or copying keys. Backups need appropriate access protection, retention, consistency, and separation from the failed host/data volume. A local backup directory alone does not prove disaster recovery.

Choose a database-supported logical or physical backup method with a matching restore/version contract; copying a live PostgreSQL data directory as ordinary files is not automatically a valid backup. Define quiescing/consistency across related stores where needed, expected data loss and recovery time, and isolated restore verification. See [PostgreSQL backup/restore](https://www.postgresql.org/docs/current/backup.html) and [Docker volume behavior](https://docs.docker.com/engine/storage/volumes/). Execute backup/restore only within existing authorization and safe target resources.

## Maintenance when startup fails

A failed application startup must not permanently block access to persistent data. Document normal access to a running service and a controlled alternative when it cannot start: an actual maintenance mode, supported DB-only path, or compatible recovery container with explicit entrypoint/command and mounts. Commands such as database shell, backup, restore, verification, and diagnostics describe capabilities, not mandatory command names.

Inspect the whole maintenance execution path. A generic `docker compose run` can invoke normal initialization/migration hooks; do not label it safe recovery without verifying what it runs. A recovery mode should start only necessary tools/services, bypass ordinary application startup, and not silently upgrade or reinitialize state. Use an appropriate compatible image and the actual DB/data format, not an arbitrary latest image.

Stop/quiesce competing writers as required. Never run two PostgreSQL servers against the same data directory. Prefer read-only inspection or a protected copy where suitable; backup/restore access may require explicitly authorized writes. Verify source/target/mount identity, preserve original data and ownership, and make destructive replacement a deliberate operator step. No broad permission changes, volume removal, pruning, or unrelated host cleanup as a recovery shortcut.

## Persistent format and PostgreSQL major upgrades

Changing a bundled/separate PostgreSQL major version is not an ordinary application image replacement. Before changing the deployment/image, require an explicit maintainer/operator upgrade plan: current/target versions and supported tool/image paths, application/extensions compatibility, protected verified backup, supported conversion/dump-restore/replication method, isolated verification, downtime/write coordination, and a realistic rollback/recovery point. Check [PostgreSQL's upgrade guidance](https://www.postgresql.org/docs/current/upgrading.html) and the chosen image's current data-directory contract.

Do not silently point a new major at old persisted data, assume a moved mount upgrades its contents, or claim an old binary can read a newly upgraded directory. Preserve the previous state/recovery path until the plan's verification criteria are met. Execution of data conversion/database migration remains outside the agent's skill-derived authorization.

Apply the same explicit compatibility/backup/recovery planning to persisted application formats, embedded runtime components, incompatible cache/queue data, and internal protocols. [Image rollback](operations.md#upgrade-and-rollback) is valid only while the state/protocol combination supports it; restoring a backup can lose writes made since that backup.

## Migration authorization boundary

The central [Drizzle/schema restriction](../typescript/backend-and-safety.md#drizzle-and-schema-boundary) is unchanged: never read/list/traverse/change `drizzle/`, run Drizzle commands or database migrations, or hide them in CI, build stages, entrypoints, healthchecks, release/deploy, maintenance or verification scripts. An explicit schema request still permits only the declared schema sources under that policy.

Existing projects may have separately authorized runtime migration mechanisms. Document their existence, owner, trigger, failure/compatibility consequences, and operator prerequisites without examining forbidden artifacts or adding/running migration commands. This acknowledges an existing architecture; it neither requires removing it nor authorizes the agent to generate migrations, execute it indirectly through a container, or copy RentnerProxy's mechanism into another project.

If a proposed build/startup/restore/integration check necessarily executes a prohibited mechanism, keep the safe inspection/unit/contract checks and report that exact maintainer-only step and unverified runtime check. Do not bypass protections or substitute production resources. Apply the common [side-effect boundary](security.md#migration-and-side-effect-boundary).

Official state/compatibility sources above were checked on 2026-10-05. Recheck deployed database/cache, clients/modules, image layouts and upgrade procedures when applied.
