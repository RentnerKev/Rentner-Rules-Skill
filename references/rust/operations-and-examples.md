# Rust operations and examples

Scope: [Rust coding](coding.md). Read the relevant sections when choosing operations in Rust function bodies. These examples clarify decisions; they are not a required template or a reason to refactor unrelated code. Preserve the project's MSRV and existing contracts.

## Borrow, mutate, or consume a collection

For owned standard collections, choose iteration according to ownership:

```rust
fn normalize_names(mut names: Vec<String>) -> Vec<String> {
    // Read existing elements without moving them.
    let has_blank_name = names.iter().any(|name| name.trim().is_empty());

    if has_blank_name {
        names.retain(|name| !name.trim().is_empty());
    }

    // Mutate elements in the existing collection.
    for name in names.iter_mut() {
        name.make_ascii_lowercase();
    }

    // Consume the collection and move its strings into the result.
    names.into_iter().filter(|name| name != "disabled").collect()
}
```

`into_iter()` consumes its receiver, which can itself be a reference. On `&Vec<T>` it yields shared references, not owned `T` values; check the receiver/trait implementation rather than assuming every `into_iter()` moves elements. `make_ascii_lowercase()` above deliberately handles ASCII only; choose Unicode behavior according to the real text contract.

| Intent | Operation |
| --- | --- |
| Any / all elements satisfy a predicate | `any` / `all`, with early termination |
| First matching element | `find` |
| First successful optional transformation | `find_map` |
| Transform elements | `map` |
| Transform and intentionally omit absent results | `filter_map` |
| Count / sum | `count` / `sum` without an intermediate collection |
| Copy `Copy` values from references | `copied` |
| Deliberately clone referenced values | `cloned` |

Do not collect merely to iterate again or answer a predicate. Keep short transformations as iterator chains; use a `for` loop when branches, multiple state changes, side effects, or early exits are clearer. Avoid using `map` just for side effects or `for_each` merely to compress a normal loop. Name a complex iterator before consuming it if the name clarifies its purpose.

```rust
fn parse_ports(values: &[String]) -> Result<Vec<u16>, std::num::ParseIntError> {
    values.iter().map(|value| value.parse()).collect()
}
```

Collecting an iterator of `Result` into `Result<Vec<_>, _>` returns the first error. Do not replace this with `filter_map(|value| value.parse().ok())` unless deliberately skipping invalid input is the documented policy. If all failures must be reported, explicitly accumulate them instead. See [Iterator](https://doc.rust-lang.org/std/iter/trait.Iterator.html).

## Option, Result, and control flow

| Need | Prefer |
| --- | --- |
| Propagate failure or absence in a compatible return type | `?` |
| Handle different variants | `match` |
| Handle one interesting case | `if let` |
| Return early when a required pattern is absent | `let else` |
| Borrow an optional value | `as_ref` / `as_mut` |
| Borrow a dereferenced optional value, such as `Option<String>` to `Option<&str>` | `as_deref` / `as_deref_mut` where supported by the inner type |
| Turn absence into an error | `ok_or` for a cheap error, `ok_or_else` for deferred construction |
| Transform a present/successful value | `map` |
| Chain another fallible/optional transformation of the same kind | `and_then` |
| Translate an error while preserving its useful information | `map_err` |
| Provide an inexpensive fallback / compute it only if needed | `unwrap_or` / `unwrap_or_else` |
| Exchange `Option<Result<T, E>>` and `Result<Option<T>, E>` | `transpose` |

For example, distinguish an absent optional setting from a malformed present setting:

```rust
fn parse_optional_port(
    configured: Option<&str>,
) -> Result<Option<u16>, std::num::ParseIntError> {
    configured.map(str::parse).transpose()
}

fn nonempty_label(label: Option<&str>) -> Option<&str> {
    let Some(value) = label else {
        return None;
    };

    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }
    Some(trimmed)
}
```

For an existing `Option<String>` called `stored_label`, call `nonempty_label(stored_label.as_deref())` to retain ownership. Do not check `is_some()` and then `unwrap()`. Do not use `.ok()` or a fallback to silently erase an operational/configuration failure. Keep complex recovery logic in `match` instead of an opaque combinator chain. See [Option](https://doc.rust-lang.org/std/option/) and [Result](https://doc.rust-lang.org/std/result/).

## Move fields without cloning

```rust
use std::mem;

#[derive(Default)]
struct PendingWork {
    label: Option<String>,
    items: Vec<String>,
}

impl PendingWork {
    fn take_label(&mut self) -> Option<String> {
        self.label.take()
    }

    fn take_items(&mut self) -> Vec<String> {
        mem::take(&mut self.items)
    }

    fn replace_items(&mut self, items: Vec<String>) -> Vec<String> {
        mem::replace(&mut self.items, items)
    }
}
```

Use `Option::take()` to leave `None`, `mem::take()` to leave a meaningful `Default`, `mem::replace()` to install a chosen replacement, and `mem::swap()` to exchange two existing values. Ensure the replacement is valid for the owner's invariants; moving data out is not permission to leave an invalid state. See [std::mem](https://doc.rust-lang.org/std/mem/index.html).

## Update map entries directly

```rust
use std::collections::HashMap;

fn record_attempt(attempts: &mut HashMap<String, u32>, name: String) {
    attempts
        .entry(name)
        .and_modify(|count| *count = count.saturating_add(1))
        .or_insert(1);
}
```

Use `entry()` for an update-or-insert operation rather than separate `contains_key()` and update lookups. Use `or_insert_with()` when constructing a missing value is expensive. The example deliberately saturates a diagnostic counter; for domain counts or untrusted sizes, choose checked arithmetic and report overflow when required. `entry()` takes ownership of the key, so do not force it on read-only borrowed lookups. See [HashMap Entry](https://doc.rust-lang.org/std/collections/hash_map/enum.Entry.html).

## Implement conversion traits with validated construction

```rust
use std::num::NonZeroU16;
use std::str::FromStr;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct Port(NonZeroU16);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum PortError {
    InvalidNumber,
    Zero,
}

impl TryFrom<u16> for Port {
    type Error = PortError;

    fn try_from(value: u16) -> Result<Self, Self::Error> {
        NonZeroU16::new(value).map(Self).ok_or(PortError::Zero)
    }
}

impl FromStr for Port {
    type Err = PortError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let number: u16 = value.parse().map_err(|_| PortError::InvalidNumber)?;
        Self::try_from(number)
    }
}

impl Port {
    fn value(&self) -> u16 {
        self.0.get()
    }
}
```

This domain deliberately excludes port zero; socket-binding APIs may legitimately allow zero to request an assigned port. The private representation and checked conversion preserve this particular contract. Callers can use `Port::try_from(8080)` or `"8080".parse::<Port>()`. A full public error type should also implement useful `Display` and `std::error::Error` behavior; this focused example shows the conversion boundary without choosing an error crate.

## Construct text for the intended destination

Use `format!("{name}:{port}")` for a new formatted string, `write!`/`writeln!` for an existing string or writer, and `push_str`/`push` for plain appends. Handle fallible writer errors. Do not assume `format!` is always faster than concatenation or replace a real templating requirement with ad hoc string replacement. See [std::fmt](https://doc.rust-lang.org/std/fmt/).
