# Complete product image delivery

Scope: Docker server delivery selected through [deployment routing](index.md), independently of language and CI provider. Libraries, CLI tools, and pure Tauri desktop apps do not acquire a Docker server deployment merely because containers are available.

## One delivery model

Always deliver the complete runtime as **one published product image and one Compose service**. Include required web/server code, Rust core, workers/schedulers, and embedded PostgreSQL/Valkey or other actual runtime dependencies in that image. Do not add components that the application does not need.

Ship one minimal production Compose file and a small `.env.example`, following [Docker and Compose](docker-and-compose.md#compose-and-configuration). Operators select the image, public application port/origin, required credentials, and persistent data/backup paths. The image owns internal addresses, process commands, startup order, readiness, supervision, shutdown, and safe defaults.

Do not offer separate app/worker/database/cache services, per-language Dockerfiles, development/production Docker variants, Compose overlays/profiles, or alternative split-service/HA stacks as product installation choices. Multi-stage build stages and versioned runtime/maintenance scripts are internal parts of the single product image, not additional delivery variants. When consolidating an existing deployment, remove superseded Dockerfiles, Compose variants, scripts, and documentation within the authorized scope, after checking callers and preserving required build/runtime functionality.

Keep source modules, language checks, and internal process identities separate where appropriate; one deliverable does not merge their code or privileges. If a concrete external-service or HA requirement conflicts with the complete-image contract, explain the conflict and obtain an explicit change of requirements before implementing a different topology. Do not infer an exception from application size, language count, or generic production best practices.

## Runtime and persistent state

Multiple processes share one supervised lifecycle. Follow [readiness and process lifecycle](docker-and-compose.md#readiness-and-process-lifecycle): bounded startup probes, failure propagation, signal handling, draining, and ordered shutdown. `init: true` reaps children but does not replace supervision. Keep embedded database/cache/control endpoints internal, using loopback or Unix sockets where appropriate.

Prefer one named product-data volume and a configurable backup bind mount when sufficient. Retain correct internal ownership and backup/recovery boundaries. Follow [data and recovery](data-and-recovery.md), including maintenance access when normal application startup fails, tested restore, and explicit PostgreSQL major-upgrade planning. Shipping a complete image does not authorize database operations or data conversion.

Publish only required application ports and keep configuration small. Put healthchecks and internal defaults into the image where possible. Version and verify the complete image under [release rules](releases-and-metadata.md#release-identity-publish-and-deploy); installation consumes the published image without a source checkout or local build.

## References and project profiles

The user-provided TanStack Dummy Compose/environment example in [Docker and Compose](docker-and-compose.md#minimal-installation-example) defines the intended installation shape. It supersedes the older split-service TanstackDummy description. Names, registry, ports, paths, variables, and shutdown budgets are examples to adapt to the actual product, not global fixed values or a claim about an uninspected repository revision.

RentnerProxy can provide implementation ideas for a supervised bundled runtime and recovery contract. Inspect accessible current files before copying details; reference research does not authorize executing bootstrap, migration, or deployment chains.

| Project profile | Delivery consequences |
| --- | --- |
| [TypeScript](../typescript/index.md) | Package the actual production server/assets and runtime dependencies in the complete image; browser-only products retain their real hosting requirements |
| [Rust](../rust/index.md) | Package release binaries and required runtime libraries/resources in the same product image; libraries/CLI tools do not automatically need a server stack |
| [Hybrid](../hybrid/index.md) | Assemble web assets, any TypeScript server, and the Rust core into one product image; retain root tooling and independent language checks |
| [Tauri](../tauri/index.md) | Keep native installer/bundle/updater delivery; apply these image rules only to additional actual servers |

Use [operations](operations.md) for deployment, verification, update, and rollback; use [CI/CD](ci-cd.md) for the actual provider's image pipeline. These rules describe packaging and do not authorize live deployments or production data changes.
