---
id: "q80-custom-memmove-overlap-safe"
title: "Custom memmove (overlap-safe)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "my_memmove(shift right 2) -> ABABCDE\nmy_memmove(shift left 3) -> 123\n"
---
## At a glance

- **Goal:** Custom memmove (overlap-safe)
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `my_memmove(shift right 2) -> ABABCDE`

## Description

Implement **Custom memmove (overlap-safe)** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

array "ABCDEF", move 6 bytes from index 0 to index 2 (dst>src)

## Algorithm

```text
step1: cast to unsigned char*
step2: if dst < src, loop i = 0..n-1 forward
step3: else loop i = n-1..0 backward
```

## Example Trace

```text
array "ABCDEF", move 6 bytes from index 0 to index 2 (dst>src)
  copy BACKWARD: F first, then E, D, C, B, A
  -> "ABABCDEF" region, no byte clobbered before it is read.
```

## Starter Code

```c
#include <stdio.h>
#include <stddef.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char a[] = "ABCDEF..";
    my_memmove(a + 2, a, 6);            /* overlapping shift right by 2 */
    a[8 - 1] = '\0';
    printf("my_memmove(shift right 2) -> %s\n", a);

    char b[] = "XYZ123";
    my_memmove(b, b + 3, 3);            /* shift left, dst<src, forward */
    b[3] = '\0';
    printf("my_memmove(shift left 3) -> %s\n", b);
    return 0;
}
```

## Solution

```c
/* Custom memmove: copy n bytes; SAFE even if src and dst overlap
 *
 * The whole trick is COPY DIRECTION:
 *   - if dst < src : copy FORWARD (low to high) - the bytes we read next
 *                    haven't been overwritten yet.
 *   - if dst > src : copy BACKWARD (high to low) - same reason in reverse.
 *   - if dst == src: nothing to do.
 *
 * Algorithm:
 *   step1: cast to unsigned char*
 *   step2: if dst < src, loop i = 0..n-1 forward
 *   step3: else loop i = n-1..0 backward
 *
 * Example: array "ABCDEF", move 6 bytes from index 0 to index 2 (dst>src)
 *   copy BACKWARD: F first, then E, D, C, B, A
 *   -> "ABABCDEF" region, no byte clobbered before it is read.
 */
#include <stdio.h>
#include <stddef.h>

void *my_memmove(void *dst, const void *src, size_t n) {
    unsigned char *d = (unsigned char *)dst;
    const unsigned char *s = (const unsigned char *)src;
    if (d < s) {                        /* forward copy */
        for (size_t i = 0; i < n; i++) d[i] = s[i];
    } else if (d > s) {                 /* backward copy */
        for (size_t i = n; i > 0; i--) d[i - 1] = s[i - 1];
    }
    return dst;
}

int main(void) {
    char a[] = "ABCDEF..";
    my_memmove(a + 2, a, 6);            /* overlapping shift right by 2 */
    a[8 - 1] = '\0';
    printf("my_memmove(shift right 2) -> %s\n", a);

    char b[] = "XYZ123";
    my_memmove(b, b + 3, 3);            /* shift left, dst<src, forward */
    b[3] = '\0';
    printf("my_memmove(shift left 3) -> %s\n", b);
    return 0;
}
```
