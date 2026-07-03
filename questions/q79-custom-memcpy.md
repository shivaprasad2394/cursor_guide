---
id: "q79-custom-memcpy"
title: "Custom memcpy"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "generic"
vizCategory: "memory, dma, mmap & reimplementing libc"
tape: "ABCD"
stdin: ""
expectedOutput: "my_memcpy(ABCDEFG) -> ABCDEFG\n"
---
## At a glance

- **Goal:** Custom memcpy
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `my_memcpy(ABCDEFG) -> ABCDEFG`

## Description

Implement **Custom memcpy** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

copy 4 bytes of "ABCD" -> dst

## Algorithm

```text
step1: cast void* to unsigned char* so we copy byte by byte
  step2: loop n times copying d[i] = s[i]
  step3: return the original dst (standard contract)

Why unsigned char*: void* can't be dereferenced; char is 1 byte so
the loop counts exact bytes regardless of the real data type.
```

## Example Trace

```text
copy 4 bytes of "ABCD" -> dst
  i=0: d[0]='A'  i=1: d[1]='B'  i=2: d[2]='C'  i=3: d[3]='D'
```

## Starter Code

```c
#include <stdio.h>
#include <stddef.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char src[] = "ABCDEFG";
    char dst[8] = {0};
    my_memcpy(dst, src, 8);             /* 7 chars + '\0' */
    printf("my_memcpy(ABCDEFG) -> %s\n", dst);
    return 0;
}
```

## Solution

```c
/* Custom memcpy: copy n bytes from src to dst (no overlap allowed)
 *
 * Algorithm:
 *   step1: cast void* to unsigned char* so we copy byte by byte
 *   step2: loop n times copying d[i] = s[i]
 *   step3: return the original dst (standard contract)
 *
 * Why unsigned char*: void* can't be dereferenced; char is 1 byte so
 * the loop counts exact bytes regardless of the real data type.
 *
 * Example: copy 4 bytes of "ABCD" -> dst
 *   i=0: d[0]='A'  i=1: d[1]='B'  i=2: d[2]='C'  i=3: d[3]='D'
 */
#include <stdio.h>
#include <stddef.h>

void *my_memcpy(void *dst, const void *src, size_t n) {
    unsigned char *d = (unsigned char *)dst;
    const unsigned char *s = (const unsigned char *)src;
    for (size_t i = 0; i < n; i++)
        d[i] = s[i];
    return dst;
}

int main(void) {
    char src[] = "ABCDEFG";
    char dst[8] = {0};
    my_memcpy(dst, src, 8);             /* 7 chars + '\0' */
    printf("my_memcpy(ABCDEFG) -> %s\n", dst);
    return 0;
}
```
