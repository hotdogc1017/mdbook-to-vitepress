# Including Files Tests

## Use `include` region
The complete file content of the `including_files.rs`:
```rs
struct Paddle {
    hello: f32,
}

impl System for MySystem { ... }
```

use `including_files.rs`:
```rust
{{#include ../listing/including_files.rs}}
```

use `including_files.rs:2`:
```rust
{{#include ../listing/including_files.rs:2}}
```

use `including_files.rs::10`:
```rust
{{#include ../listing/including_files.rs::10}}
```

use `including_files.rs:2:`:
```rust
{{#include ../listing/including_files.rs:2:}}
```
use `including_files.rs:2:10`:
```rust
{{#include ../listing/including_files.rs:2:10}}
```

## Use `rustdoc_include` region

{{#rustdoc_include ../listing/including_files.rs}}

{{#rustdoc_include ../listing/including_files.rs:2}}

{{#rustdoc_include ../listing/including_files.rs::10}}

{{#rustdoc_include ../listing/including_files.rs:2:}}

{{#rustdoc_include ../listing/including_files.rs:2:10}}

## Use `playground` region
```rust
{{#playground ../listing/including_files.rs}}
```

{{#playground ../listing/including_files.rs:2}}

{{#playground ../listing/including_files.rs::10}}

{{#playground ../listing/including_files.rs:2:}}

{{#playground ../listing/including_files.rs:2:10}}

## The `toml` file
```rust
{{#playground ../listing/Cargo.toml}}
```

## With anchor
Here is a component:
```rust,no_run,noplayground
{{#include ../listing/including_files_with_anchor.rs:component}}
```

Here is a system:
```rust,no_run,noplayground
{{#include ../listing/including_files_with_anchor.rs:system}}
```

This is the full file.
```rust,no_run,noplayground
{{#include ../listing/including_files_with_anchor.rs:all}}
```
