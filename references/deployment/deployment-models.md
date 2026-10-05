# Server deployment models

Scope: actual server/runtime deployment selected through [deployment routing](index.md). Choose the operating model independently of the language profile and CI provider. A library, build script, CLI, or desktop app does not acquire a server deployment merely because Docker is available. Preserve a suitable existing architecture unless the request justifies changing it.

## Decide from operating requirements

Inspect the existing installation path, runtime roles, image/release boundaries, state stores, operator documentation, and supported environments. Before choosing a model, establish:

- Whether components must scale or update independently, including separate release lifecycles.
- Whether workers/schedulers exist and need distinct resource, failure, or shutdown policies.
- Whether state belongs exclusively to one installation or is shared by multiple application instances; identify external/managed services.
- Required availability, failure isolation, hosts/nodes, traffic balancing, and rollout downtime.
- Whether simple self-hosting and a jointly delivered runtime are primary product requirements.

| Model | Choose when | Usual shape | Reference direction |
| --- | --- | --- | --- |
| **Appliance** | Simple self-hosting/single-server installation, jointly updated components, and deliberately bundled infrastructure; no necessary independent scaling | One primary Compose service, one product image, a small persistent data surface, few public ports/settings | RentnerProxy |
| **Standard Production** | A normal production web/business application with distinct runtime responsibilities and no required cluster/HA architecture | App, optional worker/scheduler, and only required separate state services; shared application image where appropriate | TanstackDummy |
| **Scale / HA** | Real horizontal/independent scaling, availability/failure-domain requirements, multiple hosts, managed/shared infrastructure, or orchestrated multi-instance rollouts | Scalable runtime roles, suitable balancing/orchestration, and deliberately separate/managed state | A larger webshop/SaaS/cluster system; no assumed concrete repository |

Record the model and its decisive requirements, actual roles/state, image boundaries, target platforms, and unavailable prerequisites. Code size, an "Enterprise" label, language count, or technical ability to bundle processes does not decide the model. Inspect what managed infrastructure changes; it is not by itself evidence that the application is highly available. Resolve missing requirements that change the architecture before dependent implementation, while continuing independent inspection.

Across all three models, keep the operator surface small: published versioned images, no normal end-user source build, one central Compose entrypoint where suitable, few required settings, safe defaults, necessary published ports only, explicit persistent data, meaningful health/logging, and documented maintenance/upgrade/recovery. Internal complexity does not justify exposing every internal component or implementation setting to the operator.

## Appliance

Prefer an appliance for a product whose components are installed, operated, and upgraded together. One application image may contain the application server, a Rust core, and deliberately embedded PostgreSQL/Valkey or other required runtime processes. Include only actual product dependencies; neither database nor cache is mandatory.

