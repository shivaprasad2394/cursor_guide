---
id: "q78-memset-memcpy-memmove-standard-functions"
title: "memset / memcpy / memmove (standard functions)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "generic"
vizCategory: "memory, dma, mmap & reimplementing libc"
tape: "memset 'A' x5 -> %s\\n"
stdin: ""
expectedOutput: "memset 'A' x5 -> AAAAA\nmemcpy HELLO -> HELLO\nmemmove overlap (shift right 2): ABABCDE.\n"
---
## At a glance

- **Goal:** memset / memcpy / memmove (standard functions)
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `memset 'A' x5 -> AAAAA`

## Description

Implement **memset / memcpy / memmove (standard functions)** using the pattern above. Write the helper function(s); `main()` is provided.

## Starter Code

```c
#include <stdio.h>
#include <string.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char buf[16];
    /* memset: fill */
    memset(buf, 'A', 5);
    buf[5] = '\0';
    printf("memset 'A' x5 -> %s\n", buf);
    /* memcpy: non-overlapping copy */
    char src[] = "HELLO", dst[8] = {
        0
    }
    memcpy(dst, src, 6);
    /* includes the '\0' */
    printf("memcpy HELLO -> %s\n", dst);
    /* overlap demo: shift "ABCDEF" right by 2 within the same array */
    char ov[] = "ABCDEF..";
    /* memmove handles overlap correctly: move 6 bytes from ov to ov+2 */
    memmove(ov + 2, ov, 6);
    ov[8 - 1] = '\0';
    dump("memmove overlap (shift right 2)", ov, 8);
    /* With memcpy this overlap would be UNDEFINED (may copy a byte after
       it was already overwritten). memmove is the correct tool here. */

    return 0;
}
```

## Solution

```c
/* Standard memory functions: memset, memcpy, memmove
 *
 * memset(dst, byte, n) : fill n bytes with a single byte value
 * memcpy(dst, src, n)  : copy n bytes; src and dst MUST NOT overlap
 * memmove(dst, src, n) : copy n bytes; overlap IS safe (handles direction)
 *
 * The key interview point: memcpy is undefined if the regions overlap;
 * memmove detects the direction and copies so no byte is clobbered early.
 */
#include <stdio.h>
#include <string.h>

static void dump(const char *label, const char *a, int n) {
    printf("%s: ", label);
    for (int i = 0; i < n; i++) putchar(a[i] ? a[i] : '.');
    printf("\n");
}

int main(void) {
    char buf[16];
    /* memset: fill */
    memset(buf, 'A', 5);
    buf[5] = '\0';
    printf("memset 'A' x5 -> %s\n", buf);
    /* memcpy: non-overlapping copy */
    char src[] = "HELLO", dst[8] = {
        0
    }
    memcpy(dst, src, 6);
    /* includes the '\0' */
    printf("memcpy HELLO -> %s\n", dst);
    /* overlap demo: shift "ABCDEF" right by 2 within the same array */
    char ov[] = "ABCDEF..";
    /* memmove handles overlap correctly: move 6 bytes from ov to ov+2 */
    memmove(ov + 2, ov, 6);
    ov[8 - 1] = '\0';
    dump("memmove overlap (shift right 2)", ov, 8);
    /* With memcpy this overlap would be UNDEFINED (may copy a byte after
       it was already overwritten). memmove is the correct tool here. */

    return 0;
}
```
