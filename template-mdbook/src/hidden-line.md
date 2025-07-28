# Hidden Line

The mdBook syntax
```
# fn main() {
    let x = 5;
    let y = 6;

    println!("{}", x + y);
# }
```

It will render as
```rust
# fn main() {
    let x = 5;
    let y = 6;

    println!("{}", x + y);
# }
```

```python
~hidden()
nothidden():
~    hidden()
    ~hidden()
    nothidden()
```

```python,hidelines=!!!
!!!hidden()
nothidden():
!!!    hidden()
    !!!hidden()
    nothidden()
```
