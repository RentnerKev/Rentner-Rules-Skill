# JavaScript and TypeScript tooling

Scope: every JavaScript/TypeScript area, including TypeScript-only applications, hybrid web areas, Tauri frontends, auxiliary scripts, and future profiles. This is the shared tooling policy; application profiles define their runtime and architecture. Rust formatting and linting remain in the [Rust verification profile](../rust/testing-and-verification.md).

## OXC defaults and project scope

Use **Oxlint for linting** and **Oxfmt for formatting** in new JS/TS projects. Install the appropriate current packages as development dependencies using the owning package manager and lockfile. Apply the [dependency research rules](dependencies-and-config.md#research-before-adding-a-package); do not hardcode a remembered version or add a second package manager.

Do not install ESLint or Prettier alongside them when OXC covers the required behavior. A demonstrated missing rule/plugin/format capability can justify retaining the relevant alternative for that gap. Verify current coverage, stability, runtime/platform requirements, and migration cost before deciding. OXC remains the default rather than an optional second checker.

Scope commands to the actual package, source, tests, and tooling files. Exclude forbidden `drizzle/` directories, real environment files, generated routes/bindings, build output, dependencies, and Cargo output before traversal. Inspect existing scripts and ignore configuration; a broad formatter invocation must not enter forbidden areas or overwrite generated files.

An illustrative package with source/tests under `src/` can use:

```json
{
    "scripts": {
        "lint": "oxlint src",
        "lint:fix": "oxlint --fix src",
        "format": "oxfmt src",
        "format:check": "oxfmt --check src"
    }
}
```

Adjust paths and arguments to cover the actual owned files and exclusions. Keep CI verification read-only; fixing/formatting commands are separate intentional edits. Reuse existing script names when suitable.

## Rules and formatting configuration

Commit the relevant tool configuration where the owning JS/TS package expects it. `.oxlintrc.json` and `.oxfmtrc.json` are suitable simple options; use supported alternatives only when useful. Root tooling config is distinct from the pure application data in `src/config`.

For React, enable the applicable built-in `react` rules, including hook correctness, and appropriate accessibility rules such as `jsx-a11y`. Select test/runtime rules for the real stack. Enabling a plugin makes rules available; check which categories/rules actually run. An explicit Oxlint `plugins` list replaces the defaults, so preserve the intended core/TypeScript rules as well. See [Oxlint plugins](https://oxc.rs/docs/guide/usage/linter/plugins.html) and [configuration](https://oxc.rs/docs/guide/usage/linter/config).

Translate the project's style into Oxfmt options. For a new TypeScript project adopting the [style defaults](workflow-and-verification.md#code-style-and-names), the relevant options are:

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": false,
    "singleQuote": true,
    "trailingComma": "all"
}
```

Preserve established style in an existing project unless the migration includes an agreed style change. Enable import/Tailwind sorting only when compatible with actual order-sensitive behavior and the project's conventions. Review formatting changes; migration is not permission for unrelated repository-wide rewriting. See [Oxfmt configuration](https://oxc.rs/docs/guide/usage/formatter/config.html).

## Type-aware linting and type checking

Evaluate type-aware linting when resolved TypeScript information improves checks, such as promise handling or unsafe assignments. Verify the current Oxlint/`oxlint-tsgolint` pairing, TypeScript/tsconfig support, rule coverage, stability, resource cost, and editor/CI behavior before enabling it. Do not add it automatically to a small JavaScript-only script.

The current [type-aware guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html) describes an additional `oxlint-tsgolint` dependency and `--type-aware` or root `options.typeAware`. Its documented TypeScript 7+ requirement and legacy-config limitations are time-sensitive; check the installed versions rather than upgrading TypeScript incidentally. Type-aware linting does not by itself replace type checking. Replace a separate checker with `--type-check` only after confirming its current status and equivalent coverage for that project, including build/plugin-generated types.

## Existing projects and verification

Inventory active ESLint/Prettier rules/plugins, ignores, scripts, editor hooks, config formats, and CI before a migration. Map supported behavior to OXC, identify real gaps, and verify the migrated checks on representative source and failing cases. Preserve useful safeguards; do not silence unsupported rules to claim equivalent coverage.

Keep another tool only for a concrete requirement OXC cannot yet meet, with a narrow documented scope. If that gap prevents a coherent migration, retain the existing tool deliberately and revisit it as support changes. Remove obsolete config/dependencies/editor integrations only when their callers have been updated within the authorized migration. Official guides: [ESLint migration](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html) and [Prettier migration](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier.html).

Verify lint and formatting rejection as well as success, type checking, and affected tests/builds with the installed tools. Report exact checks and justified compatibility exceptions under the shared handover rules.

Sources above were checked on 2026-10-02. Recheck OXC releases and support when applying this policy; those observations are not permanent toolchain pins.
