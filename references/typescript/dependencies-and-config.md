# Dependencies and config

Scope: [TypeScript profile](index.md). The preferred stack and config layout are TypeScript conventions; Rust uses its own [Cargo and config guidance](../rust/index.md).

## Preferred platform

Use the [TypeScript profile's preferred stack](index.md) for new non-Tauri web projects and the [Tauri frontend override](../tauri/index.md) where applicable. The shared [dependency policy](../dependencies-and-documentation.md) owns version research and package-manager preservation; [tooling](tooling.md) owns JS/TS lint/format choices.

## Installed packages first

Before implementing a reusable UI primitive, inspect installed `@rentnerkev/*` packages and existing integrations. Use the supported package component, provider, and types as the primary implementation.

A concrete missing capability or incompatibility can justify a small wrapper or another solution. Identify that gap rather than silently duplicating an existing package. Do not assume a private npm registry is needed for publicly available packages.

## Version-matched package documentation

Follow the shared [installed-package documentation rules](../dependencies-and-documentation.md#installed-packages-and-documentation), including the Rentner `/ai` helpers and remote snapshot/version checks.

## Research before adding a package

Apply the shared [selection checklist](../dependencies-and-documentation.md#research-before-adding-a-dependency). For JS/TS, specifically verify TypeScript/React compatibility, SSR/server/client boundaries, bundle impact, and accessibility for UI packages.

## Declarative configuration

Files in `src/config` contain configuration values, objects, and arrays. They may import the types or values required to describe that configuration. Type annotations, `as const`, and `satisfies` are allowed.

They do not define types, functions, hooks, validation schemas, environment readers, runtime calculations, or side effects.

Place application-level configuration contracts in `src/shared/Types`. Place contracts owned by a feature or lib module in that owner's `Types/` directory.

```ts
import type { NavigationItem } from '@/shared/Types/navigation.types.ts'

export const navigationConfig = [
    {
        labelKey: 'navigation.users',
        path: '/admin/users',
    },
] satisfies readonly NavigationItem[]
```

Parsing environment values belongs at the runtime boundary in lib/server code. Derived configuration belongs in a meaningfully named function outside config.

Table column definitions with JSX cell renderers or callback logic are not pure configuration arrays. Keep their construction with the table component or its hook.

Keep cross-cutting policy settings, security limits, routes, navigation, and application identity in the appropriate `*.config.ts`. Feature literals do not require a global config entry merely because they are constant.

## Environment and product naming

Use `.env.example` as the configuration reference. Never read real `.env`, `.env.local`, production environment files, tokens, or credentials.

For a new environment setting, check the complete path:

- Example value or empty/obviously harmless secret placeholder.
- Central runtime validation and clear startup errors.
- Its consuming service.
- Deployment, container, or CI wiring where applicable.
- The relevant setup documentation.

Validate URLs, ports, booleans, origins, paths, and sizes at the runtime boundary. Do not silently use insecure production defaults.

Server secrets must not enter `VITE_*` settings, public client config, serialized frontend state, logs, or client-importable modules.

Use the actual application's product names consistently across owned variables, modules, docs, and deployment files. For a Valkey integration, use Valkey names; retain identifiers required by external libraries and protocols, such as `ioredis` or `redis://`.

Renames affecting environment names, APIs, scripts, deployment, or persisted state require an impact check across callers, examples, and operators. Record deliberate compatibility decisions; do not leave accidental old names behind.
