# Architecture

## Responsibility map

| Location | Responsibility |
| --- | --- |
| `src/routes` | Thin TanStack routes, loaders, navigation, guards, and API entrypoints |
| `src/features` | Feature screens, presentation components, logic hooks, contracts, input schemas, and Server Function adapters |
| `src/server/<Domain>` | Backend business rules, data access, integrations, workers, and runtime services |
| `src/layouts` | `PublicLayout` and `AuthenticatedLayout` with their own components and hooks |
| `src/shared/<Area>` | Reusable UI, its UI hooks, and UI contract types |
| `src/lib/<Domain>` | UI-free utilities, reusable validation, and technical or domain modules |
| `src/config` | Declarative application configuration |
| `src/test` | Tests mirroring the source hierarchy |

The normal call direction is:

`routes → feature hooks → feature middleware.ts → server services → external systems`

A route loader can also call a feature adapter or domain query helper directly. Preserve the same boundaries: routes and UI do not query the database; server services do not import UI modules. Keep server-only code out of client bundles.

## Feature shape

```text
src/features/Admin/Users/
├── index.tsx
├── Components/
│   └── UsersTable/
│       ├── index.tsx
│       ├── Components/
│       │   └── UserActions.tsx
│       ├── Hooks/
│       │   └── useUsersTableLogic.ts
│       └── Types/
│           └── users-table.types.ts
├── Hooks/
│   └── useUsersLogic.ts
├── Types/
│   └── users.types.ts
├── middleware.ts
└── validation.ts
```

The tree shows possible ownership, not required boilerplate. Small features need fewer files. Do not create empty directories or duplicate hooks at the feature and component level.

- `index.tsx` defines the actual screen or component; it is not a re-export barrel.
- `Components/` contains presentation components.
- `Hooks/` contains UI state and workflows.
- `Types/` contains the owner's domain, input, form, logic-result, and props contracts.
- `middleware.ts` defines feature Server Functions and delegates to services.
- `validation.ts` defines Zod schemas and input normalization.

Domain behavior starts near the feature that owns it. Share UI when it has real reuse. Place UI-free helper implementations under their domain in lib; do not add a feature `Helpers/` folder.

## Complex components and tables

Place tables, forms, and modals under `Components/<MeaningfulName>/`. Add local `Components/`, `Hooks/`, and `Types/` only when they improve ownership.

For example, use `Users/Components/UsersTable/`; do not place `Users/Table/` beside `Users/Components/`.

Use TanStack Table for table state and behavior, and reuse the project's `src/shared/Table` components for common presentation. Feature columns, permissions, actions, filters, and selection workflows remain with the owning component or hook.

A `table` returned from the hook is the complete library instance. Domain actions such as deleting a user or exporting selected records remain in `handler`.

## Shared UI and lib modules

Reusable UI belongs in `src/shared/<Area>`, including the hooks and types that belong to that UI. UI-free utilities and reusable schemas belong in `src/lib/<Domain>`.

Split former `features/Auth/Shared` content by responsibility:

- Auth components and their UI hooks or props: `src/shared/Auth`.
- Token helpers, UI-free auth utilities, and reusable schemas: `src/lib/Auth`.
- Authentication policies, persistence, and other backend behavior: `src/server/Auth`.

Do not move server behavior into shared simply because it is used by multiple screens.

Larger lib modules may have their own structure:

```text
src/lib/Auth/PasswordReset/
├── tokenHandoff.ts
├── tokenValidation.ts
└── Types/
    └── password-reset.types.ts
```

Small helpers can remain a single meaningful file. Add structure when the module contains several coherent responsibilities. Avoid generic dumping grounds such as `helpers.ts`, `utils.ts`, or a large `shared.service.ts` for unrelated behavior.

Keep types beside their owner. Application-wide UI contracts may live in `src/shared/Types`; lib contracts belong in the lib module's `Types/`.

## Constants and query keys

Do not create dedicated `constants.ts`, `queryKeys.ts`, or a query-key directory merely to name literals.

- Used once: write a simple stable value at its use site.
- Repeated within one file: define a local constant in that file.
- Meaningful reuse across files: consolidate the relevant domain behavior in a lib module or shared hook and export from that defining module.
- Global configuration or security policy: keep it in the relevant `*.config.ts`.

For a key used once:

```ts
useQuery({
    queryKey: ['notifications'],
    queryFn: loadNotifications,
})
```

For query loading and invalidation in the same hook:

```ts
const notificationsQueryKey = ['notifications'] as const
```

For domain queries used by several screens, `src/lib/Notifications/notificationCache.ts` can own query options and related cache operations together. Export useful domain behavior rather than introducing a key-only module.

Query keys must still be stable and include all values that change the result, such as an ID, filter, sort, or page. Include appropriate domain scope and clear sensitive caches when authentication changes. Avoid broad invalidation when only one domain query is affected.

## Layouts

Public pages use `src/layouts/PublicLayout`; authenticated pages use `src/layouts/AuthenticatedLayout`. Keep layout state and behavior in layout hooks.

Place login, recovery, and first-user setup under the public route tree when the project supports these flows. User/admin pages belong under the authenticated tree, with additional permission guards as needed.

If an existing public shell is called `AuthLayout`, record the intended rename during planning. Rename its imports and callers only when the corresponding refactor is authorized.
