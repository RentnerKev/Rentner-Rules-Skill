# Backend and safety

Scope: [TypeScript profile](index.md). Server Function and service conventions are TypeScript-specific; the shared safety restrictions in [SKILL.md](../../SKILL.md) apply to every language.

## Feature boundary and backend ownership

The feature's `middleware.ts` is the chosen filename for its Server Function adapter. It normally uses TanStack Start `createServerFn`; the filename does not mean every exported function must be a framework `createMiddleware` object.

Keep the adapter focused on the HTTP method, input validator, authentication/permission checks, rate limits, and service call. Use `...Handler` names for its Server Function exports.

Define input schemas and pure normalization in feature `validation.ts`. Shared UI-free schemas belong in their domain lib module. Validate external input from `unknown`; do not use an unchecked cast as validation.

Put business policy, database queries, transactions, queues, mail, storage, and other integrations in meaningful `src/server/<Domain>/*.service.ts` modules. Backend functions use `...Service` names.

Prefer `GET` for reads and `POST` for mutations at Server Function boundaries. For raw APIs, preserve the project's endpoint contract and HTTP semantics.

## Authorization and request protections

Protected operations authorize themselves on the server, using the project's permission service. A route guard, layout, or hidden UI control is insufficient.

Preserve same-origin checks, rate limits, input limits, output sanitization, audit trails, encryption, token hashing, and path validation. Never disable them to make a test pass.

For raw mutation APIs, apply the project's established origin, authentication, permission, rate-limit, and validation protections. Return safe client errors; log internal causes through structured events without exposing private payloads.

For multi-step dependent writes, use a transaction. Repeat critical policy checks within the transaction when concurrent changes could invalidate an earlier decision.

## Secrets and security state

- Use the runtime's established password hashing implementation; in Bun-based starters, use Bun password hashing.
- Persist session, reset, trusted-device, and comparable bearer tokens only in hashed form.
- Preserve established encryption and authenticated handling of secrets.
- Do not log passwords, raw tokens, connection credentials/URLs, encryption keys, decrypted secrets, email bodies, or personal payloads.
- Audit changes to authentication, users, permissions, system settings, backups, and comparable administrative state.
- When a change affects global client state, maintain the corresponding realtime event, guard, publisher, and client handling together.
- Put security policy values in the relevant declarative config instead of scattering magic numbers through handlers.

Follow the project's specific bootstrap, first-user, geolocation, recovery, backup, and queue invariants where they exist. Do not turn one application's particular token lifetime or infrastructure script into a universal setting for every consumer of this skill.

Temporary caches, rate limits, queues, and realtime transport do not replace durable domain storage. If a deployment deliberately uses ephemeral Valkey, preserve safe recovery or reconciliation when that state disappears.

## Drizzle and schema boundary

Never read, list, modify, move, or delete `drizzle/`.

Never run Drizzle CLI or database migration commands. This includes `drizzle-kit`, `db:generate`, `db:migrate`, `db:push`, `db:pull`, `db:studio`, and wrappers that invoke them.

An explicit schema request permits changes only to the declared schema source files and necessary schema exports. In TanStack Dummy, these are `src/db/Schema/*.ts`, `src/db/schema.ts`, and `src/db/Schema/index.ts`. Follow a different repository's explicitly declared schema-source path when applicable.

Do not generate a migration afterward. Tell the maintainer that migration creation and execution remain their separate steps.

Exclude `drizzle/` from repository searches and recursive operations. Check package scripts before executing verification chains that could invoke database tools.

## External side effects

Do not send real email, run production backups/restores, or mutate ordinary/production databases or Valkey/Redis services as a test.

Database integration tests require explicit authorization for an isolated test database. Use mocks, unit/contract tests, and temporary isolated resources where appropriate.

Do not invoke bootstrap access generation, permission synchronization, data seeding, production deployment, or external communication merely because a build or feature change would benefit from it. Carry out an already authorized operation within its actual scope.

Do not add automatic migrations or permission synchronization to application, worker, or container startup.
