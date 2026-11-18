# Go architecture

Scope: [Go profile](index.md). Identify the existing module, entrypoints, package contracts, and nearest comparable implementations before changing a project.

## Modules and packages

- Start with one `go.mod` for a single application or library. Add modules for genuine independent versioning or ownership. Use `go.work` to coordinate development across existing modules when useful.
- Organize by cohesive responsibility. Use short lowercase package names such as `users` or `httpapi`. Keep types and small helpers with their owning package. Add packages when they establish a useful boundary.
- Keep implementation packages under `internal/`. A library may expose an importable package at its module root and add public subpackages for deliberate API boundaries.
- A small standalone CLI may keep `main.go` at the module root. For servers, multiple commands, or a library shipped with commands, put each executable in `cmd/<name>/`.

[Go module layout](https://go.dev/doc/modules/layout) · [Go package names](https://go.dev/blog/package-names)

## HTTP service layout

```text
go.mod
cmd/
└── api/
    └── main.go
internal/
├── httpapi/
│   ├── routes.go
│   └── users.go
└── users/
    └── service.go
tests/
└── internal/
    ├── httpapi/
    │   └── users_test.go
    └── users/
        └── service_test.go
```

- `cmd/api/main.go` wires configuration, dependency construction, server startup, and shutdown. Keep substantive behavior in importable packages.
- `internal/httpapi` registers routes, parses requests, validates input format, and maps results and errors to responses. Apply the shared [API versioning and credential rules](../http-apis-and-credentials.md) to applicable endpoints.
- `internal/users` owns user behavior and domain invariants. Keep dependencies pointing from the HTTP adapter toward the domain. Add persistence or other adapters where a concrete integration needs its own boundary.
- Use `http.Handler` and `http.ServeMux` as the default for new HTTP services. Route patterns that match methods and path parameters require Go 1.22 or later. A compatible router such as chi is an option when route grouping and middleware composition justify it.

[Go routing patterns](https://go.dev/blog/routing-enhancements) · [net/http](https://pkg.go.dev/net/http) · [chi](https://github.com/go-chi/chi)
