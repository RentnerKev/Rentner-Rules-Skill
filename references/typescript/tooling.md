# JavaScript and TypeScript tooling

Scope: every JavaScript/TypeScript area, including TypeScript-only applications, hybrid web areas, Tauri frontends, auxiliary scripts, and future profiles. This is the shared tooling policy; application profiles define their runtime and architecture. Rust formatting and linting remain in the [Rust verification profile](../rust/testing-and-verification.md).

## Oxlint and Bun fmt defaults and project scope

Use **Oxlint for linting** and **Bun's native `bun fmt` for formatting** across JS/TS areas. Install only the required lint packages as development dependencies using the owning package manager and lockfile; the formatter ships with Bun and needs no `oxfmt`, Prettier, or formatter plugin package for built-in capabilities. Keep the project's package manager and runtime choices; using Bun to format does not require converting them. Apply the [dependency research rules](dependencies-and-config.md#research-before-adding-a-package) to actual new dependencies.

Verify `bun --version` and `bun fmt --help` in development, editor, and CI environments before adoption, and align their Bun toolchain when the native command is unavailable. Bun 1.4.4 was verified for this policy; recheck current support rather than treating that observation as a permanent version pin. Do not replace the native command with `bunx oxfmt` or install a separate formatter as a fallback for an old Bun version.

Do not add ESLint or another formatter when Oxlint and Bun fmt cover the required behavior. A demonstrated missing rule/plugin/format capability can justify retaining a narrowly scoped alternative for that gap. Verify current coverage, stability, runtime/platform requirements, and migration cost before deciding. Oxlint remains the linting standard; this policy does not select Bun's linter or replace Rust's rustfmt/Clippy tooling.

Scope commands to the actual package, source, tests, and tooling files. Exclude `drizzle/`, real environment files, generated routes/bindings, build output, dependencies, and Cargo output from lint/format traversal and rewrites. Relevant manual read-only inspection of `drizzle/` follows the [database policy](backend-and-safety.md#drizzle-and-schema-boundary) and any stricter task instructions. Inspect existing scripts and ignore configuration before execution; a bare `bun fmt` or `bun fmt .` walks the current directory and needs verified exclusions first.

An illustrative package with source/tests under `src/` can use:

```json
{
    "scripts": {
        "lint": "oxlint src",
        "lint:fix": "oxlint --fix src",
        "format": "bun fmt src",
        "format:check": "bun fmt --check src"
    }
}
```

Adjust paths and arguments to cover the actual owned files and exclusions, for example `web/src` in a hybrid project. `bun fmt` writes by default; it needs no `--write`. Keep CI verification read-only with `--check`; fixing/formatting commands are separate intentional edits. Reuse existing script names when suitable, but inspect a `fmt` script: `bun fmt` dispatches to it when present. Update that script too; inside it, `bun fmt` invokes the native formatter. Tools that must bypass script dispatch can use `bun fmt --no-script`.

## Rules and formatting configuration

Commit the relevant tool configuration where the owning JS/TS package expects it. Use `.oxlintrc.json` for linting and the native `[fmt]` section in `bunfig.toml` for new formatter configuration. Merge into existing Bun settings rather than replacing them. Keep both at the repository root for hybrid projects. Root tooling config is distinct from the pure application data in `src/config`.

For React, enable the applicable built-in `react` rules, including hook correctness, and appropriate accessibility rules such as `jsx-a11y`. Select test/runtime rules for the real stack. Enabling a plugin makes rules available; check which categories/rules actually run. An explicit Oxlint `plugins` list replaces the defaults, so preserve the intended core/TypeScript rules as well. See [Oxlint plugins](https://oxc.rs/docs/guide/usage/linter/plugins.html) and [configuration](https://oxc.rs/docs/guide/usage/linter/config).

Translate the project's style into Bun fmt options. For a new TypeScript project adopting the [style defaults](workflow-and-verification.md#code-style-and-names), a `bunfig.toml` example is:

```toml
[fmt]
tabWidth = 4
useTabs = false
semi = false
singleQuote = true
trailingComma = "all"
ignorePatterns = [
    "**/drizzle",
    "**/drizzle/**",
    "**/.env",
    "**/.env.*",
    "**/node_modules",
    "**/node_modules/**",
    "**/vendor",
    "**/vendor/**",
    "**/target",
    "**/target/**",
    "**/dist",
    "**/dist/**",
    "**/build",
    "**/build/**",
    "**/out",
    "**/out/**",
    "**/.output",
    "**/.output/**",
    "**/coverage",
    "**/coverage/**",
    "**/generated",
    "**/generated/**",
    "**/*.gen.*",
    "**/*.generated.*",
]
```

Bun also skips dependencies and Git-ignored files, but those defaults do not replace explicit protection for sensitive or generated paths. Extend the example with the actual generated binding/route directories and framework/build outputs. Apply corresponding exclusions to Oxlint; formatter ignores do not configure the linter.

Preserve established style, print width, overrides, and ignore behavior in an existing project unless the migration includes an agreed style change. Bun can read existing Oxfmt/Prettier configurations as a migration bridge without retaining the formatter package. When moving settings into `[fmt]`, verify config precedence and effective defaults before removing the old file. Bun settings override config files and `.editorconfig`. Enable import/Tailwind sorting only when compatible with actual order-sensitive behavior and the project's conventions. Review formatting changes; migration is not permission for unrelated repository-wide rewriting. See [Bun fmt](https://bun.com/docs/format) and [Bun formatter configuration](https://bun.com/docs/runtime/bunfig#formatter).

## Type-aware linting and type checking

Evaluate type-aware linting when resolved TypeScript information improves checks, such as promise handling or unsafe assignments. Verify the current Oxlint/`oxlint-tsgolint` pairing, TypeScript/tsconfig support, rule coverage, stability, resource cost, and editor/CI behavior before enabling it. Do not add it automatically to a small JavaScript-only script.

The current [type-aware guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html) describes an additional `oxlint-tsgolint` dependency and `--type-aware` or root `options.typeAware`. Its documented TypeScript 7+ requirement and legacy-config limitations are time-sensitive; check the installed versions rather than upgrading TypeScript incidentally. Type-aware linting does not by itself replace type checking. Replace a separate checker with `--type-check` only after confirming its current status and equivalent coverage for that project, including build/plugin-generated types.

## Existing projects and verification

Inventory active lint/formatter rules/plugins, ignores, package scripts (including `fmt`), editor hooks, config formats, and CI before a migration. Map lint behavior to Oxlint and formatting behavior to Bun fmt, identify real gaps, and verify the migrated checks on representative source and failing cases. Preserve useful safeguards; do not silence unsupported rules to claim equivalent coverage.

Use Bun's read-only `--doctor` on the same verified file scope to inspect formatting compatibility. It does not audit every external caller: update CI, Git hooks, and editor integrations explicitly. Bun fmt has no formatter language server; do not claim an Oxfmt editor/LSP setup migrated by changing a package script. Prefer an editor integration invoking native Bun fmt; retain an extra tool only for a demonstrated requirement the selected tool cannot meet, with a narrow documented scope.

Remove the separate `oxfmt` dependency through the owning package manager and lockfile after its callers have migrated; preserve Oxlint and any required `oxlint-tsgolint` dependency. Remove obsolete formatter configs only after transferring their effective settings and exclusions. Official guides: [ESLint to Oxlint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html), [Oxfmt to Bun fmt](https://bun.com/guides/format/migrate-from-oxfmt), and [Prettier to Bun fmt](https://bun.com/guides/format/migrate-from-prettier).

Verify lint and formatting rejection as well as success, type checking, and affected tests/builds with the installed tools. Bun fmt `--check` returns `0` for formatted files, `1` for formatting differences, and `2` for errors such as invalid syntax; it must not write files. Verify protected files stay excluded and report exact checks and justified compatibility exceptions under the shared handover rules.

Bun formatter sources and native commands were checked on 2026-10-22 with Bun 1.4.4; Oxlint sources were checked on 2026-10-02. Recheck current releases and support when applying this policy; those observations are not permanent toolchain pins.
