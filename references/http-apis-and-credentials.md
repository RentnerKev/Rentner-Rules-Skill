# HTTP APIs and integration credentials

Scope: HTTP APIs and application-issued integration API keys, regardless of implementation language. Apply the shared [scope, secret, and authorization rules](../SKILL.md#work-safely-and-finish-the-task). Use these conventions for new interfaces/credentials; changing an existing published contract needs a deliberate compatibility/migration decision within the requested work.

## Versioned HTTP APIs

- Use an explicit major-version path for application HTTP API endpoints, especially external integrations: `/api/v1/health`, `/api/v1/sandwiches`, or `/api/v2/orders`. Keep routes, clients, examples, and contract tests aligned with that version.
- Put incompatible request, response, authentication, or behavior changes behind a new API major version. Preserve the existing contract for any version still supported and define its deprecation/migration path. The API version describes the wire contract and is independent of the application's package/release version.
- Inspect existing consumers before changing URLs; do not silently rename or remove a live endpoint as part of unrelated work. Versioning does not change the endpoint's authentication or authorization requirements.
- Native Tauri IPC and other non-HTTP transports retain their own contract and compatibility mechanisms; this rule does not add an HTTP server to them.

## Integration API key format and display

Use one combined credential with the literal prefixes and separator:

```text
pub_<public-id>.pvt_<private-secret>
```

- `pub_<public-id>` is the unique lookup/display identifier. Show it in the panel after creation so users can identify the integration. Generate the private secret with a cryptographically secure random generator and sufficient entropy.
- Reveal the private part and the complete copyable credential only once when creating a new key or rotating it. Explain that it must be saved then. Subsequent panel views and list/detail API responses expose only the public identifier and safe metadata, never the private part or complete key. A lost secret requires rotation/replacement.
- On the issuing server, persist the public identifier and a one-way verifier/hash of the private secret using the project's established secure token-verification mechanism. Do not retain recoverable plaintext/encrypted copies merely to redisplay an issued secret.
- Connection forms and clients must supply the complete `pub_<public-id>.pvt_<private-secret>` string as one credential. Look up the key by its public identifier and verify the matching private secret. Reject either part alone, malformed combinations, mismatched pairs, and revoked keys; enforce the key's actual permissions/tenant scope and applicable expiry.
- Transmit the full credential through the API's established authentication header over HTTPS, for example `Authorization: Bearer pub_<public-id>.pvt_<private-secret>` when Bearer is the chosen contract. Keep it out of URLs, logs, traces, analytics, error messages, and ordinary UI responses; redact it in diagnostics. Revocation and rotation must invalidate keys according to the documented lifecycle.

## Verification

For changes to these behaviors, verify the versioned routes and supported old-client contract, successful authentication with a matching full key, rejection of incomplete/mismatched/revoked keys and expired keys where expiry is supported, one-time creation/rotation display, and absence of secret fields in later panel/list/detail responses. Use synthetic credentials and test fixtures.

The prefixes and one-time display policy are Kevin's convention. General transport, leakage prevention, and key lifecycle safeguards follow [OWASP REST security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#sensitive-information-in-http-requests) and [OWASP secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#27-secret-lifecycle); checked on 2026-11-17.
