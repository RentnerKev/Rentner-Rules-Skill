# Rust safety and runtime

Scope: [Rust profile](index.md). Load sections for the actual boundaries touched. Shared secret, authorization, migration, generated-file, and security-preservation constraints live in [SKILL.md](../../SKILL.md).

## External data and resource limits

Validate external data at its boundary before it becomes trusted domain state. Parsing/deserialization is not authorization or complete semantic validation. Bound input sizes, nesting, archive expansion, allocations, queues, retries, and timeouts where untrusted or uncontrolled work could exhaust resources. Use checked arithmetic/conversions for sizes and offsets.

When Serde is appropriate, keep persisted/wire contracts deliberate: validate invariants after decoding, define defaults only when meaningful, and preserve format compatibility. Decide whether unknown fields are accepted or rejected according to the actual contract rather than applying `deny_unknown_fields` everywhere. Do not indiscriminately derive serialization for internal or secret-bearing objects. See [Serde attributes](https://serde.rs/attributes.html); selecting Serde still follows the dependency rules.

Invoke external programs with `std::process::Command` and separate arguments rather than interpolating untrusted data into a shell command. Validate argument semantics as well as syntax. Use a shell only for a real requirement and keep its quoting/side effects explicit.

## Filesystem and path safety

Use `Path`/`PathBuf` and `OsStr`/`OsString` for filesystem/OS values. Paths may not be UTF-8; avoid `to_str().unwrap()`, lossy round-trips, hardcoded separators, and assuming case sensitivity or identical Windows/Unix semantics. Lossy display is acceptable for diagnostics when it does not become an operational path.

For copy/sync/archive tools, define overwrite, symlink-following, permission/metadata, collision, partial-failure, and cancellation policies before implementing mutations. Validate allowed roots and reject unwanted absolute paths, parent traversal, and archive entries escaping the destination. Detect destructive source/destination overlap where relevant. Do not accidentally overwrite, delete, or recursively follow arbitrary user data.

Canonicalization and an `exists()` check do not close check-then-use races. Symlinks, junctions, and concurrent replacements can invalidate prior validation. Where paths are attacker-controlled, choose operations/handles that enforce the intended directory boundary during use; do not claim string-prefix or canonical-path checks alone are secure. Account for destinations that do not yet exist.

Use atomic exclusive creation such as [`OpenOptions::create_new`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#method.create_new) when overwrite must be prevented. Use an established securely created temporary file/directory when needed; a predictable name plus an existence check is insufficient. Select any helper crate through the Cargo research process.

When replacing files, stage within the appropriate filesystem and define platform-specific replacement and cleanup semantics. Do not assume a rename is interchangeable across filesystems/platforms or that atomic visibility implies crash durability. Flush/sync and directory durability requirements depend on the operation's promises. Preserve recovery information where partial work matters and propagate write/flush errors.

Before recursive deletion/moving, confirm the actual source and target remain within the authorized scope, including link behavior. Keep plan/validation and execution responsibilities clear when a destructive workflow merits them; simple safe operations do not require a framework or elaborate transaction model.

## Environment and observability

Read/validate configuration at a clear startup boundary and pass typed values to consumers. Use OS-string environment access for paths where appropriate. Define missing/invalid value handling and do not hide configuration errors with unsafe production defaults.

Avoid mutating the process environment in threaded application code or parallel tests. `std::env::set_var`/`remove_var` require unsafe calls in Edition 2024 and have platform-dependent safety constraints; adding an unsafe block is not a portability fix. Prefer explicit config injection or `Command::env` for child-process configuration. See [`set_var` safety](https://doc.rust-lang.org/std/env/fn.set_var.html).

Initialize logging/tracing once at the application boundary when needed. Libraries emit through the selected facade without installing a global subscriber/logger or choosing a caller's output policy. Do not add a logging dependency to a tiny tool without a need. For CLIs, reserve stdout for the command's data/output contract and use stderr for diagnostics where appropriate.

Apply shared secret constraints to derived `Debug`, error formatting, spans, serialized values, and structured fields; automatic derives can leak data too. Capture actionable context and correlation identifiers without logging unbounded or private payloads. Reuse a suitable existing logging approach and verify current candidates when one must be selected.

## Concurrency and shutdown

Choose concurrency only for a real requirement. Prefer clear ownership and immutable sharing before shared mutable state. Message passing, narrower synchronization, or a simpler sequential design can remove the need for `Arc<Mutex<T>>`; that type is a deliberate choice rather than a reflex. Respect `Send`/`Sync` requirements; do not add unsafe impls merely to force a mismatched design to compile.

Keep lock scope short, maintain consistent lock ordering, avoid invoking arbitrary callbacks while locked, and choose a synchronization primitive appropriate to the runtime. Do not hold a blocking mutex guard across `.await`; other guards held across awaits also need a specific reason and deadlock/latency review. Handle lock poisoning according to the invariant instead of reflexively unwrapping or ignoring it.

Do not execute blocking filesystem/process/CPU work unnoticed on an async executor. Use the selected runtime's appropriate blocking facility or an owned worker design, with resource limits; spawning blocking work does not automatically make it cancellable.

Bound tasks, threads, channels, queued work, open files, and concurrent I/O. Apply backpressure at admission rather than creating thousands of waiting tasks or an unbounded queue. Keep task/thread handles when their completion matters and observe errors; detached work requires an intentional lifecycle.

Define cancellation semantics: dropping a future does not undo committed side effects, and abandoning a handle may leave work running. Use cooperative cancellation where necessary and make partial work/retry behavior explicit. For long-running services, stop accepting work, signal workers, drain or cancel according to policy, flush relevant state, and join owned tasks/threads with an appropriate timeout. Handle platform signals at the application boundary; libraries should not install process-wide handlers by surprise.

## Unsafe and FFI

Avoid unsafe by default. Before introducing it, check for a safe maintained alternative and a concrete requirement. Keep required unsafe operations in the smallest scope behind a safe API when possible, document every safety invariant at the operation, and state caller obligations on any unsafe public API. Do not propagate raw-pointer assumptions through otherwise safe code.

Check pointer validity, alignment, initialization, aliasing, lifetimes, ownership/deallocation, threading, and foreign ABI/layout assumptions. An `unsafe fn` does not remove the need to justify its internal unsafe operations; use explicit small unsafe blocks consistent with the lint/MSRV policy. `unsafe impl Send/Sync` needs the same soundness evidence as pointer code. Do not use unsafe for an unmeasured micro-optimization.

At FFI boundaries, make ownership and release functions, valid lengths, nullability, callback lifetimes, thread rules, and unwinding/error translation explicit. `repr(C)` describes a layout choice; it does not make arbitrary Rust values safe for C. Do not let panics or foreign exceptions cross an ABI boundary unless the chosen ABI and both sides' contracts explicitly permit it. `catch_unwind` does not catch aborting panics and is not an ordinary error policy. See the [Rust FFI guide](https://doc.rust-lang.org/nomicon/ffi.html).

Use focused boundary tests and applicable diagnostic tooling described in [verification](testing-and-verification.md#ci-compatibility-and-release-checks). Passing tests does not prove unsafe code sound.
