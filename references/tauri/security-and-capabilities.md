# Tauri security and capabilities

Scope: [Tauri profile](index.md). Shared secret/security-preservation restrictions remain in [SKILL.md](../../SKILL.md); ordinary input, filesystem, and process safety remain in the [Rust safety profile](../rust/safety-and-runtime.md).

## Treat the WebView as untrusted

Frontend validation serves UX. Native adapters must validate semantic input and enforce the operation's trusted authorization/policy even when TypeScript types or a UI guard look correct. Paths, URLs, process arguments, imports, exports, network destinations, credentials, and database input are native attack surfaces.

Use verified native invocation context when window/webview identity or resource ownership matters; do not authorize from a client-provided window label, role, tenant, or operation ID. Window labels/permissions constrain exposure but do not replace domain/resource checks. Capabilities protect the frontend-to-native boundary, not arbitrary direct Rust operations or compromised native code.

## Capabilities, permissions, and application commands

Grant only required commands/plugin functions, resource scopes, windows/webviews, origins, and target platforms. Inspect permission sets rather than assuming a plugin's `default` means minimal access. Multiple capabilities attached to one recipient combine permissions; review their effective union and wildcard labels. Control the creation/navigation of privileged windows so a less-trusted caller cannot acquire their identity/access. See [capabilities](https://v2.tauri.app/security/capabilities/) and [permissions](https://v2.tauri.app/security/permissions/).

Keep meaningful capability files under `src-tauri/capabilities/`. Review which files are active: by default files there are enabled, while an explicit Tauri capability selection limits the included set. Validate against generated schemas for the installed plugins/platform and keep generation under the existing generated-file policy.

**Own application commands need deliberate exposure control.** Merely creating a capability file does not restrict every command registered with `invoke_handler`: Tauri's documented default exposes registered app commands to all app windows/webviews. Where per-window permissions are required, configure the installed version's application-command ACL through `tauri-build`/`AppManifest::commands`, define/reference the corresponding permissions, and test both permitted and rejected callers. Plugin permissions and app-command registration are distinct mechanisms; capability configuration must match the actual guarded command path.

Do not copy a Tauri v1 global allowlist into v2. Inspect existing version/schema and [runtime authority](https://v2.tauri.app/security/runtime-authority/) before changing access policy. Grant a concrete needed permission rather than weakening the boundary to make development or tests pass.

## Content, navigation, and protocols

Configure a restrictive production CSP for actual bundled assets and allowed connections. CSP protection must be configured; do not assume an absent policy is protective. Permit only needed dev/HMR sources in the appropriate development configuration. Avoid blanket wildcards, broad unsafe directives, or disabling asset CSP handling to fix one blocked resource. See [Tauri CSP](https://v2.tauri.app/security/csp/).

Prefer bundled trusted UI assets. Untrusted HTML, imports, remote pages/scripts, and navigation must not inherit a privileged WebView's native access. Keep remote-origin capability grants deliberate and narrow, and assess iframe/platform behavior; loading a URL does not make its content trusted. Use validated external-opening/navigation mechanisms for actual needs instead of granting all sites IPC.

If asset/custom protocols expose native files or resources, enforce their real scope, requested paths, content type, and size policy. A URL scheme or CSP source is not a filesystem authorization check. Restrict the asset protocol to needed roots; a custom Rust handler needs its own checks and must not serve arbitrary user paths. Follow [asset protocol scopes](https://v2.tauri.app/security/asset-protocol/) and the existing Rust path rules.

## Native files, processes, and external interfaces

Apply Rust's path/symlink/junction/overwrite/race rules in native code. Plugin filesystem scopes constrain plugin commands; custom commands using direct Rust filesystem APIs need their own enforcement. A frontend-supplied path or a previously selected file is not unrestricted authority for unrelated reads/writes. Keep user-selected resources and privileged app directories under the intended operation policy.

Use structured process APIs with separate validated arguments, fixed/allowed programs, and explicit working directory/environment. Shell metacharacter escaping alone does not prevent dangerous argument behavior. Grant only required shell/sidecar actions and arguments where plugin scopes apply; Rust-launched processes still require application checks. See [shell plugin permissions](https://v2.tauri.app/plugin/shell/) and [sidecar integration](https://v2.tauri.app/develop/sidecar/).

For an additional actual HTTP server, define bind exposure, client authentication, request/origin protections, resource limits, and shutdown independently of Tauri IPC. Loopback binding alone does not authorize a caller, and browser-visible HTTP routes do not inherit Tauri capability checks. Do not add a server for ordinary native calls.

## Secrets and persistent data

Distributable frontend assets, bundled resources, `VITE_*` values, and app binaries cannot keep a universal server credential secret. Keep signing keys in protected build/release infrastructure and native credentials in appropriate OS secure storage or a verified secure-store integration. Never return secrets through generic settings/progress/events or put them in logs/crash reports.

Separate non-sensitive preferences from credentials and authoritative durable data. Use the [desktop persistence/lifecycle rules](desktop-and-runtime.md#persistence-and-recovery), and research suitable current plugins/storage rather than installing a store automatically. Local native execution is not protection against every user/process with access to the machine; document the actual threat boundary where it affects a feature.

Primary Tauri v2 sources above were checked on 2026-10-02. Review effective permissions, native validation, remote content, and packaged production configuration for security changes; a successful UI mock test does not verify those boundaries.
