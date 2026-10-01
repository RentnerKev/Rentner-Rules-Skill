# Dependencies and config

## Preferred platform

For new web projects, prefer Bun, TypeScript strict, React, TanStack Start, Tailwind CSS, Zod, and the TanStack libraries appropriate to the feature: Router, Query, Form, and Table.

Select supported, compatible versions from current documentation and the actual project constraints. Do not copy an old starter's version pins into a new application without checking them.

Read the existing package manager declaration and lockfile. Use the project's package manager consistently; do not introduce a second lockfile or change runtime/toolchain as a side effect of an unrelated task.

## Installed packages first

Before implementing a reusable UI primitive, inspect installed `@rentnerkev/*` packages and existing integrations. Use the supported package component, provider, and types as the primary implementation.

A concrete missing capability or incompatibility can justify a small wrapper or another solution. Identify that gap rather than silently duplicating an existing package. Do not assume a private npm registry is needed for publicly available packages.

Reuse other established dependencies when they adequately solve the problem. Do not add a dependency for functionality the runtime or existing platform already provides.

## Research before adding a package

Before selecting a new dependency:

1. Establish the actual capability the application needs.
2. Check current primary sources: official docs, repository, release history, support/deprecation notices, and relevant security advisories.
3. Compare suitable alternatives and the existing platform against that need.
4. Check compatibility with the project's runtime, TypeScript, React, SSR/server boundaries, deployment, and license requirements.
5. Explain the choice briefly using current evidence. Identify uncertainty or an unavoidable tradeoff.
6. Add only the selected dependency and the lockfile changes required for it.

Consider maintenance, replacement or archive notices, release freshness in context, migration cost, API fit, bundle/server impact, and accessibility for UI packages. Popularity or the newest release alone does not establish suitability.

When browser or network access is unavailable, disclose the missing current verification. Do not present a remembered package choice as researched.

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