Multiple processes are valid when they form one supervised product lifecycle. Follow [process/readiness rules](docker-and-compose.md#readiness-and-process-lifecycle), keep embedded services internal, and provide [data/recovery access](data-and-recovery.md) even when normal application startup fails. Prefer one or a few persistent volumes when technically sufficient, with clear internal ownership.

Do not force this model when components require independent releases/scaling, different resource or failure isolation, independent availability, managed operation, or state shared across application instances. Do not split a coherent appliance into many services solely to enforce a one-process-per-container ideology. Bundling PostgreSQL makes its major-upgrade and recovery path part of the product's delivery responsibility.

## Standard Production

Prefer this model for an ordinary larger web/business application, API, webshop, or portal without actual HA/cluster requirements. Declare app, worker/scheduler, PostgreSQL, and Valkey as separate services only where those roles/dependencies exist. PostgreSQL normally has its own service; use external services where the actual operating architecture requires them. Keep state access internal and operator configuration coherent.

When server, worker, and scheduler come from the same codebase/release and have compatible runtime requirements, prefer **one versioned application image** with documented different commands. Separate containers provide runtime/resource/lifecycle boundaries without requiring a different image for every process. Use different images for a concrete independent release, dependency, platform, or security requirement, not for command names alone.

A language boundary does not determine a service boundary. A hybrid web/core product can use one image or justified separate runtime services; the actual lifecycle/scaling contract decides. Do not create workers, databases, caches, or a second frontend package from the sample topology.

## Scale and HA

Select **Scale / HA** only for demonstrated operating requirements. Plan actual replica counts/capacity, independent runtime roles, load balancing, state sharing, failure domains, and controlled multi-instance rollouts. Separate or managed PostgreSQL, Valkey, and object storage belong here when needed; none is automatic scaffolding.

Keep per-instance state replaceable and define durable/shared state, sessions, queue delivery/retries, singleton scheduling, and supported old/new application combinations where those responsibilities exist. Plan availability of the data and balancing layers as well as the app. Multiple app replicas on one host or one shared volume are not proof of HA.

Use the project's suitable production orchestrator and current primary documentation. Compose remains useful for local or bounded single-host deployments but is not automatically a multi-host HA orchestrator. Do not introduce Kubernetes, Nomad, manifests, or cluster services without a real requirement and target infrastructure. Preserve a simple operator interface even when internal orchestration grows.

## Canonical references

- **RentnerProxy → Appliance.** Inspect its current [Compose file](https://github.com/RentnerKev/RentnerProxy/blob/main/docker-compose.yml), [production image and entrypoint](https://github.com/RentnerKev/RentnerProxy/tree/main/docker/production), healthcheck, state/backup/recovery contract, and release-image pipeline. The reference checked on 2026-10-05 at `4c390f82b3aa35b984f36811cb00fb6d61c9568f` uses one primary image/service and persistent product volume, embedded internal PostgreSQL/Valkey, separate process identities, supervised startup/shutdown, and readiness verification. Proxy/security components, paths, ports, variables, and migration steps are product-specific.
- **TanstackDummy → Standard Production.** Inspect the accessible repository's Dockerfile, central Compose, entrypoint, and Forgejo release scripts first. The local reference checked on 2026-10-05 at `9c6d77ccd20e57a4d92e264508df9498c77f5bba` uses the same image for app and worker and a separate PostgreSQL service. It currently manages ephemeral Valkey in the app's entrypoint, consumed by the worker. This existing lifecycle is an observation, not a universal embedded-cache requirement or evidence of independent cache scaling. Preserve coherent existing decisions; choose a separate Valkey service for new standard setups when its consumers/lifecycle warrant it.
- **Scale / HA → reference class.** Use a reachable implementation with matching real scale/availability requirements, if one exists. Do not claim an uninspected future webshop/SaaS/cluster repository as a tested canonical implementation.

References establish architecture/quality direction, not global image/toolchain versions, names, credentials, service counts, paths, or mandatory components. Inspect them without reading secret values or traversing `drizzle/`; never execute their migration/bootstrap/deploy chains as part of reference research.

## Compose with the language profiles

| Language/project profile | Delivery consequences |
| --- | --- |
| [TypeScript](../typescript/index.md) | An actual Bun/TS server can use any server model; normal larger web/business apps prefer Standard Production. Package only required runtime output/dependencies; browser-only assets need their real hosting model, not an invented TS server |
| [Rust](../rust/index.md) | A server/daemon can use any model; prefer a compiled release binary and required runtime libraries/resources. A library/CLI does not automatically need containers or state services |
| [Hybrid](../hybrid/index.md) | Keep source/tooling ownership and independent language checks. Choose one product image or justified runtime separation from operating requirements; hybrid does not mean two containers |
| [Tauri](../tauri/index.md) | Desktop delivery remains installer/bundle/updater. Evaluate additional real server services separately; do not put the desktop application into a server Docker model |

Use [Docker/Compose](docker-and-compose.md), [data and recovery](data-and-recovery.md), and [operations](operations.md) for the selected model. Compose provider CI/image publishing through the existing [CI/CD](ci-cd.md) and [release identity](releases-and-metadata.md) rules only where affected.
