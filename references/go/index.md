# Go profile

Use this profile for Go libraries, command-line tools, HTTP services, workers, and daemons. Identify the owning `go.mod`, supported Go version, command targets, and any `go.work` that coordinates the affected modules. Follow the shared scope, dependency, verification, and cleanup policies in [SKILL.md](../../SKILL.md).

## Required conventions

- Keep every first-party Go test file in `tests/` beside its owning `go.mod`. Mirror the tested source paths within that tree and exercise package behavior through normal entrypoints.
- Organize packages by responsibility. For servers, put binaries under `cmd/<name>/` and application packages under `internal/`. Keep command wiring thin and package contracts deliberate.
- Start with the standard library for new work, including `net/http` and `http.ServeMux` for ordinary HTTP services. Choose additional dependencies for a concrete requirement and preserve established stacks in existing projects.
- Format with `gofmt`. Handle returned errors, propagate cancellation where callers can cancel work, and give every started goroutine a clear lifetime.

## Read the relevant details

| Work | Reference |
| --- | --- |
| Module and package boundaries, server layout, HTTP adapters, CLI and library structure | [Go architecture](architecture.md) |
| Naming, interfaces, errors, context, goroutines, HTTP lifecycle | [Go coding and runtime](coding.md) |
| Central test layout, test discovery, coverage, Go tooling, dependency checks | [Go tooling and verification](tooling-and-verification.md) |
| Provider workflows, Docker/Compose, security, delivery and releases | [Shared deployment routing](../deployment/index.md), with the Go verification rules |

Use [Go's module layout guide](https://go.dev/doc/modules/layout), [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments), and [Google's Go style guidance](https://google.github.io/styleguide/go/) for upstream guidance. The central test tree is a Rentner Rules convention.
