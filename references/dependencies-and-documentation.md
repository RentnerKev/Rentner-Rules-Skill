# Dependencies and version-matched documentation

Scope: dependency reuse, API documentation, and new dependency selection in every project/language profile. TypeScript and Rust references add their actual runtime, toolchain, target, and feature requirements.

## Installed packages and documentation

Start with suitable installed dependencies and existing integrations. Determine the installed version from package metadata and the owning lockfile before choosing APIs. Prefer shipped guides, declarations, examples, and documented read-only AI helpers for that version. Read only the sections relevant to the task.

For `@rentnerkev/*` releases exporting `/ai`, use their supported `getPackageInfo()`, `getPackageDocumentation()`, `getPackageApi()`, `searchPackageDocumentation()`, and `getPackageExamples()` helpers. Run these read-only helpers in local development tooling, outside the application/client bundle. Other dependencies may offer equivalent facilities with different entrypoints and names; discover their contract instead of assuming the Rentner helper API exists everywhere.

The RentnerPackages MCP server and website describe a published documentation snapshot that can differ from the installed release. Compare versions before using remote examples. Resolve mismatches through the installed declarations/source or official version-specific documentation; a remote guide does not establish local symbol availability. If local helpers are absent, use those alternatives rather than installing or upgrading a dependency merely to obtain documentation helpers.

## Research before adding a dependency

Before selecting a new package, crate, runtime, or development tool:

1. Establish the capability needed and check whether the runtime or an installed dependency already covers it.
2. Check current primary sources: official documentation, repository, releases, maintenance/deprecation notices, and relevant security advisories. Popularity or the newest release alone does not establish suitability.
3. Compare suitable alternatives against that actual need, including migration and maintenance cost.
4. Verify compatibility with the owning language profile, supported runtimes/toolchains/platforms, delivery model, and license requirements.
5. Explain the choice briefly with current evidence and material tradeoffs.
6. Add only the selected dependency and required owning-manifest/lockfile changes; preserve the existing package manager and avoid a second lockfile.

If current verification is unavailable, report that limitation rather than presenting a remembered dependency choice as researched. Reference version observations are not permanent pins.
