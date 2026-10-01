# Workflow and verification

## Start with the actual request

Read applicable repository instructions, Git status, the nearest canonical implementation, and directly relevant tests. Search and read only the area needed for the task; expand when a concrete dependency requires it.

Prefer `rg` for file/text discovery, with explicit paths and exclusions for forbidden or private content. Never scan `drizzle/` or real environment files.

Planning requests remain planning until implementation is requested. Separate agreed requirements from suggestions. Complete authorized work without repeatedly asking for permission already established in the conversation.

Do not use a small feature request as an excuse for broad renames, module removal, stack changes, or repository-wide formatting. When a complete starter alignment is explicitly requested, update its existing features and documentation consistently rather than leaving arbitrary old exceptions.

Preserve existing user changes. Avoid blanket reset, restore, cleanup, and formatting commands. Keep concurrent work intact.

## Code style and names

Use the established project formatter. For a new project adopting these rules, use:

- Four spaces; no tabs.
- No semicolons.
- Single quotes.
- Trailing commas.
- `import type` for type-only imports.
- `@/` for cross-area imports and short relative imports within a feature/module.
- Explicit `.ts`/`.tsx` suffixes for local imports when supported by the project's TypeScript/toolchain configuration.

Use PascalCase for components, `use...` for hooks, `...Service` for backend functions, and `...Handler` for Server Function exports.

Use `*.config.ts`, `*.service.ts`, `*.types.ts`, `*.test.ts`, and `*.db.test.ts` for their corresponding responsibilities.

Keep functions small and meaningful; prefer early returns. Split large components, hooks, and services when new behavior would add unrelated responsibilities.

Use precise types and discriminated unions or result types for public contracts. Do not add `any` or unchecked casts at system boundaries.

Do not create pure barrel/re-export files. Import from the defining module. Remove an existing pure barrel when its removal is part of the authorized change, updating its callers; do not use this rule to start an unrelated cleanup. An `index.tsx` that implements a component is valid.

Write comments for non-obvious invariants, security reasons, compatibility windows, or unusual side effects. Avoid comments that merely restate the code.

## Tests and checks

Keep tests in `src/tests` and mirror the tested source path below `src/`. For example:

```text
src/features/Admin/Users/validation.ts
src/tests/features/Admin/Users/validation.test.ts

src/server/Users/users.service.ts
src/tests/server/Users/users.service.test.ts
```

Use `.test.ts` for normal tests and `.db.test.ts` for actual database integration tests. Align test discovery with these paths; database tests must run separately from normal tests.

Discover real commands from package scripts, test configuration, and CI. Do not assume an inherited README accurately describes current tooling.

- First run the relevant existing tests or meaningful behavior checks.
- Run typecheck, read-only lint, and format checks appropriate to the change.
- Build when runtime/bundling/routes or the size of the change justify it. Record generated-file status first and inspect the resulting diff.
- Broaden testing when risk, failures, or additional changes warrant it.
- Do not add tests that only mirror implementation wording or trivial reversible presentation changes.
- Never hide failing tests, weaken assertions/security checks, or regenerate broad snapshots to make a check green.
- Separate failures introduced by the change from pre-existing failures and unavailable checks.

Do not manually modify generated route trees, build directories, or generated artifacts. Do not include an unrelated generated diff in a product commit.

## Documentation, Git, and handover

Update documentation affected by the change. Keep application README files concise: identity/banner, prerequisites, setup, feature overview, feature structure, and license. Put extended domain instructions where they belong.

When committing or pushing is requested or already authorized, stage only the intended files, inspect the staged diff, write a clear commit message, and push the intended branch. Preserve other work and never force-push or rewrite shared history without explicit authorization.

Check environment, route/permission, i18n, audit/realtime, and deployment consequences where relevant.

Report the result, relevant changed paths, checks performed, existing failures, skips, risks, and any maintainer-only steps. Do not claim a verification, installation, publication, or registration succeeded without evidence.

Use correct German umlauts and ß in German communication, documentation, and UI. For example: “Öfters gehe ich Eis essen und laufe dabei über den Fluss.”
