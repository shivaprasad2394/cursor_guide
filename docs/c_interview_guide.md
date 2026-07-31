# Comprehensive C Programming Study Guide
### Built for Systems / Embedded / Low-Level Interviews

> this is **pure C**.

---

## Table of Contents

1. [C at a Glance — What & Why](#1-c-at-a-glance)
2. [The Compilation Pipeline (Preprocess → Compile → Assemble → Link → Load)](#2-the-compilation-pipeline)
3. [The Preprocessor & Macros](#3-the-preprocessor--macros)
4. [Inline Functions](#4-inline-functions)
5. [Keywords, Identifiers, Declaration vs Definition](#5-keywords-identifiers-declaration-vs-definition)
6. [Data Types & Memory Representation](#6-data-types--memory-representation)
7. [Type Qualifiers — `const` and `volatile`](#7-type-qualifiers--const-and-volatile)
8. [Storage Classes & The Process Memory Layout](#8-storage-classes--the-process-memory-layout)
9. [`typedef` vs `#define`](#9-typedef-vs-define)
10. [`enum` — Named Integer Constants](#10-enum)
11. [Operators — Pre/Post Increment, Sequence Points](#11-operators--prepost-increment)
12. [Pointers — From Fundamentals to Advanced](#12-pointers)
13. [Arrays vs Pointers (incl. `char*` vs `char[]`)](#13-arrays-vs-pointers)
14. [Function Pointers (incl. typedef-based "C polymorphism")](#14-function-pointers)
15. [Dynamic Memory — `malloc` / `calloc` / `realloc` / `free`](#15-dynamic-memory)
16. [Allocating 2-D Arrays Dynamically — Five Idioms](#16-allocating-2d-arrays-dynamically)
17. [Memory Manipulation — `memcpy`, `memmove`, `memset`](#17-memory-manipulation)
18. [Structures, Unions, Padding & Alignment](#18-structures-unions-padding--alignment)
19. [Bit Manipulation](#19-bit-manipulation)
20. [Endianness](#20-endianness)
21. [Memory-Mapped I/O](#21-memory-mapped-io)
22. [Strings — Reverse, Pattern Search, Word Reverse](#22-strings)
23. [Undefined Behavior — The Pitfalls](#23-undefined-behavior)
24. [Sharp Insights for Systems Interviews](#24-sharp-insights)
25. [Quick-Revision Tables](#25-quick-revision-tables)
26. [Most-Asked Interview Questions — Curated](#26-curated-interview-questions)

---

## 1. C at a Glance

**What it is.** C is a *mid-level, statically-typed, compiled* language that sits between assembly and high-level languages. You write portable source code that a **compiler** translates to machine instructions specific to a target ISA.

**Why "mid-level"?**
- Direct memory access via pointers → suitable for **system programming** (kernels, drivers, embedded firmware).
- Structured control flow, functions, types → suitable for **application programming**.
- It bridges the abstraction gap between hardware (assembly) and high-level languages.

**Why it's fast.**
- Compiles directly to machine code; no VM or interpreter.
- Macros and `inline` allow zero-overhead abstractions.
- Manual memory management means no GC pauses.
- Predictable, transparent cost model: what you write is roughly what you get.

**The canonical compile command:**
```bash
gcc -Wall filename.c -o filename
```
- `-Wall` enables most warnings (always use it).
- `-o filename` sets the output binary name (default is `a.out`).

> **Insight.** C's "hidden cost" is zero only because *you* pay it explicitly with memory management, bounds-checking, and concurrency. A C interview is largely about whether you understand what the compiler is *not* doing for you.

---

## 2. The Compilation Pipeline

A `.c` file goes through **five** stages before it runs:

```
.c  ──Preprocessor──▶ .i  ──Compiler──▶ .s  ──Assembler──▶ .o  ──Linker──▶ executable  ──Loader──▶ running process
```

### 2.1 Preprocessing (`.c` → `.i`)
A textual transformation pass. The preprocessor:
- Strips comments.
- Expands `#include` directives by inlining file contents.
- Expands `#define` macros.
- Evaluates conditional compilation (`#if`, `#ifdef`, `#ifndef`, `#endif`).

**`#include <foo.h>` vs `#include "foo.h"`**

| Form | Search order |
|---|---|
| `#include <foo.h>` | Only in **system include paths** (e.g. `/usr/include` on Linux, plus paths added with `-I`). |
| `#include "foo.h"` | First in the **directory of the including file** (project-local); then falls back to system paths. |

Inspect this stage with `gcc -E file.c`.

### 2.2 Compilation (`.i` → `.s`)
The frontend parses, type-checks, applies optimizations, and emits **assembly** (`.s`, human-readable mnemonics for the target ISA). Inspect with `gcc -S file.i` (or `gcc -S file.c`).

### 2.3 Assembly (`.s` → `.o`)
The assembler converts mnemonics into raw machine code, packaged in an **object file** (ELF on Linux, Mach-O on macOS, PE/COFF on Windows). At this point, references to *external* symbols like `printf` are **unresolved** placeholders.

Inspect with `objdump -d file.o`.

### 2.4 Linking (`.o` + libraries → executable)
The **linker** does three jobs:
1. **Symbol resolution** — matches every "use" of a symbol to its single "definition" (function calls to function bodies, extern variables to actual storage).
2. **Relocation** — patches addresses now that final memory layout is known.
3. **Startup code injection** — adds the C runtime stub (`_start`/`crt0`) that sets up `argc`/`argv`, calls `main()`, and on return passes the exit code to `_exit()`.

Two flavors:
- **Static linking** — library code is copied into the executable. Bigger binary, no runtime dependency.
- **Dynamic linking** — only references; the actual code lives in `.so`/`.dll` resolved at load time. Smaller binary, shared in RAM across processes, but breakable across distro upgrades.

### 2.5 Loading
The OS **loader** reads the executable from disk, maps the segments (text, data, bss) into the process's virtual address space, sets up the heap and an initial stack, then jumps to the entry point. From here the C runtime runs and calls `main()`.

### Common Mistakes
- "`printf` doesn't exist" at link time → forgot `-lm` for math, or library order is wrong (libraries go *after* objects on the gcc command line).
- "Multiple definition of `foo`" → a non-`static` function/global with the same name in two `.c` files; the linker sees both. Mark file-private symbols `static`.
- "Undefined reference" → forgot to compile/link a `.c` file, or a header was included but no implementation exists.

### Interview Q&A

**Q1.** Why are `printf` calls unresolved after the assembler stage?
**A.** The assembler only translates the source it sees; `printf` lives in `libc`. Resolving it is the **linker's** job, which matches the call site against the symbol exported by `libc.a`/`libc.so`.

**Q2.** What's the difference between a header file and a library?
**A.** A *header* declares an interface (function prototypes, types, macros) — used by the **compiler** for type-checking. A *library* contains the compiled implementation — used by the **linker** to resolve calls.

**Q3.** Why does `#include` work even though headers aren't required for compilation?
**A.** They aren't strictly required, but without prototypes the compiler can't type-check call sites — it would assume implicit `int` return and fail to flag mismatched arguments. Headers are a *convention* for sharing declarations.

**Q4.** What does `crt0` (or `_start`) do?
**A.** It is the actual entry point the OS jumps to. It initializes `.bss` to zero, copies `.data` initializers, sets up `argc`/`argv`/`envp`, calls global constructors (in C++), invokes `main`, and on return passes the result to `_exit`.

### Key Takeaway
> Five stages: **preprocess → compile → assemble → link → load**. The compiler produces *symbols*; the linker *binds* them. Most "weird" build errors are really errors at one specific stage — knowing which one tells you where to look.

---

## 3. The Preprocessor & Macros

A **macro** is a textual substitution rule applied *before* compilation. The compiler never sees the macro name — only the expanded text.

or

A **macro** is a name defined using a preprocessor directive (#define) that is replaced by its corresponding text during preprocessing, before compilation
```c
#define CUBE(b) b*b*b

printf("%d", CUBE(1+2));   // expands to: 1+2 * 1+2 * 1+2  →  1 + 2 + 2 + 2 + 2 = 9, NOT 27
```

The fix: parenthesize **every parameter** *and* the whole expression:
```c
#define CUBE(b) ((b)*(b)*(b))

printf("%d", CUBE(1+2));   // expands to ((1+2)*(1+2)*(1+2)) = 27 ✓
```

### Macro vs Function — The Real Comparison

| Aspect | Macro | Function |
|---|---|---|
| Type checking | None | Strict |
| Stage | Preprocessor (text) | Compiled |
| Side effects | Arguments may be evaluated **multiple times** | Evaluated once |
| Code size | Grows at every call site | Single definition |
| Speed | No call overhead | Call/return + stack frame |
| Debuggability | Hard (debugger sees expanded form) | Easy |
| Best for | Tiny snippets, conditional compilation, header guards | Anything non-trivial |

### The Multiple-Evaluation Trap
```c
#define MAX(a,b) ((a) > (b) ? (a) : (b))

int x = 3;
int m = MAX(x++, 5);   // x is incremented TWICE in the false branch in some expansions
```
Functions don't have this problem because arguments are evaluated exactly once before the call.

### Useful Preprocessor Idioms

**Header guard (most common):**
```c
#ifndef MY_HEADER_H
#define MY_HEADER_H
/* declarations */
#endif
```

**Stringification (`#`) and token-pasting (`##`):**
```c
#define LOG(var)  printf(#var " = %d\n", var)   // LOG(x) → printf("x" " = %d\n", x)
#define CAT(a,b)  a##b                          // CAT(foo, 42) → foo42
```

**Conditional compilation:**
```c
#ifdef DEBUG
    #define DBG(x) printf x
#else
    #define DBG(x)
#endif
```

### Common Mistakes
- Forgetting parentheses around parameters (`CUBE` example above).
- Side-effecting arguments to a macro that uses them more than once.
- A macro that ends in `;` inside an `if/else` chain — wrap multi-statement macros with `do { ... } while (0)`:
```c
#define SWAP(a,b) do { int _t = (a); (a) = (b); (b) = _t; } while (0)
```

### Interview Q&A
**Q1.** Why prefer `inline` functions over function-like macros?
**A.** `inline` functions get **type checking**, evaluate arguments **once**, work with debuggers, and the compiler can still inline them. Macros are textual and unsafe.

**Q2.** What does `#pragma once` do, and how does it differ from include guards?
**A.** Both prevent multiple inclusion. `#pragma once` is non-standard but supported by all major compilers; it's faster (the compiler tracks the file inode, not text) but slightly less portable. Include guards are standard C and always work.

**Q3.** Can a macro recursively expand?
**A.** No. The preprocessor stops re-expanding a macro that appears in its own expansion (this prevents infinite loops).

### Key Takeaway
> Macros are *blind text substitution*. They're powerful but fragile. **Always parenthesize**. Prefer `static inline` or `enum`/`const` for value constants whenever possible.

---

## 4. Inline Functions

`inline` is a *hint* to the compiler to substitute the function body at the call site, avoiding call overhead.

or

An inline function is a function whose call may be expanded in-place by the compiler, eliminating function call overhead, though the compiler may choose not to inline it.
```c
#include <stdio.h>

static inline int square(int x) {
    return x * x;
}

int main(void) {
    printf("%d\n", square(5));   // compiler may emit: printf("%d\n", 5*5);
    return 0;
}
```

### Why `static inline`?

C99 has an unusual rule: an `inline` function definition does **not** by itself emit a callable symbol. If the compiler chooses not to inline a particular call (e.g., function pointer, debug build), the linker needs *some* definition to call — and a non-static `inline` function in a header doesn't provide one, leading to:
```
undefined reference to `foo'
```

**Two common fixes:**
1. `static inline` — gives every translation unit its own private copy. Simple, safe for header-only definitions.
2. `inline` in the header + a separate non-inline definition (`extern inline`) in exactly one `.c` file.

### Inline vs Macro

| | `inline` function | macro |
|---|---|---|
| Type-checked | ✓ | ✗ |
| Args evaluated once | ✓ | ✗ (textual) |
| Debuggable | ✓ | ✗ |
| Conditional compilation | Limited | Full |

### Common Mistakes
- Putting a non-`static`, non-`extern inline` function definition in a header → multiple-definition link errors (or undefined-reference if no call gets inlined).
- Assuming `inline` *forces* inlining. It doesn't. Use compiler-specific `__attribute__((always_inline))` (GCC/Clang) if you really mean it — but be aware that even that can be ignored (e.g., recursive functions, varargs).

### Interview Q&A
**Q1.** Is `inline` guaranteed to inline?
**A.** No — it's a hint. The compiler decides based on size, recursion, optimization level, etc.

**Q2.** When does inlining hurt performance?
**A.** When the function is large (causes I-cache pressure and code bloat) or called from many sites (binary size explosion). Modern compilers usually choose better than humans.

**Q3.** Where should `inline` definitions live?
**A.** In headers, marked `static inline`, so each translation unit has the body available for inlining.

### Key Takeaway
> `static inline` in a header is the safest default for small, frequently-called helpers. `inline` is a request, not a command.

---

## 5. Keywords, Identifiers, Declaration vs Definition

**Keywords** are reserved words known to the compiler — `int`, `if`, `return`, `static`, etc. You cannot use them as variable names.

**Identifiers** are names *you* give: variables, functions, structs, macros, labels.

### Declaration vs Definition — A Distinction Most Beginners Miss

| | Declaration | Definition |
|---|---|---|
| What it does | Tells the compiler a name's *type* exists | Allocates storage / provides a body |
| Allocates memory? | No | Yes (for variables) / yes (for functions) |
| How many times allowed? | Many (in different translation units) | Exactly **one** per program (One Definition Rule) |

```c
extern int counter;        // declaration  (promises 'counter' exists somewhere)
int counter = 0;           // definition   (allocates storage, optionally initializes)

void log_msg(const char*); // declaration (function prototype)
void log_msg(const char *m){ /* body */ } // definition
```

In most contexts the two collapse — `int x = 5;` is both a declaration *and* a definition. The split matters when you have multiple `.c` files sharing a global.

### `int main()` vs `int main(void)`

In C, the difference is real:

```c
void fun()      { }   // empty parameter list = "I'm not telling you what I take"
void fun(void)  { }   // explicit: "I take ZERO arguments"
```

```c
fun(10, "GfG", "GQ");  // legal in C if fun() declared, ill-formed if fun(void)
```

Best practice: **always write `int main(void)`** (or `int main(int argc, char *argv[])`). Empty parens are a pre-ANSI relic.

In C++ both forms mean the same thing — empty parens already imply zero arguments.

### Key Takeaway
> Use `void` to mean "no arguments". Use `static` to scope a global to its file. Declaration tells the compiler about a name; definition produces the actual symbol.

---

## 6. Data Types & Memory Representation

### Primitive Sizes (typical, but **not** guaranteed by the standard)

| Type | Typical size (LP64) | Min guaranteed by standard |
|---|---|---|
| `char` | 1 byte | 1 byte (1 byte ≥ 8 bits) |
| `short` | 2 bytes | ≥ 2 bytes |
| `int` | 4 bytes | ≥ 2 bytes |
| `long` | 8 bytes (Linux) / 4 bytes (Windows) | ≥ 4 bytes |
| `long long` | 8 bytes | ≥ 8 bytes |
| `float` | 4 bytes (IEEE 754 single) | implementation-defined |
| `double` | 8 bytes (IEEE 754 double) | implementation-defined |
| pointer | 4 bytes (32-bit) / 8 bytes (64-bit) | implementation-defined |

> **Insight.** `int` is **not** portable in size. If you need a known width, use `<stdint.h>` types: `int32_t`, `uint64_t`, `intptr_t`, etc.

### Signed vs Unsigned Integers

A signed `int` (typical 32-bit) reserves the **MSB as the sign bit** (two's complement on every modern machine), giving range `−2³¹` to `2³¹−1`. An unsigned `int` uses all 32 bits for magnitude → `0` to `2³²−1`.

```c
int      a = -1;
unsigned u =  1;
if (a < u) puts("less");      // surprisingly: prints nothing
```
Why? In a mixed signed/unsigned comparison, the signed value is promoted to **unsigned**, so `-1` becomes `0xFFFFFFFF`, which is much larger than `1`. **Classic UB-adjacent gotcha.**

### Format Specifiers (printf/scanf)

| Specifier | Type |
|---|---|
| `%c` | `char` |
| `%d` / `%i` | `int` |
| `%u` | `unsigned int` |
| `%ld` / `%lu` | `long` / `unsigned long` |
| `%lld` / `%llu` | `long long` / `unsigned long long` |
| `%f` | `float` (printf promotes to `double`) — for `scanf` use `%f` for float, `%lf` for double |
| `%lf` | `double` |
| `%x` / `%X` | hex (lowercase / uppercase) |
| `%o` | octal |
| `%p` | pointer (cast to `void*`) |
| `%s` | null-terminated string |
| `%zu` | `size_t` |

### Common Mistakes
- Using `%d` for a `size_t` or `unsigned long` → undefined behavior (`%zu` and `%lu`).
- Mixing signed and unsigned in arithmetic / comparisons.
- Assuming `sizeof(int) == 4` always — true on most desktops, but check.

### Interview Q&A
**Q1.** What is integer promotion?
**A.** In any arithmetic expression, types narrower than `int` (e.g., `char`, `short`) are promoted to `int` (or `unsigned int` if needed) before the operation. So `char a=200; char b=200; int c = a+b;` works correctly because the addition happens in `int`.

**Q2.** Why does `unsigned int x = 0; x--;` not crash?
**A.** Unsigned arithmetic is defined to wrap modulo 2ⁿ. So `x` becomes `UINT_MAX`. *Signed* overflow, by contrast, is undefined behavior.

**Q3.** Sizes of `int` and `long` on a 64-bit Linux vs 64-bit Windows?
**A.** Linux uses **LP64**: `int=4`, `long=8`, `pointer=8`. Windows uses **LLP64**: `int=4`, `long=4`, `long long=8`, `pointer=8`.

### Key Takeaway
> When portability matters, reach for `<stdint.h>`. Watch the signed/unsigned boundary like a hawk in comparisons.

---

## 7. Type Qualifiers — `const` and `volatile`

### `const` — Compiler-Enforced Read-Only

`const` says "the program will not modify this object". The compiler enforces this and may also use it for optimization.

The trick is reading multi-`const` declarations **right-to-left**:

| Declaration | Meaning |
|---|---|
| `const int a` | `a` is a constant int |
| `int const a` | identical — `a` is a constant int |
| `const int *p` | `p` points to a const int → **value is const, pointer can move** |
| `int * const p` | `p` is a const pointer to int → **pointer is const, value can change** |
| `const int * const p` | both pointer and pointee are const |

```c
const int *p;        int *const q;     const int *const r;
p = &x;   ✓           q = &x;  ✗ (init only)   r = &x;  ✗
*p = 5;   ✗           *q = 5;  ✓                 *r = 5;  ✗
```

> **Const-correctness mantra:** read pointer declarations from the *variable name leftward*: "`p` is a … pointer to … const int".

### `volatile` — Disables Optimization

`volatile` tells the compiler: *"this object can change in ways you cannot predict — never cache it in a register, always re-read it from memory, never optimize away accesses."*

Without `volatile`, the compiler may hoist a load out of a loop:

```c
int Flag = 1;            // not volatile
while (!Flag) { /* ... */ }   // compiler may load Flag once and loop forever
```

With `volatile`, every access *must* go to memory:

```c
volatile int Flag = 1;
ISR(void) { Flag = 0; }     // updated by interrupt

int main(void) {
    while (!Flag) {          // compiler re-reads Flag every iteration
        /* do work */
    }
    return 0;
}
```

### When to use `volatile`
- **Memory-mapped I/O registers** (the hardware updates them).
- **Variables modified by signal handlers / ISRs.**
- **Variables shared across threads** *for crude visibility* — though for proper threading you need `_Atomic` (C11) or pthread mutexes; `volatile` alone does **not** provide atomicity or memory barriers.

### `const` and `volatile` Together — Yes, Both!

A read-only hardware status register: it **never changes from the program's side** (`const`) but **the hardware can update it any time** (`volatile`).

```c
// Address 0x00020000 is a hardware status register
#define STATUS_REG 0x00020000

const volatile uint32_t *status = (const volatile uint32_t *)STATUS_REG;

uint32_t s = *status;   // re-read every time, but program can't write to it
```

For a writable port that the program controls but lives at a fixed address:
```c
volatile uint32_t * const port_reg = (volatile uint32_t *)0x40000000;
//   ^^^^^^^^         ^^^^^         hw can change it,         we never reassign the pointer

*port_reg = 0xDEADBEEF;   // legal — write-through
```

### Common Mistakes
- Using `volatile` for thread synchronization — it provides **neither atomicity nor memory ordering**. Use `<stdatomic.h>` or mutexes.
- Misreading `const int *p` as "`p` is constant" (it isn't — *what it points to* is).
- Casting away `const` and writing to a string literal → undefined behavior, often a segfault, because string literals live in read-only `.rodata`.

### Interview Q&A
**Q1.** Difference between `const` and `volatile`?
**A.** `const` → compiler-enforced "read-only" promise. `volatile` → "do not optimize accesses; the value can change underneath you".

**Q2.** Can a variable be both `const` and `volatile`?
**A.** Yes — e.g. a hardware status register the program reads but never writes; `volatile` because the hardware updates it, `const` because the code shouldn't.

**Q3.** Will `volatile` make a variable thread-safe?
**A.** No. It prevents the compiler from caching, but it does not guarantee atomicity, ordering, or cross-CPU visibility. Use atomics or locks.

**Q4.** What happens if I cast away `const` and modify the object?
**A.** If the object was originally declared `const`, behavior is **undefined**. If it was a non-const object only viewed through a `const` pointer, the modification is legal (though dirty practice).

### Key Takeaway
> `const` is *promise to the compiler*. `volatile` is *promise from the compiler*. They solve different problems and frequently combine.

---

## 8. Storage Classes & The Process Memory Layout

A **storage class** specifier qualifies a declaration with four pieces of information:

1. **Lifetime** (extent) — when storage exists.
2. **Scope** (visibility) — where the name is visible.
3. **Linkage** — whether the name refers to the same object across translation units.
4. **Default initial value**.

### The Four Storage Classes

| Class | Lifetime | Scope | Linkage | Default value | Memory region |
|---|---|---|---|---|---|
| `auto` | Function call | Block | None | **Garbage** | Stack |
| `register` | Function call | Block | None | Garbage | CPU register (hint) |
| `static` (local) | Whole program | Block | None | **Zero-initialized** | `.data` (init'd) / `.bss` (uninit) |
| `static` (file scope) | Whole program | File | **Internal** | Zero | `.data` / `.bss` |
| `extern` | Whole program | File | **External** | Zero | `.data` / `.bss` |

#### `auto` — The Implicit Default
Local variables are `auto` by default. Stored on the **stack**, exists only during the function call, **uninitialized** (contains garbage). The keyword is essentially never written.

#### `register` — A Hint Only
Suggests the compiler keep this variable in a CPU register. You **cannot take its address** (`&x` is illegal). Modern compilers ignore the hint and do their own register allocation; `register` is largely vestigial.

#### `static` — Two Different Meanings
1. **Inside a function:** the variable persists across calls (lifetime = whole program), but the **name** is still local to the function.
   ```c
   void counter(void) {
       static int n = 0;    // initialized ONCE before main(), not on every call
       n++;
       printf("%d\n", n);
   }
   ```
 The "initialization" you write is performed by the C runtime *before* `main()` runs — it's not an instruction inside the function. By the time `counter()` is first called, `n` already equals `0`.

2. **At file scope (global):** restricts linkage to **internal** — the symbol is invisible to other `.c` files. This is C's namespace-like mechanism.
   ```c
   static int helper_flag;        // not visible outside this .c file
   static void internal_fn(void); // same — file-private function
   ```

#### `extern` — "Defined Elsewhere"
A *declaration* without a definition. Tells the compiler the symbol exists somewhere; the linker will find it.

```c
// file1.c
int shared = 42;          // definition, allocates storage

// file2.c
extern int shared;        // declaration, no storage allocated
void use(void) { shared++; }
```
For functions, the `extern` keyword is the implicit default — bare prototypes are already extern.

### The Process Memory Layout

A typical Linux/Unix process map (high → low addresses):

```
┌──────────────────────────┐  high address
│         Stack            │  grows downward — local vars, function call frames
│           ↓              │
├──────────────────────────┤
│            ↕             │  unmapped gap (~ many GB on 64-bit)
├──────────────────────────┤
│           ↑              │
│         Heap             │  grows upward — malloc/calloc/realloc allocations
├──────────────────────────┤
│  .bss (uninit. globals)  │  zero-filled by loader; e.g. `static int x;`
├──────────────────────────┤
│ .data (init. globals)    │  e.g. `static int x = 42;`
├──────────────────────────┤
│ .rodata (read-only data) │  string literals, `const` globals
├──────────────────────────┤
│ .text  (code)            │  the compiled program instructions
└──────────────────────────┘  low address
```

#### Where Does Each Variable Live?

| Declaration | Region |
|---|---|
| `int x;` inside `main()` | Stack |
| `static int x;` inside `main()` | `.bss` (uninit) |
| `static int x = 5;` inside `main()` | `.data` |
| `int x;` at file scope | `.bss` |
| `int x = 5;` at file scope | `.data` |
| `const int x = 5;` at file scope | `.rodata` |
| `char *s = "hello";` | `s` on stack, `"hello"` in `.rodata` |
| `char s[] = "hello";` | `s` is an array on the stack, modifiable |
| `malloc(...)` | Heap |
| function bodies | `.text` |

### Worked Example — What Does This Print?

```c
#include <stdio.h>
static int animals = 8;
const  int i = 5;

static int call_me(void) {
    printf("%d %d", i, animals);
}

int main(void) {
    int animals = 2;     // shadows the file-scope 'animals'
    call_me();
    printf("%d", animals);
    return 0;
}
```
**Output:** `5 82`

Why?
- Inside `call_me()`, `animals` resolves to the file-scope `static` (which is `8`) — there is no local shadow there.
- `printf("%d %d", i, animals);` prints `5 8`, with no trailing newline.
- Back in `main()`, the local `animals` (= `2`) is printed → final output: `5 82`.

### Common Mistakes
- Returning a pointer to a stack variable from a function → **dangling pointer**, undefined behavior.
  ```c
  int *bad(void) { int x = 5; return &x; }   // x dies on return — NEVER do this
  ```
- Modifying a string literal: `char *s = "hi"; s[0] = 'H';` → UB, segfault on most systems.
- Forgetting that `static` initializers run *once before main*, not on each function entry.

### Interview Q&A
**Q1.** Where does a `static` local variable live?
**A.** In `.data` (if initialized non-zero) or `.bss` (if uninitialized or zero-initialized). Its **scope** is still the enclosing block, but its **lifetime** is the whole program.

**Q2.** What's the purpose of `static` at file scope?
**A.** To give the symbol **internal linkage** — invisible to other translation units. Used to hide implementation helpers and avoid name collisions.

**Q3.** Difference between heap and stack?
**A.** Stack: managed by the compiler via push/pop, fast (one instruction to allocate), LIFO, fixed small size, automatic deallocation. Heap: managed by the program via `malloc`/`free`, slower (bookkeeping for free lists), larger, manual deallocation, and the source of leaks/fragmentation.

**Q4.** Why is the stack faster than the heap?
**A.** Stack allocation is just `sub rsp, N` — one instruction. There's no bookkeeping (no free lists), and freshly-pushed memory is almost always already in L1 cache (great cache locality). Heap allocation requires walking free lists, possibly system calls (`brk`/`mmap`), and the returned memory may be cold.

**Q5.** What does `extern` actually do?
**A.** It declares a name as having **external linkage** without providing a definition — the linker is told "this symbol lives in another translation unit, please resolve it".

### Key Takeaway
> Memorize the table: `auto`, `register`, `static`, `extern` × {lifetime, scope, linkage, default value}. Memorize the segment layout. Almost every "where does this variable go?" interview question reduces to these two tables.

---

## 9. `typedef` vs `#define`

`typedef` introduces a **type alias** at the language level. `#define` is **textual substitution** at the preprocessor level. They look similar but behave very differently with pointers.

```c
typedef char* ptr;
#define PTR  char*

ptr  a, b, c;     // a, b, c are ALL char*  (size 8 each on x86-64)
PTR  x, y, z;     // expands to: char* x, y, z;
                  // x is char*, but y and z are plain char (size 1)!
```

`typedef`'s alias is *atomic*; the compiler treats `ptr` as a single type token. `#define` is dumb text replacement, so the `*` only binds to the first identifier.

### Why `typedef`?
- **Readability:** `typedef int (*signal_handler_t)(int);` beats raw function-pointer syntax.
- **Portability:** `typedef unsigned long u64;` lets you switch the underlying type in one place.
- **Type-safety:** Used with structs to drop the `struct` keyword:
  ```c
  typedef struct Point { int x, y; } Point;
  Point p;     // instead of: struct Point p;
  ```

### Common Mistakes
- Using `#define` for types — works for simple aliases but breaks for pointers / function pointers.
- Forgetting that `typedef`'d aliases hide the underlying type, sometimes too well — `size_t` vs `int` confusion in printf format specifiers.

### Key Takeaway
> Use `typedef` for types. Use `#define` for constants (or better, `enum` / `static const`). Mixing them up creates subtle bugs that compile cleanly.

---

## 10. `enum`

`enum` defines a **named set of integer constants**.

```c
enum Color { RED, GREEN, BLUE };           // RED=0, GREEN=1, BLUE=2 (auto)
enum Status { OK = 0, FAIL = -1, BUSY = 1 };
```

### Why use enums?
- **Readability** — `state == OK` reads better than `state == 0`.
- **Debuggability** — debuggers print symbolic names rather than magic numbers.
- **Compiler-checkable values** — many compilers warn on missing cases in `switch` over an enum.
- Better than `#define` because enum constants are visible to the debugger and respect scope.

### Quirks
- Underlying type is `int` in standard C (C++23 allows fixed underlying types).
- Enum *values* live at file scope — they pollute the namespace if not careful.

```c
switch (state) {
    case OK:   /* ... */  break;
    case FAIL: /* ... */  break;
    case BUSY: /* ... */  break;
    // GCC -Wswitch warns if any enum constant is missing
}
```

### Key Takeaway
> Prefer `enum` over `#define` for sets of related integer constants — you get type-checking and debugger-friendly names.

---

## 11. Operators — Pre/Post Increment

```c
int b = 10;
int a = b++;     // POST: a gets old b (10), then b becomes 11
                 // result: a == 10, b == 11
```

```c
int b = 10;
int a = ++b;     // PRE: b first becomes 11, then a gets new b
                 // result: a == 11, b == 11
```

### The Operand Rules
The operand of `++`/`--` must be a **modifiable lvalue** (something with an address you can write to).

```c
5++;          // ✗ illegal — 5 is not an lvalue
a++;          // ✓
(a + b)++;    // ✗ illegal — (a+b) is an rvalue
a + b++;      // ✓ — only b is incremented
```

### Sequence Points & Undefined Behavior
The classic UB landmine:

```c
int i = 0;
i = i++ + ++i;     // UNDEFINED — i is modified more than once between sequence points
printf("%d %d", i++, i++);   // UNDEFINED — order of arg evaluation is unspecified
arr[i] = i++;      // UNDEFINED
```

C17 introduced more precise wording ("sequenced before"), but the practical rule is unchanged: **never modify the same object twice in one expression** unless the standard explicitly defines an ordering (e.g., `&&`, `||`, `?:`, `,`).

### Interview Q&A
**Q1.** What does `a = b++` do exactly?
**A.** Evaluates `b`, **assigns its current value** to `a`, then increments `b`. The result of `b++` *as a sub-expression* is the **old** value.

**Q2.** Is `i = i++;` defined?
**A.** **No.** The same object `i` is being modified twice without a sequence point between the modifications. UB.

**Q3.** Difference between `i++` and `++i` in a `for` loop?
**A.** *Semantically* none — the result is discarded either way. *Historically* `++i` was sometimes faster for non-trivial types (C++ iterators), but for `int`s any modern compiler emits identical code.

### Key Takeaway
> Pre = "increment first". Post = "use old, then increment". Never modify the same variable more than once in a single expression.

---

## 12. Pointers

A **pointer** is a variable whose value is an address. Its *type* tells the compiler how many bytes to read/write when dereferencing and how pointer arithmetic should scale.

```c
int  x = 42;
int *p = &x;        // p holds the address of x
int  y = *p;        // y = 42 — dereference

p++;                // moves p forward by sizeof(int) bytes — NOT 1 byte
```

### Pointer Sizes
- On a 64-bit system, every pointer is **8 bytes**, regardless of what it points to.
- On a 32-bit system, every pointer is **4 bytes**.
- A `char *`, `int *`, `void *`, and function pointer all have the same size on a given platform — what differs is the *type* (and hence dereference / arithmetic semantics).

### The Five Pointer Pathologies

| Pathology | Definition | Example |
|---|---|---|
| **NULL pointer** | A pointer with the well-defined value 0 / `NULL`. Dereferencing it is UB (almost always a segfault). | `int *p = NULL; *p = 5;` |
| **Wild pointer** | A pointer that has never been initialized; contains garbage. | `int *p; *p = 5;` |
| **Dangling pointer** | Points to memory that has been freed or gone out of scope. | `free(p); *p = 5;` |
| **Void pointer** | Generic pointer with no associated type. Cannot be dereferenced without a cast. | `void *p; *(int*)p` |
| **Function pointer** | Holds the address of executable code, not data. | `int (*fp)(int);` |

#### Void Pointer — The Generic
A `void *` can hold the address of an object of any type. You cannot dereference it directly; you must cast to a real pointer type first. This is why `malloc` returns `void *` — you cast it (in C this is implicit and not even necessary; in C++ it's required).

```c
void *raw = malloc(sizeof(int));
int  *p   = (int *)raw;          // cast before use
*p = 100;
```

#### Dangling Pointer — Common Causes
```c
// 1. Returning the address of a local variable
int *bad(void) { int x = 5; return &x; }   // x dies on return

// 2. Use-after-free
char *p = malloc(10);
free(p);
strcpy(p, "oops");                          // p still holds the old address — UB

// 3. Local goes out of scope
int *p;
{ int t = 10; p = &t; }                     // t's lifetime ends at }
*p;                                         // UB
```
**Defense:** set pointers to `NULL` after `free()`, and never return addresses of locals.

### Pointer Arithmetic Scales by Type Size
```c
int arr[5] = {10, 20, 30, 40, 50};
int *p = arr;            // p == &arr[0]
*(p + 2);                // 30 — moved 2 * sizeof(int) = 8 bytes forward
```

`p + n` is equivalent to `&p[n]`. `*(p + n)` is equivalent to `p[n]`. In fact `arr[i]` is *literally* defined as `*(arr + i)` — and because `+` is commutative, `i[arr]` is also legal C (don't write this).

### Pointer to Pointer (`**`)
A pointer that holds the address of another pointer. Used for:
- Modifying a pointer through a function (out-parameters):
  ```c
  void allocate(int **out) { *out = malloc(sizeof(int)); }
  int *p = NULL;
  allocate(&p);   // now p points to fresh heap memory
  ```
- 2-D arrays via array of pointers (`int **grid`).
- `argv` itself is a `char **`.

### Pointer to Array — A Frequently-Confused Beast

```c
int (*p)[10];      //  p is a POINTER TO an array of 10 ints  → sizeof(*p) == 40
int *p[10];        //  p is an ARRAY of 10 pointers to int    → sizeof(p)  == 80
```

Reading the cdecl algorithm: start at the variable name, follow C's operator precedence. Parentheses force "pointer to" to bind first.

```c
int data[4][3] = { {23,55,50}, {45,38,55}, {70,43,45}, {34,46,60} };

int (*ptr)[3] = data;              // ptr points to the first row
ptr[i][j];      // ≡ *(*(ptr + i) + j)
ptr++;          // moves forward by sizeof(int[3]) = 12 bytes — to next row
```

Why does `int *ptr = data;` fail? Because `data` decays to `int (*)[3]` (pointer-to-array-of-3-ints), not `int *`.

### Key Takeaway
> A pointer is *(address, type)*. The address tells where; the type tells how to interpret and how arithmetic scales. Master decay rules and you've mastered 80% of C pointer interview questions.

---

## 13. Arrays vs Pointers

Arrays and pointers are **related** but **not the same**.

### Array Decay Rule
In *most* contexts, an array name decays into a pointer to its first element. **Exceptions:** as the operand of `sizeof`, `&`, or as a string literal initializer for a `char[]`.

```c
int a[10];
int *p = a;            // a decays to &a[0]
sizeof(a);             // 40 — array does NOT decay here
sizeof(p);             // 8  — sizeof a pointer
&a;                    // type: int (*)[10] — pointer to whole array
```

### `char *p = "hello"` vs `char q[] = "hello"`

This is *the* most-asked C interview question.

```c
char *p = "hello";        // p is a pointer to a string LITERAL in .rodata
char  q[] = "hello";      // q is an ARRAY on the STACK, initialized from the literal

p[0] = 'H';               // UB — writing to read-only memory (often segfaults)
q[0] = 'H';               // ✓ legal — q is your own modifiable copy

sizeof(p);                // 8 — pointer size on x86-64
sizeof(q);                // 6 — 5 chars + '\0', the actual array size

strlen(p);                // 5
strlen(q);                // 5
```

Why? Inspect the compiled assembly:

```text
char *s = "abc";          # → store address of .rodata literal
char  s[] = "abc";        # → copy the bytes 'a','b','c','\0' onto the stack
```

| Aspect | `char *p = "..."` | `char q[] = "..."` |
|---|---|---|
| What is stored | Address of literal | Bytes of literal (copied) |
| Where lives | Literal in `.rodata`; `p` itself on stack | The bytes are on the stack |
| Modifiable? | **No** — UB | **Yes** |
| `sizeof` | sizeof a pointer (4 or 8) | length of array including `\0` |
| Lifetime | Literal: program lifetime | Array: function call |

### Array Cannot Be Reassigned
```c
int a[5];
int b[5];
// a = b;        ✗ — array names are not lvalues
memcpy(a, b, sizeof(a));   // ✓ — copy element-by-element
```

But pointers can:
```c
int *p, *q;
p = q;           // ✓ — pointer assignment
```

### Common Mistakes
- `sizeof(arr)` inside a function where `arr` is a parameter — gives pointer size, not array size, because parameters decay. Always pass length explicitly.
- Modifying string literals.
- Confusing `char *names[]` (array of pointers) with `char (*names)[N]` (pointer to array).

### Interview Q&A
**Q1.** Are arrays and pointers the same in C?
**A.** No. An array name *decays* to a pointer to its first element in most expressions, but `sizeof` and `&` see the array type. The array itself is a contiguous block; the pointer is just an address.

**Q2.** What does `sizeof` return for an array parameter?
**A.** Size of a pointer, not the array. C function parameters of array type are silently rewritten as pointers (`void f(int a[10])` ≡ `void f(int *a)`).

**Q3.** Why does `char *s = "hello"; s[0]='H';` segfault?
**A.** String literals live in read-only memory (`.rodata`). Writing through `s` violates page protection. Use `char s[] = "hello"` for a modifiable copy.

### Key Takeaway
> Arrays decay; pointers don't. Literals are read-only. `sizeof` lies inside functions when applied to "array" parameters.

---

## 14. Function Pointers

A **function pointer** holds the address of executable code. You can call functions through it, store callbacks in it, and build dispatch tables ("vtables") with it.

### Declaration Syntax — The Cdecl Trick
```c
int  (*fp)(int, int);    // fp is a pointer to a function taking (int,int) returning int
int   *fp(int, int);     // fp is a function taking (int,int) returning int*  (totally different!)
int *(*fp)(int, int, int);  // pointer to function (int,int,int) returning int*
```
The parentheses around `*fp` are mandatory; without them it parses as a function returning a pointer.

### Assigning and Calling
```c
int Add(int a, int b)      { return a + b; }
int Multiply(int a, int b) { return a * b; }

int (*op)(int, int);

op = Add;                  // function name decays to its address; & is optional
op = &Add;                 // equivalent
int r1 = op(2, 3);         // 5  — call via pointer
int r2 = (*op)(2, 3);      // 5  — explicit dereference, same effect
```

### Callbacks — Passing Behavior as a Parameter
```c
#include <stdio.h>

int Add(int a, int b)      { return a + b; }
int Multiply(int a, int b) { return a * b; }

void Do_operation(int (*op)(int, int), int x, int y) {
    int result = op(x, y);
    printf("result = %d\n", result);
}

int main(void) {
    Do_operation(Add, 2, 3);        // 5
    Do_operation(Multiply, 2, 3);   // 6
    return 0;
}
```

This is C's mechanism for higher-order functions — callbacks (`qsort`'s comparator), event handlers, plugin systems, state machines.

### `typedef` Makes It Readable
```c
typedef int (*BinOp)(int, int);

BinOp op = Add;
op(3, 4);
```

### Function Pointers in Structs — "Polymorphism" in C
This is how C achieves OO-style dispatch — used pervasively in the Linux kernel (`struct file_operations`).

```c
#include <stdio.h>

typedef struct sCommClass {
    int (*open)(struct sCommClass *self, char *fspec);
} tCommClass;

// "Subclass" 1
static int tcpOpen(tCommClass *tcp, char *fspec) {
    printf("Opening TCP: %s\n", fspec);
    return 0;
}
static void tcpInit(tCommClass *tcp) { tcp->open = &tcpOpen; }

// "Subclass" 2
static int httpOpen(tCommClass *http, char *fspec) {
    printf("Opening HTTP: %s\n", fspec);
    return 0;
}
static void httpInit(tCommClass *http) { http->open = &httpOpen; }

int main(void) {
    tCommClass commTcp, commHttp;

    tcpInit(&commTcp);
    httpInit(&commHttp);

    // Same call site, different behavior — runtime polymorphism in pure C
    commTcp.open(&commTcp,  "bigiron.box.com:5000");
    commHttp.open(&commHttp,"http://www.microsoft.com");
    return 0;
}
```
**Output:**
```
Opening TCP: bigiron.box.com:5000
Opening HTTP: http://www.microsoft.com
```

### Common Mistakes
- Forgetting the parentheses: `int *fp(int)` is a *function* returning `int *`, not a pointer.
- Calling through a NULL function pointer → segfault.
- Mismatched calling conventions when the pointer comes from another language / library — corrupted stack.

### Interview Q&A
**Q1.** What's the difference between `void (*f)()` and `void *f()`?
**A.** First is a pointer to a function returning `void`. Second is a function returning `void *`.

**Q2.** Why is `&` optional when assigning a function to a pointer?
**A.** Function names, like array names, decay into pointers in most contexts. `op = Add;` and `op = &Add;` are both legal and equivalent.

**Q3.** Real-world uses of function pointers?
**A.** `qsort`/`bsearch` comparators, callbacks, state machines, dispatch tables, dynamic loading (`dlsym`), kernel device-driver `file_operations` structs.

### Key Takeaway
> Function pointers + structs = vtables. This is how the kernel and most large C codebases do polymorphism. The syntax is ugly; `typedef` makes it tolerable.

---

## 15. Dynamic Memory

C has no garbage collector. The four heap functions live in `<stdlib.h>`.

### `malloc` — Allocate Raw Bytes
```c
void *malloc(size_t size);
```
- Allocates `size` bytes on the heap.
- Returns a `void *` to the block, or `NULL` on failure.
- **Does not initialize** the memory — it contains garbage.

```c
int *p = malloc(100 * sizeof(int));   // 400 bytes (on 32-bit int)
if (!p) { perror("malloc"); exit(1); }   // ALWAYS check for NULL
p[0] = 42;
free(p);
p = NULL;                                 // defensive
```

> **Idiom:** `malloc(N * sizeof(*p))` — using `sizeof(*p)` instead of `sizeof(int)` means changing `p`'s type later doesn't break the allocation.

### `calloc` — Allocate and Zero
```c
void *calloc(size_t nmemb, size_t size);
```
- Allocates `nmemb * size` bytes.
- **Zero-initializes** every byte.
- Useful for arrays where 0 is a sensible default; counters, flags, sparse data.

```c
int *p = calloc(25, sizeof(int));   // 25 ints, all set to 0
```

`calloc` can be faster than `malloc + memset` because the OS often hands back zero-filled pages already.

### `realloc` — Resize an Existing Allocation
```c
void *realloc(void *ptr, size_t newSize);
```
- Resizes the block at `ptr` to `newSize` bytes.
- May move the block — **always reassign** the returned pointer.
- Existing data up to `min(old, new)` is preserved.
- On failure, returns `NULL` and the **original block remains valid** (don't lose the old pointer!).

```c
int *p   = malloc(10 * sizeof *p);
int *tmp = realloc(p, 20 * sizeof *p);
if (!tmp) { /* p is still valid */ free(p); return; }
p = tmp;
```

Special cases:
- `realloc(NULL, n)` ≡ `malloc(n)`.
- `realloc(p, 0)` is implementation-defined (don't rely on it; use `free`).

### `free` — Release Memory
```c
void free(void *ptr);
```
- Returns the block to the heap allocator.
- `free(NULL)` is a no-op (safe).
- Calling `free` twice on the same pointer (**double-free**) → UB, often heap corruption.
- Using a pointer **after** `free` (**use-after-free**) → UB, classic security bug.

### Memory Bug Catalog

| Bug | What happens | How to avoid |
|---|---|---|
| **Memory leak** | Allocated, lost the pointer, never freed | Pair every `malloc` with `free`; use Valgrind / ASan |
| **Double free** | Same pointer freed twice — corrupts free list | Set pointer to `NULL` after free |
| **Use-after-free** | Read/write through pointer to freed memory | Set pointer to `NULL` after free |
| **Buffer overflow** | Wrote past the end of allocation | Track sizes; use `snprintf`, `strncpy` carefully |
| **NULL deref** | Forgot to check `malloc` return | Always check `if (!p)` |
| **Mismatched alloc/free** | `malloc`+`delete`, `new`+`free`, `malloc`+`delete[]` | Match every allocation with the right release |
| **Heap fragmentation** | Long-running program, many small allocs of varying sizes | Use pools / arenas for hot paths |

### Cost Model
- Stack alloc: **~1 instruction** (`sub rsp, N`).
- `malloc`: **hundreds of cycles** (free-list walk; sometimes a `brk`/`mmap` syscall, which is thousands of cycles).
- `free`: similar cost; may consolidate adjacent free blocks.

### Interview Q&A
**Q1.** Difference between `malloc` and `calloc`?
**A.** `calloc(n,sz)` zero-initializes the result; `malloc(n*sz)` doesn't. `calloc` takes element count + element size; `malloc` takes total bytes.

**Q2.** What does `realloc` do if it can't grow in place?
**A.** Allocates a new block of the requested size, copies over the existing contents, frees the old block, and returns the new pointer (which differs from the old one). On failure, returns `NULL` and **leaves the original block intact**.

**Q3.** Why can `free` be called with `NULL`?
**A.** The standard requires `free(NULL)` to be a no-op. This eliminates a common cleanup-path branch.

**Q4.** What's the difference between heap and stack memory in C?
**A.** Stack: managed automatically, fast, small (typically 1–8 MB), LIFO. Heap: managed manually via `malloc`/`free`, larger but slower, prone to leaks and fragmentation.

**Q5.** Is `int arr[n]` (variable-length array) on the stack or heap?
**A.** Stack (in C99 VLAs). VLAs were made optional in C11. They're convenient but risky — large `n` blows the stack.

### Key Takeaway
> Every `malloc` deserves a `free`. Every `realloc` needs a temporary pointer to handle failure. NULL out pointers after freeing.

---

## 16. Allocating 2-D Arrays Dynamically

A genuine 2-D array (`int arr[R][C]`) is contiguous in memory and indexed via `arr[i][j] = *(arr + i*C + j)`. When `R` or `C` aren't known at compile time, you have **five idioms** to choose from — each with different memory layout, performance, and ease of use.

### Idiom 1 — Single Pointer (`int *`), Manual Index Math
**Most cache-friendly.** One contiguous block; no extra indirection. You compute the offset yourself.

```c
int r = 3, c = 4;
int *ptr = malloc(r * c * sizeof(int));
for (int i = 0; i < r * c; i++) ptr[i] = i + 1;

// access (i,j):
ptr[i * c + j];

free(ptr);
```
✓ One alloc, one free. ✓ Contiguous. ✗ Manual index arithmetic.

### Idiom 2 — Array of Pointers (`int *arr[R]`)
Each row independently allocated. Rows can have **different sizes** ("jagged array").

```c
int r = 3, c = 4;
int *arr[r];                              // VLA on the stack
for (int i = 0; i < r; i++)
    arr[i] = malloc(c * sizeof(int));

arr[i][j] = ++count;

for (int i = 0; i < r; i++) free(arr[i]); // r frees
```
✓ Natural `arr[i][j]` syntax. ✗ Rows scattered → cache-unfriendly. ✗ `r+1` allocations.

### Idiom 3 — Pointer to Pointer (`int **`)
The fully heap-allocated version of Idiom 2. Both the row-pointer table and the rows live on the heap.

```c
int **arr = malloc(r * sizeof(int *));     // table of r pointers
for (int i = 0; i < r; i++)
    arr[i] = malloc(c * sizeof(int));      // each row

arr[i][j] = ++count;

for (int i = 0; i < r; i++) free(arr[i]);  // free rows
free(arr);                                  // free table
```
✓ `arr[i][j]` works. ✗ `r+1` allocations, two indirections per access, scattered rows.

### Idiom 4 — Single `malloc`, Pointer-Table + Data Concatenated
**Best of both worlds:** one allocation, one free, contiguous data, but `arr[i][j]` syntax still works.

```c
size_t len = sizeof(int *) * r + sizeof(int) * c * r;
int **arr  = malloc(len);
int  *ptr  = (int *)(arr + r);             // data starts right after the pointer table
for (int i = 0; i < r; i++) arr[i] = ptr + c * i;

arr[i][j] = ++count;

free(arr);                                  // ONE free
```
✓ One alloc/free. ✓ Mostly contiguous data. ✗ Slightly tricky pointer arithmetic.

### Idiom 5 — Pointer to Array (`int (*ptr)[N]`) — Compile-Time C, Runtime R
When the column count is known at compile time, this is the cleanest:

```c
int r = 3;
int (*ptr)[3] = malloc(r * sizeof *ptr);   // r rows of int[3]

for (int i = 0; i < r; i++)
    for (int j = 0; j < 3; j++)
        ptr[i][j] = i*3 + j;

free(ptr);                                  // ONE free
```
For runtime-sized columns, C99 lets you use a VLA pointer:
```c
void process(int m, int n) {
    int (*ptr)[n] = malloc(m * n * sizeof(int));   // VLA-pointer
    /* ... */
    free(ptr);
}
```
✓ One alloc, contiguous, full `[i][j]` syntax. ✗ Requires column count at allocation time.

### Comparison Table

| Method | Allocations | Contiguous? | `arr[i][j]` works? | Cache-friendly | Best for |
|---|---|---|---|---|---|
| 1. Flat `int *` | 1 | ✓ | ✗ (use `arr[i*c+j]`) | ✓✓✓ | Numeric kernels, GPU-style code |
| 2. Array of `int *` | R+1 | ✗ | ✓ | ✗ | Jagged arrays |
| 3. `int **` | R+1 | ✗ | ✓ | ✗ | Quick prototyping |
| 4. Combined block | 1 | ✓ | ✓ | ✓✓ | General-purpose tables |
| 5. Pointer to array | 1 | ✓ | ✓ | ✓✓✓ | When column count is known |

### Key Takeaway
> Prefer **Idiom 1** or **Idiom 5** for performance. Use **Idiom 4** when you want contiguous + `arr[i][j]` ergonomics. Avoid **Idiom 3** in hot paths.

---

## 17. Memory Manipulation — `memcpy`, `memmove`, `memset`

| Function | Signature | Behavior |
|---|---|---|
| `memcpy` | `void *memcpy(void *dst, const void *src, size_t n)` | Copies `n` bytes. **UB if regions overlap.** |
| `memmove` | `void *memmove(void *dst, const void *src, size_t n)` | Copies `n` bytes. **Safe for overlapping regions.** |
| `memset` | `void *memset(void *s, int c, size_t n)` | Sets `n` bytes to `c` (interpreted as `unsigned char`). |

### Why Two Copy Functions?
`memcpy` is allowed to copy in any order — forward, backward, in chunks of 8 or 16 bytes, with SIMD. This makes it fast but **unsafe** when source and destination overlap. `memmove` checks for overlap and copies in the safe direction (front-to-back if `dst < src`, back-to-front otherwise).

```c
char str[7] = "abcdef";
memcpy(str + 6, str, 10);    // ⚠️ UB — regions overlap; result is garbage / corruption
memmove(str + 6, str, 10);   // ✓  safe — defined output
```

### `memset` Caveats
- The "fill value" is converted to `unsigned char`, so only the low 8 bits matter.
- `memset(arr, -1, n)` works to fill an `int` array with `0xFFFFFFFF` (all-ones) — but **only** because all ones in two's complement is `-1`.
- `memset(arr, 1, n)` does **not** fill an int array with `1`s; each byte becomes `0x01`, so each int becomes `0x01010101` = 16843009.

```c
int a[4];
memset(a, 0, sizeof a);    // ✓ all ints become 0
memset(a, -1, sizeof a);   // ✓ all ints become -1 (0xFFFFFFFF)
memset(a, 1, sizeof a);    // ✗ each int is 0x01010101, not 1
```

### Common Mistakes
- Using `memcpy` on overlapping regions.
- Wrong size argument: `memcpy(dst, src, sizeof(src))` where `src` is a pointer (gets pointer size, not the data size).
- Using `memset` to "zero out" floating-point arrays — works *because* IEEE 754 zero is all-bits-zero, but for any non-zero pattern it's wrong.

### Interview Q&A
**Q1.** When does `memcpy` produce wrong results?
**A.** When source and destination overlap. Use `memmove` instead.

**Q2.** Why is `memcpy` typically faster than `memmove`?
**A.** It can copy without checking overlap and use the most aggressive copy strategy (SIMD, large chunks, prefetching).

**Q3.** Will `memset(p, 0, sizeof(double[10]))` zero-initialize the array?
**A.** Yes — IEEE 754 `0.0` is encoded as all-bits-zero. But this is a portability footgun; better to use a loop or `{0}` initializer.

### Key Takeaway
> `memcpy` is fast but assumes no overlap. `memmove` handles overlap. `memset` works one byte at a time — fine for 0 and -1, dangerous for anything else.

---

## 18. Structures, Unions, Padding & Alignment

### Structures — Heterogeneous Aggregate
A `struct` is a user-defined type that groups variables of (possibly different) types under one name. Each member gets its own storage.

```c
struct Point { int x, y, z; };

struct Point p1 = {1, 2, 3};                  // positional init
struct Point p2 = {.y = 0, .z = 1, .x = 2};   // C99 designated initializers — order doesn't matter
```

**Designated initializers** make struct creation order-independent and self-documenting. The output of:
```c
struct Point p1 = {.y = 0, .z = 1, .x = 2};
printf("%d %d %d", p1.x, p1.y, p1.z);   // → "2 0 1"
```

#### Struct Assignment & Comparison
```c
struct Point a = {1,2,3}, b;
b = a;                  // ✓ legal — element-wise copy (memcpy semantics)
if (a == b) /* ... */   // ✗ illegal — no built-in equality
if (memcmp(&a, &b, sizeof a) == 0) /* careful: padding bytes may differ */
```
`memcmp` may give false negatives because padding bytes are uninitialized.

#### Strings Inside Structs Are Copied
```c
struct Test { char str[20]; };
struct Test st1, st2;
strcpy(st1.str, "GeeksQuiz");
st2 = st1;              // copies all 20 bytes including the string
st1.str[0] = 'S';       // modifies st1 only
puts(st2.str);          // "GeeksQuiz" — st2 is independent
```

### Unions — Shared Memory for Mutually Exclusive Members
A `union` allocates **one** chunk of memory the size of its largest member; all members share that same address. You set one at a time; reading a different member than was last written is implementation-defined ("type punning").

```c
union test {
    int  x;
    char arr[4];
    int  y;
};

union test t;
t.x = 0;            // writes 4 zero bytes
t.arr[1] = 'G';     // arr is now "\0G\0\0"
printf("%s", t.arr); // prints nothing — first byte is '\0', so strlen==0
```

#### Sizing Rule
```c
struct {
    short s[5];          // 5 * 2 = 10 bytes
    union {
        float y;         // 4 bytes
        long  z;         // 8 bytes  ← largest
    } u;                 // union takes 8 bytes
} t;
// total: 10 + 8 = 18 bytes (ignoring padding for this illustrative count)
```
*With* padding/alignment on a 64-bit system, this would round up to 24 bytes (long requires 8-byte alignment).

#### The Tagged Union (Discriminated Union) Pattern
The classic C trick for sum types / variant records:

```c
enum ConnType { NETWORK, USB, VIRTUAL };

struct Connection {
    enum ConnType type;          // the "tag" tells which variant is active
    union {
        struct Network network;
        struct USB     usb;
        struct Virtual virtual;
    } u;
};

void use(struct Connection *c) {
    switch (c->type) {
        case NETWORK: handle_net(&c->u.network); break;
        case USB:     handle_usb(&c->u.usb);     break;
        case VIRTUAL: handle_vir(&c->u.virtual); break;
    }
}
```
Used in compilers (AST nodes), parsers, message-passing systems.

### Struct Padding & Alignment

The compiler inserts **padding** between members so each member sits at an address that's a multiple of its **alignment requirement**. This trades a few wasted bytes for fast unaligned-load-free access.

#### Alignment Rules (typical)
- `char` → 1
- `short` → 2
- `int`, `float` → 4
- `double`, `long`, pointer (LP64) → 8

The struct's overall alignment = the **largest** alignment of any member. The struct's size is rounded up to a multiple of its alignment so that arrays of the struct still align each element correctly.

#### Worked Example
```c
struct A {
    char  c;    // offset 0, size 1
    // 3 bytes padding
    int   i;    // offset 4, size 4
    char  d;    // offset 8, size 1
    // 3 bytes padding (so next struct in array starts at multiple of 4)
};               // total size = 12, alignment = 4
```

Reorder for tightness:
```c
struct B {
    int  i;     // offset 0
    char c;     // offset 4
    char d;     // offset 5
    // 2 bytes padding
};               // total size = 8 (saved 4 bytes!)
```
**Rule of thumb:** order members from largest-aligned to smallest.

#### Forcing Packed Layout
```c
struct __attribute__((packed)) Wire {   // GCC/Clang
    char  c;
    int   i;
    char  d;
};                                       // size = 6, no padding — but unaligned access!
```
Useful for network packets and on-disk formats where byte-exact layout matters. **Cost:** unaligned loads on some architectures are slow or fault.

### Limitations
- Cannot initialize members at declaration (`struct site { char name[] = "x"; };` — illegal in C).
- Cannot have static members (C++ allows them in `struct`, never in `union`).
- Cannot compare structs with `==`.

### Interview Q&A
**Q1.** What is structure padding and why does it exist?
**A.** Compilers insert unused bytes between members so each member starts at an address aligned to its size. This avoids slow/unsupported unaligned memory accesses on most CPUs.

**Q2.** How would you minimize the size of a struct?
**A.** Order members from largest alignment to smallest. Optionally use `__attribute__((packed))` if you accept unaligned-access penalties.

**Q3.** When would you use a union?
**A.** (1) To save memory when only one of several values is active at a time. (2) For type punning — reading the same bytes through different types (legal in C, UB in C++ except for some special cases). (3) Tagged unions for variant records.

**Q4.** Sizes of `struct { int a; char b; }` and `union { int a; char b; }` on x86-64?
**A.** Struct: 8 bytes (4 for int, 1 for char + 3 padding). Union: 4 bytes (size of largest member, alignment of largest member).

**Q5.** Can you compare two structs with `==`?
**A.** No. Use a member-by-member comparison or `memcmp` (which may falsely flag padding differences).

### Key Takeaway
> Struct = "all members". Union = "one member at a time, sharing storage". Padding is your friend (speed) and enemy (size). Reorder members and use packed sparingly.

---

## 19. Bit Manipulation

The five bitwise operators: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (shift left), `>>` (shift right).

### The Four Canonical Bit Operations

```c
// num is the integer; n is the bit position (0 = LSB)

num |=  (1 << n);         // SET bit n
num &= ~(1 << n);         // CLEAR bit n
num ^=  (1 << n);         // TOGGLE bit n
int isSet = (num >> n) & 1;   // CHECK bit n  →  0 or 1
```

#### Worked Example
```c
#include <stdio.h>

int main(void) {
    int num = 0b00001010;   // = 10
    int n   = 1;

    num |=  (1 << n);  printf("Set    bit %d: %d (%#x)\n", n, num, num); // 10
    num &= ~(1 << n);  printf("Clear  bit %d: %d (%#x)\n", n, num, num); // 8
    num ^=  (1 << n);  printf("Toggle bit %d: %d (%#x)\n", n, num, num); // 10
    printf("Bit %d is %s\n", n, ((num >> n) & 1) ? "set" : "clear");
    return 0;
}
```

### Useful Bit Tricks

```c
// Number of bits in an int
int bits = sizeof(int) * CHAR_BIT;     // CHAR_BIT == 8 normally

// Mask the MSB
int msb_mask = 1 << (bits - 1);        // 0x80000000 on 32-bit int
if (num & msb_mask) /* MSB is set */ ;

// Power of 2: 1 << i  ==  2^i
// Divide by 2^i:  num >> i  (for non-negative integers)
// Multiply by 2^i:  num << i  (watch for overflow)

// Check if x is a power of two
int isPow2 = (x != 0) && ((x & (x - 1)) == 0);

// Count set bits (Brian Kernighan's)
int popcount(unsigned x) {
    int c = 0;
    while (x) { x &= x - 1; c++; }     // clears lowest set bit each iteration
    return c;
}

// Lowest set bit
unsigned lsb = x & -x;                  // assumes two's complement
```

### Bit Rotation
Unlike a shift (which loses bits), a **rotate** wraps the dropped bits back to the other end.

```c
#define INT_BITS 32

unsigned int leftRotate(unsigned int n, unsigned int d) {
    return (n << d) | (n >> (INT_BITS - d));
}

unsigned int rightRotate(unsigned int n, unsigned int d) {
    return (n >> d) | (n << (INT_BITS - d));
}
```
**Caveat:** if `d == 0` or `d == 32`, `n >> 32` is **undefined behavior** in C (shifts by ≥ width are UB). Production code masks: `d &= INT_BITS - 1;` before the rotate, but even then a `d == 0` case may need a special branch.

### Nibble & Byte Swap

Swap nibbles within each byte (e.g. `0x32` → `0x23`):
```c
num = ((num & 0xF0F0F0F0) >> 4) | ((num & 0x0F0F0F0F) << 4);
```

Swap adjacent bytes (`0x12345678` → `0x34127856`):
```c
num = ((num & 0xFF00FF00) >> 8) | ((num & 0x00FF00FF) << 8);
```

Swap halves (`0xAAAABBBB` → `0xBBBBAAAA`):
```c
num = (num >> 16) | (num << 16);
```

Combine all three → full 32-bit byte reverse (== `bswap32`).

### Shift Caveats — Undefined Behavior Zone
- Shift by negative amount → UB.
- Shift by ≥ width of type → UB.
- Left-shift of a **signed** value where the result overflows the type → UB.
- Right-shift of a **negative** signed value → implementation-defined (usually arithmetic shift, sign-extending).

**Defensive pattern:** do bit work on `unsigned` types whenever possible.

### Interview Q&A
**Q1.** How do you check if a number is a power of two?
**A.** `x != 0 && (x & (x - 1)) == 0`. Subtracting 1 from a power-of-two flips the single set bit and turns all lower bits on; ANDing gives zero.

**Q2.** Difference between `>>` for signed vs unsigned types?
**A.** Unsigned: logical shift, fill with 0. Signed: implementation-defined; typically arithmetic shift that sign-extends. To force logical, cast to unsigned first.

**Q3.** Why is `1 << 31` problematic for `int`?
**A.** On 32-bit `int`, `1` is signed. Shifting into the sign bit is **undefined behavior**. Use `1u << 31` or `(unsigned)1 << 31`.

**Q4.** How would you swap two integers without a temporary?
**A.**
```c
a ^= b; b ^= a; a ^= b;     // works, but UB if a and b are the same variable!
```
The "trick" is rarely worth it — modern compilers optimize the temp version equally well, and the XOR version is unreadable.

### Key Takeaway
> Five operators, four canonical operations (set/clear/toggle/test). Always use `unsigned` for bit manipulation. Beware shifts ≥ width — that's UB.

---

## 20. Endianness

**Endianness** is the byte order in which a multi-byte scalar is stored in memory.

| Endianness | MSB stored at | Common platforms |
|---|---|---|
| **Big-endian** | Lowest address (natural reading order) | Network protocols (TCP/IP), older PowerPC, SPARC |
| **Little-endian** | Highest address (reversed) | x86, x86-64, most ARM (configurable), RISC-V default |

For the 4-byte value `0x11223344`:

```
Address →   00    01    02    03
Big   :     11    22    33    44       MSB at low address
Little:     44    33    22    11       LSB at low address
```

### Detect at Runtime
```c
#include <stdio.h>

int main(void) {
    uint32_t x = 0x11223344;
    uint8_t *p = (uint8_t *)&x;
    printf("%s endian\n", (p[0] == 0x44) ? "little" : "big");
}
```
The `union` trick:
```c
union { uint32_t i; uint8_t  b[4]; } u = { .i = 1 };
int little_endian = (u.b[0] == 1);
```

### Why It Matters
- **Network protocols** are defined as big-endian ("network byte order"). Always convert with `htons`/`htonl`/`ntohs`/`ntohl` when reading from or writing to the wire.
- **Binary file formats** must specify endianness, or readers on different platforms will see wrong values.
- **Type-punning via union/cast** depends on endianness; portable code must use explicit byte-pack/unpack.

### Interview Q&A
**Q1.** Why does network byte order exist?
**A.** A protocol must commit to a single byte order, otherwise two endpoints would interpret the same bytes differently. The internet picked big-endian decades ago and stuck with it.

**Q2.** Is endianness the same as bit ordering?
**A.** No. Endianness is *byte* order in memory. Within a byte, bit numbering is just a labeling convention; it doesn't change the underlying storage.

**Q3.** How do you write portable code that works on both endians?
**A.** Use byte-by-byte serialization (`buf[0] = (x >> 24) & 0xFF; buf[1] = (x >> 16) & 0xFF; …`) or use `htonl`/`ntohl`-family functions for network code.

### Key Takeaway
> x86 is little-endian. Networks are big-endian. Anything that crosses the line — sockets, files, hardware — needs explicit conversion.

---

## 21. Memory-Mapped I/O

Hardware peripherals (UARTs, GPIOs, timers) are exposed to the CPU as **memory addresses**. Reading/writing the address triggers the device. This is **memory-mapped I/O (MMIO)**.

The C idiom for accessing an MMIO register:

```c
#define PORT_REG_ADDR  0x40020000

// Pointer that:
//  - points to a 32-bit volatile location
//  - is itself const (we never re-aim it)
volatile uint32_t * const port_reg = (volatile uint32_t *)PORT_REG_ADDR;

void set_port(uint32_t value) {
    *port_reg = value;            // write triggers hardware
}

uint32_t read_port(void) {
    return *port_reg;             // read fetches from device
}
```

**Why every qualifier matters:**

```text
volatile uint32_t * const port_reg
   |          |        |    |
   |          |        |    +---- name
   |          |        +--------- the POINTER is const (never reassigned)
   |          +------------------ pointed type is uint32_t
   +----------------------------- pointed type is volatile (never cache or optimize away)
```

- Without `volatile`, the compiler may cache the value in a register and skip subsequent reads.
- Without `const` on the pointer, code might accidentally re-aim it at a different address.
- The `uint32_t` width must match the hardware register size; mismatched-width access can fault on some MCUs.

### Read-Only and Write-Only Registers

```c
const volatile uint32_t * const status_reg  = (const volatile uint32_t *)0x4002000C;
//      ^^^^^^^                                                                        prevents accidental writes
//      |                                                                              hardware updates it any time
//      |                                                                              compiler must always re-read
```

For write-only registers (some hardware FIFOs), you can simply omit the read paths in code; there's no syntactic distinction.

### Common Mistakes
- Forgetting `volatile` → compiler optimizes the loop "wait for ready bit" into infinite waiting (or instant exit).
- Wrong access width: writing 8 bits to a 32-bit register.
- Reading a write-only register (some hardware faults).
- Not using a memory barrier on out-of-order CPUs (ARM/PowerPC) — `volatile` doesn't imply a barrier across cores.

### Worked Example — Polling a Device

```c
#define UART_STATUS  ((volatile uint32_t *)0x40011000)
#define UART_DATA    ((volatile uint32_t *)0x40011004)
#define TX_READY     (1u << 0)

void uart_putc(char c) {
    while ((*UART_STATUS & TX_READY) == 0) { /* spin */ }    // volatile is essential
    *UART_DATA = (uint32_t)c;
}
```
Without `volatile`, the optimizer would load `*UART_STATUS` once before the loop and spin forever.

### Key Takeaway
> Every MMIO access needs `volatile`. The pointer is usually `* const` (never re-aimed). Width and alignment must match the device. On multi-core systems, add memory barriers — `volatile` alone is not enough.

---

## 22. Strings — Reverse, Pattern Search, Word Reverse

C "strings" are just `char` arrays terminated by `'\0'`. There is no length prefix; every operation walks until it finds the null terminator. This is the source of countless bugs and the entire `strn*` family of safer functions.

### Safer Input — Use `fgets`, Not `gets`
```c
char str[25];
fgets(str, sizeof(str), stdin);          // safe — caps at sizeof-1
str[strcspn(str, "\n")] = '\0';          // strip trailing newline if present
```
`gets` was removed from C11 because it has no length parameter — a textbook buffer overflow.

### Reverse a String In-Place
```c
#include <string.h>

void reverse_string(char *s) {
    int first = 0, last = (int)strlen(s) - 1;
    while (first < last) {
        char tmp = s[first];
        s[first] = s[last];
        s[last]  = tmp;
        first++; last--;
    }
}
```
> The "swap without temp" trick (`a = a + b - (b = a)`) appears in the source notes; it's clever but **technically UB** in C (modifies and reads `b` between sequence points). Use a temp.

### Reverse Words in a Sentence
Two-pass algorithm:
1. Reverse the entire string. `"hello world"` → `"dlrow olleh"`.
2. Reverse each word in place. → `"world hello"`.

```c
#include <string.h>
#include <ctype.h>

static void rev(char *s, int i, int j) {
    while (i < j) { char t = s[i]; s[i] = s[j]; s[j] = t; i++; j--; }
}

void reverse_words(char *s) {
    int n = (int)strlen(s);
    rev(s, 0, n - 1);

    int word_start = 0;
    for (int i = 0; i <= n; i++) {
        if (s[i] == ' ' || s[i] == '\0') {
            rev(s, word_start, i - 1);
            word_start = i + 1;
        }
    }
}
```

### Naïve Substring Search — Pattern Matching
Returns 1 if `pat` is found in `text`, else 0:

```c
int contains(const char *text, const char *pat) {
    for (int i = 0; text[i]; i++) {
        int j = 0;
        while (pat[j] && text[i + j] == pat[j]) j++;
        if (pat[j] == '\0') return 1;       // matched all of pat
    }
    return 0;
}
```
Time complexity: O(n·m). For better worst-case, use **KMP** or **Boyer-Moore** (out of scope here, but worth knowing).

> **Tip.** `strstr(text, pat)` is the standard library version — returns a pointer to the first match, or `NULL`.

### Common Mistakes
- Forgetting the null terminator when building strings byte-by-byte.
- Using `strcpy`/`strcat` without checking destination size — buffer overflow.
- Iterating with `strlen(s)` inside a loop condition — O(n²) instead of O(n).
- Confusing `sizeof` (compile-time, includes `\0`) with `strlen` (runtime, excludes `\0`).

### Key Takeaway
> Always know the buffer size; pair every write with a length check. Prefer `snprintf`, `fgets`, `strncat` (with care). Use `<string.h>` whenever possible — its implementations are tested and SIMD-optimized.

---

## 23. Undefined Behavior

**Undefined behavior (UB)** is the C standard's term for code constructs whose effect the language **does not define at all**. The compiler is allowed to do *anything*: produce expected output, garbage output, crash, format your hard drive, or "time-travel" — optimize as if any path leading to UB cannot be reached.

This is not academic — modern optimizers exploit UB aggressively. A single UB in your program can silently change unrelated code far away.

### The Top UB Hit List

#### 1. Out-of-bounds array access
```c
int a[5];
a[10] = 0;      // UB
a[-1] = 0;      // UB
```

#### 2. Dereferencing NULL or uninitialized pointers
```c
int *p;     *p = 5;     // UB — wild pointer
int *q = NULL;  *q = 5; // UB
```

#### 3. Use-after-free / double-free
```c
free(p); *p = 1;       // use-after-free
free(p); free(p);      // double-free
```

#### 4. Modifying string literals
```c
char *s = "abc"; s[0] = 'A';   // UB — literals are read-only
```

#### 5. Signed integer overflow
```c
int x = INT_MAX;
x = x + 1;              // UB — compiler may assume this never happens
```
Unsigned overflow, in contrast, is **defined** to wrap modulo 2ⁿ.

#### 6. Shifting by ≥ width
```c
int n = 32;
int x = 1 << n;         // UB on 32-bit int
```

#### 7. Reading an uninitialized variable
```c
int x;
printf("%d", x);        // UB
```

#### 8. Strict-aliasing violations
```c
float f = 3.14f;
int i = *(int *)&f;     // UB (strict aliasing)
// Use memcpy or a union for type punning instead
```

#### 9. Modifying an object twice without a sequence point
```c
i = i++ + ++i;          // UB
arr[i] = i++;           // UB
```

#### 10. Returning the address of a local
```c
int *bad(void) { int x = 0; return &x; }   // UB on dereference
```

#### 11. Calling `main` recursively
```c
int main(void) { main(); return 0; }       // UB in C (legal in C++)
```

#### 12. Mismatched types in `printf`/`scanf`
```c
double d = 1.5;
printf("%d", d);        // UB — %d expects int, got double
```

#### 13. `memcpy` with overlapping regions
Use `memmove` instead.

#### 14. Division/modulo by zero
```c
int x = 5 / 0;          // UB
```

### Why You Should Care
Compilers exploit UB. A "harmless" UB can:
- Make a security check disappear (`if (p && p->field)` deleted because dereferencing `p` later "proves" `p != NULL`).
- Turn a finite loop infinite (signed overflow assumption).
- Reorder instructions in ways that break threading invariants.

**Defensive habits:**
- Compile with `-Wall -Wextra -Wpedantic`.
- Use **AddressSanitizer** (`-fsanitize=address`) in CI — catches UAF, OOB, leaks.
- Use **UndefinedBehaviorSanitizer** (`-fsanitize=undefined`) — catches signed overflow, shift UB, alignment bugs.
- Use **Valgrind** for traditional unit tests.
- Always check `malloc`/`realloc` return values.
- Initialize variables; NULL out pointers after `free`.
- Don't be clever with sequence points.

### Implementation-Defined vs Undefined vs Unspecified

| Category | What it means | Example |
|---|---|---|
| **Undefined** | Anything can happen; non-portable; no diagnostic required | Signed overflow |
| **Unspecified** | Standard lists ≥1 valid behaviors; compiler picks one without telling you | Order of argument evaluation |
| **Implementation-defined** | Compiler picks one and **must document** it | Size of `int`, behavior of `>>` on negative |

### Key Takeaway
> UB is not a corner case; it's a **contract**. The standard says "if you do X, we owe you nothing." Treat it as a critical bug class. Sanitizers catch most of it for free; use them.

---

## 24. Sharp Insights for Systems Interviews

These short, sharp facts are the kind of thing senior interviewers love to probe.

### Why is the stack faster than the heap?
- **Allocation = one instruction** (`sub rsp, N`). No bookkeeping data structures.
- **Deallocation = one instruction** (`add rsp, N` on function return).
- **Cache locality** — the top of the stack is almost always already in L1.
- The heap requires walking free lists, possibly system calls (`brk`/`mmap`), thread synchronization, and may return cold memory.

### What is cache locality and why does it matter?
- **Spatial locality** — if you access `a[0]`, the cache loads a whole *line* (typically 64 bytes), so `a[1]…a[15]` for `int` are essentially free.
- **Temporal locality** — recently accessed memory stays in cache; reuse is cheap.
- **Stride-1 access** (linear walk through arrays) maximizes spatial locality. Random access (linked lists, hash tables) destroys it.
- A cache miss costs **hundreds of cycles**; a hit is **~4 cycles** (L1). This is why "data-oriented" code beats "pointer-chasing" code, often by 10×.

### Cost of `malloc`/`free`
- Typical fast-path: ~50–200 cycles (free list lookup, bookkeeping).
- Slow path on growth: thousands of cycles (`brk`/`mmap` syscall, page faults).
- In allocation-heavy hot loops, use **arena allocators** or **object pools** — bulk-allocate, hand out slots, free everything at once.

### Why is signed overflow UB but unsigned isn't?
- The standard left signed representation implementation-defined for decades (there were one's-complement and sign-magnitude machines historically). UB lets the compiler optimize aggressively (e.g., `i + 1 > i` is always true for signed `i`, so the loop must terminate).
- Unsigned is defined by the standard to wrap modulo 2ⁿ.

### Why do compilers reorder instructions?
- To hide memory latency (start a load early), keep pipelines full, exploit superscalar issue. Provided **observable behavior** (per the as-if rule) doesn't change.
- This is why `volatile`, atomics, and barriers exist — they are the way you tell the optimizer (and the CPU) "*don't reorder past this point*".

### What does `restrict` (C99) do?
- Tells the compiler: "for the lifetime of this pointer, the object it points to is accessed *only* through this pointer (or pointers derived from it)."
- Enables vectorization and load/store reordering that would otherwise be unsafe.
- Example: `void mul(double *restrict a, const double *restrict b, int n)` lets the compiler vectorize without worrying about `a` and `b` overlapping.

### Function-call cost
- Modern x86: ~1–3 cycles for prediction + jump if not inlined; pushing args, saving callee-save registers, return all add up to ~10–20 cycles for a typical call.
- Inlining eliminates the call but bloats the I-cache footprint. Modern compilers usually pick well.

### Why are linked lists often slower than arrays?
- Each node is a separate allocation, scattered across the heap.
- Traversing means **random access patterns** → cache misses → 100×+ slowdown over a contiguous array, even if both are O(n).
- For small data, arrays even beat hash tables on lookups due to cache-friendliness.

### What is "as-if" optimization?
- The compiler may transform code in any way as long as the **observable behavior** (volatile accesses, file I/O, library calls) is preserved.
- This is why `for (int i = 0; i < 1000000; i++) sum += i;` may compile to a single closed-form `sum += 499999500000;`.

### Why does `printf("%d", x)` not need a `\n` to print on some systems?
- `stdout` is **line-buffered** when connected to a TTY, **block-buffered** when redirected to a file or pipe. Output sits in the buffer until newline / fill / `fflush` / program exit.
- In an interactive shell, missing `\n` may print immediately. In a script with a redirect, it may not appear until the program ends.

---

## 25. Quick-Revision Tables

### Storage Classes
| Class | Lifetime | Scope | Linkage | Default Value | Region |
|---|---|---|---|---|---|
| `auto` | Block | Block | None | Garbage | Stack |
| `register` | Block | Block | None | Garbage | Register hint |
| `static` (local) | Program | Block | None | Zero | `.data` / `.bss` |
| `static` (file) | Program | File | Internal | Zero | `.data` / `.bss` |
| `extern` | Program | File | External | Zero (if defined) | `.data` / `.bss` |

### Memory Segments
| Segment | Holds | Permissions |
|---|---|---|
| `.text` | Compiled code | Read + Execute |
| `.rodata` | String literals, `const` globals | Read-only |
| `.data` | Initialized non-const globals/statics | Read + Write |
| `.bss` | Uninitialized / zero-init globals | Read + Write |
| Heap | `malloc` allocations | Read + Write |
| Stack | Locals, return addresses | Read + Write |

### Pointer Pathologies at a Glance
| Type | Cause | Symptom |
|---|---|---|
| NULL | `int *p = NULL; *p` | Segfault |
| Wild | uninitialized | Crash / random behavior |
| Dangling | UAF / scope-end | Heisenbug |
| Memory leak | malloc, no free | Slow growth, OOM |

### `const` / `volatile` Reading Rules
| Declaration | "p is …" |
|---|---|
| `int *p` | pointer to int |
| `const int *p` | pointer to constant int (value can't change via p) |
| `int * const p` | constant pointer to int (p can't be reassigned) |
| `const int * const p` | constant pointer to constant int |
| `volatile int *p` | pointer to volatile int (re-read every access) |
| `volatile int * const p` | constant pointer to volatile int (typical for MMIO) |

### `malloc` Family Cheat Sheet
| Function | Initializes? | Args | Resizes? |
|---|---|---|---|
| `malloc(n)` | No (garbage) | bytes | No |
| `calloc(n, sz)` | Yes (zero) | count, element size | No |
| `realloc(p, n)` | Preserves old, garbage in new | pointer, new bytes | Yes (may move) |
| `free(p)` | — | pointer | Releases |

### Bit-Op Cheat Sheet
| Operation | Code |
|---|---|
| Set bit n | `x |= (1 << n)` |
| Clear bit n | `x &= ~(1 << n)` |
| Toggle bit n | `x ^= (1 << n)` |
| Test bit n | `(x >> n) & 1` |
| Lowest set bit | `x & -x` |
| Clear lowest set bit | `x & (x - 1)` |
| Power of 2? | `x && !(x & (x - 1))` |

### `memcpy` / `memmove` / `memset`
| Function | Overlap-safe? | Use when |
|---|---|---|
| `memcpy` | No | Source/dest known disjoint, max speed |
| `memmove` | Yes | Regions may overlap |
| `memset` | n/a | Filling with byte value (`0`, `-1`) |

### Format Specifiers Quick-Reference
| `%d` `int` | `%u` `unsigned` | `%ld`/`%lu` `long` | `%lld`/`%llu` `long long` |
| `%f` `float` (printf) / `%lf` `double` | `%c` `char` | `%s` `char*` | `%p` `void*` |
| `%x`/`%X` hex | `%o` octal | `%zu` `size_t` | `%e` scientific |

---

## 26. Curated Interview Questions

### Compilation & Linking
1. Walk me through what happens between `gcc file.c -o app` and the binary running.
2. Why is `printf` unresolved at the assembler stage but resolved at link?
3. Difference between `#include <foo.h>` and `#include "foo.h"`?
4. What is `static` linkage and when would you use it on a function?
5. What's the practical difference between a header file and a library?

### Memory Layout & Storage
6. Where in memory does each of these live: `int x;` (global), `static int y;` (local), `int *z = malloc(4);`, `"hello"` literal?
7. Why is the stack typically faster than the heap?
8. What's the lifetime of a `static` local variable, and when is it initialized?
9. What happens if you return a pointer to a local variable from a function?
10. What's the difference between `extern` and `static` at file scope?

### Pointers
11. What is a dangling pointer? A wild pointer? A void pointer?
12. Decode: `int *(*foo)(int, int, int);` What is `foo`?
13. Write the difference between `const int *p`, `int * const p`, and `const int * const p`.
14. Difference between `char *s = "hi";` and `char s[] = "hi";`?
15. Why does `int *p = arr;` work but `int (*p)[10] = arr;` is sometimes preferred?
16. What does pointer arithmetic actually do in `p + 1`?

### Arrays & Strings
17. Why does `sizeof(arr)` give the wrong answer inside a function?
18. How are string literals stored, and why is modifying them UB?
19. Implement `strlen` and `strcpy` from scratch.
20. Implement a function to reverse the words of a sentence in place.

### Memory Management
21. Difference between `malloc`, `calloc`, and `realloc`.
22. How would you safely use `realloc`?
23. What is a memory leak, double-free, and use-after-free? How do you detect each?
24. When would you use `memmove` over `memcpy`?
25. Show four different ways to allocate a 2-D array on the heap and their tradeoffs.

### Structs, Unions, Padding
26. What is structure padding and why does the compiler do it?
27. How do you minimize the size of a struct? Demonstrate.
28. What is a tagged union? When would you use one?
29. Can you compare two structs with `==`? Why not?
30. Calculate the size of: `struct { char a; int b; char c; double d; };` on x86-64.

### Macros, Inline, typedef, enum
31. Why might `#define SQUARE(x) x*x` give wrong results? Show a fix.
32. When would you use `inline` instead of a macro?
33. Why must inline functions in headers usually be `static inline`?
34. Difference between `typedef` and `#define` for `char *`?
35. Why prefer `enum` over `#define` for related constants?

### Qualifiers
36. What does `volatile` actually do? Why isn't it enough for thread safety?
37. Give a real-world example where a variable should be both `const` and `volatile`.
38. What does `restrict` (C99) tell the compiler?

### Bit Manipulation
39. Set, clear, toggle, and test the n-th bit of an int.
40. How do you check if a number is a power of two?
41. Implement left and right rotation by `d` bits.
42. Given an int, swap its high 16 bits with its low 16 bits.
43. How would you reverse the byte order of a 32-bit integer (`bswap`)?

### Endianness & MMIO
44. How do you detect endianness at runtime?
45. Why is the network byte order big-endian?
46. Why must memory-mapped I/O accesses use `volatile`?
47. Decode this declaration: `volatile uint32_t * const port_reg;`

### Undefined Behavior
48. Is `i = i++ + ++i;` defined? Why not?
49. Name three common UB pitfalls in everyday C code.
50. Why is signed integer overflow UB but unsigned overflow defined?
51. What happens if you cast away `const` and modify the object?

### Function Pointers
52. Declare a pointer to a function taking two `int`s and returning `int`. Then assign and call it.
53. How do you implement a polymorphic interface in C? Sketch a "vtable" pattern.
54. What's the difference between `void (*f)()` and `void *f()`?

### Cost & Performance
55. Why is array iteration faster than linked-list traversal?
56. What is cache locality and how does it affect data structure choice?
57. What is the typical cost of a function call, a `malloc`, an L1 cache hit, and an L1 cache miss?
58. What is the "as-if" rule and how does it enable optimizations?

---

## Final Word

C is small but unforgiving. The interview separator isn't syntax — it's whether you can:
- **Reason about memory** (where does this live? who owns it? when does it die?)
- **Spot UB** (this code "works" but is the standard happy?)
- **Predict the compiler** (what will optimization do here?)
- **Think about the machine** (cache lines, branch prediction, instruction throughput)

Master the storage-class table, the memory-layout diagram, the const/volatile distinction, the pointer-vs-array decay rules, and the UB hit list — and you'll handle 90% of what systems interviewers ask. The remaining 10% is practice on bit-twiddling, data-structure implementation, and reading code under pressure.

Good luck.

---

*Document derived from source notes; deduplicated, fact-checked, code-corrected, and expanded for interview prep.*
