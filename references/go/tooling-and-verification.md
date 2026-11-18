# Go tooling and verification

Scope: [Go profile](index.md). Apply the shared [verification and autofix.ci policy](../../SKILL.md#verification-and-autofixci). Select checks from the affected module and its existing scripts, configuration, and CI.

## Module and dependency tooling

- Use the `go` toolchain for builds, modules, and tests. Honor the `go` directive and any selected `toolchain` directive in `go.mod`, along with the project's compatibility and CI requirements.
- Commit `go.mod` and `go.sum` when present. `go.sum` records checksums. Control dependencies through the module tooling and review manifest and checksum diffs. Use `go mod tidy` when changing dependencies and preserve established vendoring or workspace policy.
- Follow the shared [dependency and documentation policy](../dependencies-and-documentation.md). Check the installed API with `go doc`, and use version-matched [pkg.go.dev](https://pkg.go.dev/) or upstream documentation. Check the module path, Go version, platform or cgo requirements, maintenance, and advisories before introducing a dependency.
- Use the official `gopls` language server when available for definitions, references, and diagnostics. Its experimental MCP mode is optional. Its upstream agent instructions are available through `gopls mcp -instructions`.

[Go Modules Reference](https://go.dev/ref/mod) · [Go Toolchains](https://go.dev/doc/toolchain) · [gopls MCP](https://go.dev/gopls/features/mcp)

## Central tests

- Put all first-party `*_test.go` files under `tests/` beside the owning `go.mod`, including unit, integration, example, benchmark, and fuzz test files. Mirror the tested path, for example `internal/users/service.go` maps to `tests/internal/users/service_test.go`. Each module in a workspace owns its own test tree.
- Test directories are separate Go packages. Import the production package and exercise its exported contracts. A test in the module's central tree can import its `internal` packages but cannot access their unexported names. Keep private helpers private and cover them through meaningful package behavior. Test command behavior through the executable or through importable application behavior.
- Use the standard `testing` package. Use table-driven subtests when cases share a setup and assertion, `httptest` for HTTP behavior, and `t.TempDir()` for isolated writes. Keep fixtures under the relevant test package's `testdata/` and share test helpers within the central tree when needed.
- Verify the owning module with `go test ./...`. Run the central tree alone with `go test ./tests/...` or target a suite such as `go test ./tests/internal/users`. For source coverage from these separate test packages, include the relevant production packages with `-coverpkg`, for example `go test -coverpkg=./internal/... ./tests/...` for the example server.

[Go testing](https://pkg.go.dev/testing) · [go test](https://pkg.go.dev/cmd/go#hdr-Test_packages) · [httptest](https://pkg.go.dev/net/http/httptest)

## Verification and CI

- Run the relevant behavior tests, then the module checks warranted by the change. Use `gofmt` for formatting and `gofmt -l` on the intended paths for a read-only check. Treat nonempty formatter output as a check failure.
- Use `go vet ./...` for static diagnostics and `go build ./...` when compilation or delivery needs verification. Build the actual command targets for release checks. Run commands from the owning module or use the repository's explicit workspace-aware commands.
- Use `go test -race ./...` for concurrency-sensitive code on supported configurations. Use `govulncheck ./...` for applicable scheduled or release security checks. Verify native execution and cgo requirements on the platforms the project supports.
- For provider and runner selection, compose the [shared deployment rules](../deployment/index.md) with these checks. Verify the runner's Go version and native tool requirements against the module's actual targets.

[Go command reference](https://pkg.go.dev/cmd/go) · [Go security best practices](https://go.dev/doc/security/best-practices) · [Go race detector](https://go.dev/doc/articles/race_detector)
