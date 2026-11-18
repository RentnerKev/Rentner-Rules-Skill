# Go coding and runtime

Scope: [Go profile](index.md). Follow the owning module's Go version when selecting language features and APIs.

## Names and contracts

- Use MixedCaps for multiword identifiers and conventional initialisms such as `userID` and `HTTPClient`. Name exported symbols in package context, such as `users.Service`. Document exported contracts and any non-obvious zero-value, ownership, concurrency, or error semantics.
- Return concrete implementations by default. Define small interfaces at the consumer when there is a real substitution boundary. Construct dependencies explicitly at the application entrypoint.
- Give the zero value useful behavior where practical. Check observable API semantics when substituting a nil slice or map for an empty one, especially in serialized responses.
- Prefer direct control flow and early error returns. Use ordinary loops and standard-library helpers appropriate to the module's Go version. Add generics where type parameters remove meaningful duplication while keeping usage clear.

[Google Go Style Guide](https://google.github.io/styleguide/go/guide) · [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)

## Errors

- Handle errors or return them to the caller. Add operation context when it helps diagnose failure. Use `fmt.Errorf` with `%w` when callers should be able to inspect the cause with `errors.Is` or `errors.As`. Wrapping a dependency error can expose it as part of the caller-facing contract.
- Return a plain `nil` for success when the result type is `error`. Use stable sentinel or typed errors when callers must distinguish a condition. Map domain errors to protocol responses at the boundary.
- Use errors for expected failures. Log at the boundary that decides how to report the failure and redact sensitive values. Reserve panics for exceptional programmer errors or invariants that prevent safe continuation.

[Go error wrapping](https://go.dev/blog/go1.13-errors) · [Google Go Best Practices](https://google.github.io/styleguide/go/best-practices)

## Context, concurrency, and shutdown

- Pass `ctx context.Context` as the first parameter when a function participates in cancellation or deadlines. Propagate the caller's context through request work and I/O. Call the cancel function for derived cancellable contexts and use context values for request-scoped metadata.
- Keep work synchronous until there is a concrete reason to run it concurrently. Define who starts each goroutine, how it stops, and who waits for it. Bound concurrency when work can grow with input or traffic and synchronize shared mutable state.
- Use `golang.org/x/sync/errgroup` when related goroutines need coordinated cancellation and error propagation. When using channels, make sender and close ownership explicit and ensure blocked operations can exit.
- For HTTP servers, set timeouts and body limits appropriate to the workload. Handle termination by draining requests with a bounded shutdown context. Coordinate workers and resource closure with their owners, including any long-lived connections that need separate shutdown handling.

[context](https://pkg.go.dev/context) · [Google Go Style Decisions](https://google.github.io/styleguide/go/decisions) · [errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup) · [HTTP server shutdown](https://pkg.go.dev/net/http#Server.Shutdown)
