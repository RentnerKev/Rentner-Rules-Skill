# Hybrid contracts and boundaries

Scope: [Hybrid profile](index.md). Use for the actual interface between the web and core areas. Internal types/error design remain in the language profiles; shared security-preservation constraints remain in [SKILL.md](../../SKILL.md).

## Source of truth and generation

Identify the authoritative transport contract and its owner before adding parallel types. Depending on the project, this can be a shared schema in `contracts/`/`schemas/`, a deliberately exported code-first transport definition, or an existing protocol source. Do not treat an internal Rust domain struct or frontend form model as the contract automatically.

Avoid indefinitely maintaining two independent definitions of the same wire shape. Use an existing compatible generator/schema approach when it reduces drift. For a few simple types, explicit ownership plus shared fixtures/contract tests can be simpler than new code generation and dependencies. A code-first source need not also have a manually maintained root schema.

If generation is justified, document the source, command, generator/toolchain version, output locations, and whether outputs are committed. Put language-specific outputs in their owning area, respecting existing TypeScript type ownership and Rust module boundaries. Keep generation deterministic and check drift in CI, including untracked output where relevant. Regenerate rather than hand-edit generated files. Selecting a generator/package/crate follows the language profiles' current dependency-research rules; none is a mandatory hybrid dependency.

Compile-time TypeScript types or generated bindings do not validate network data or establish authorization. Validate boundary input/output at the actual trust boundary using the established language mechanisms. A shared schema can express shape without duplicating authoritative business policy.

## Wire semantics and schema evolution

Define details that type names alone do not settle, and test their agreement on both sides:

| Concern | Contract decision |
| --- | --- |
| Fields | Serialized names/casing, required vs optional, absent vs null, and meaningful defaults |
| Integers and numeric data | Signed ranges, precision, units, and an encoding that both runtimes can represent losslessly |
| Enums/states | Stable discriminants, variant payloads, and behavior for unknown values |
| Time and binary data | Timestamp timezone/precision, duration units, and binary/text encoding |
| Collections and text | Ordering where meaningful, duplicate handling, bounds, and normalization where the domain requires it |

For JSON, do not silently round wide Rust integer IDs/counters through JavaScript `number`; choose bounded values or an explicit lossless representation when necessary. NaN/infinities are not JSON numbers. These interoperability constraints are described in [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html#section-6); other encodings need their own compatibility check.

Define a compatibility policy for readers/writers, API/protocol versions, and the expected deployment/old-client window. Avoid assuming an added optional field or enum variant is harmless when an existing decoder rejects unknown data. Do not reuse a field or error code with a new meaning, or silently change units/defaults. Make breaking changes explicit with migration/version/rollout decisions proportional to the actual consumers; do not add a versioning framework to a tiny private interface without a need.

Keep the public interface independent of internal module paths and third-party implementation types. For FFI/WASM, generated bindings do not remove ownership, lifetime, ABI, resource, or target constraints; use the relevant [Rust safety guidance](../rust/safety-and-runtime.md#unsafe-and-ffi) rather than redefining them here.

## External errors and operation lifecycle

Map internal errors deliberately at the boundary. Expose stable machine-readable codes/types when clients react to them, an appropriate transport status, and a safe human-facing message. Do not make message text the only error identifier or serialize Rust `Debug`, source chains, paths, stack traces, or private payloads directly to the web.

Distinguish domain rejection, authentication/permission failure, unavailable transport, timeout/cancellation, and incompatible responses where the caller needs different behavior. Keep internal causes in appropriate diagnostics with safe correlation context. Reuse the selected protocol's useful error structure rather than creating an elaborate envelope by default.

Define deadlines, retry/idempotency, partial completion, and cancellation semantics for operations that need them. A browser disconnect or TypeScript timeout does not prove a Rust operation was rolled back. Do not automatically retry a mutation or assume writes across both components share one transaction. For streaming/queues, define ordering/resume and duplicate-delivery behavior where relevant.

## Trust, authentication, and HTTP-specific protections

Treat browser/client/external data as untrusted regardless of TypeScript validation. Protected operations must validate input and enforce authorization at the trusted server/core boundary. Rust running in a browser or another untrusted client does not become an authorization authority merely because it is Rust.

Define who establishes identity and which component verifies it. When a TypeScript server forwards to a Rust service, forwarded user/tenant claims, privileged headers, and service credentials need an explicit authenticated trust contract; do not trust arbitrary client-supplied identity or accidentally let the proxy use broad credentials for unauthorized work. Limit exposed core interfaces and carry tenant/permission scope through the operation. Follow the existing [TypeScript backend protections](../typescript/backend-and-safety.md#authorization-and-request-protections) when a TypeScript server participates and [Rust external-data rules](../rust/safety-and-runtime.md#external-data-and-resource-limits) in the Rust boundary. [OWASP's REST guidance](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#access-control) explains endpoint access control.

For HTTP/browser deployments, deliberately configure origins, credentials/cookies, and the actual authentication flow. CORS governs browser access to responses; it is not authentication or general CSRF protection. Credentialed cross-origin responses require the appropriate explicit origin policy rather than a wildcard, as described by [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). Cookie-authenticated state changes need appropriate CSRF defenses; do not assume SameSite alone covers the deployment. See [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Apply these HTTP-specific rules only when that transport/authentication model is used.

Keep allowed message sizes, accepted operations, rate/resource limits, and streaming admission policy consistent across adapters so one path does not bypass the other side's protections. Local development should fix transport/proxy/origin configuration without weakening the production trust contract.

## Cross-component observability

Each ecosystem can retain its own appropriate logging implementation. For one running system, align useful log levels, timestamp semantics, structured event names, and request/correlation IDs. Bound and validate externally supplied identifiers; they are diagnostic context, not authentication.

Document where failures and latency can be traced across web/proxy/core hops, and which boundary logs/reporting avoid redundant or contradictory events. Use the shared secret/privacy constraints and the language-specific logging rules. Do not create a new logging stack solely to make both languages use the same library or copy private payloads into correlation metadata.

The external primary sources above were checked on 2026-10-02. Recheck current tooling and transport-specific recommendations when implementing a concrete integration.
