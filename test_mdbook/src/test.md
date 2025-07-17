# Test Heading

This is a test markdown file.

# fn main() {
    let x = 5;
    let y = 6;

    println!("{}", x + y);
# }

~hidden()
nothidden():
~    hidden()
    ~hidden()
    nothidden()

```python,hidelines=!!!
!!!hidden()
nothidden():
!!!    hidden()
    !!!hidden()
    nothidden()
```

```rust,noplayground
let mut name = String::new();
std::io::stdin().read_line(&mut name).expect("failed to read line");
println!("Hello {}!", name);
```

```rust,ignore
# This example won't be tested.
panic!("oops!");
```

{{#include file.rs:2}}
{{#include file.rs::10}}
{{#include file.rs:2:}}
{{#include file.rs:2:10}}

Here is a component:
```rust,no_run,noplayground
{{#include file.rs:component}}
```

Here is a system:
```rust,no_run,noplayground
{{#include file.rs:system}}
```

This is the full file.
```rust,no_run,noplayground
{{#include file.rs:all}}
```

To call the `add_one` function, we pass it an `i32` and bind the returned value to `x`:

```rust
{{#rustdoc_include file.rs:2}}
```

To call the `add_one` function, we pass it an `i32` and bind the returned value to `x`:

```rust
# fn main() {
    let x = add_one(2);
#     assert_eq!(x, 3);
# }
#
# fn add_one(num: i32) -> i32 {
#     num + 1
# }
```

{{#playground file.rs}}

<img src="./images/test.png" alt="Test Image">

> **注意:** This is a note.

