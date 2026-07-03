---
id: "q82-custom-strncpy"
title: "Custom strncpy"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "generic"
vizCategory: "memory, dma, mmap & reimplementing libc"
tape: "Hi"
stdin: ""
expectedOutput: "my_strncpy(Hi,6) -> \"Hi\" (padded with nulls)\nmy_strncpy(Hello,4)+manual NUL -> \"Hel\"\n"
---
## At a glance

- **Goal:** Custom strncpy
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `my_strncpy(Hi,6) -> "Hi" (padded with nulls)`

## Description

Implement **Custom strncpy** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

my_strncpy(dst, "Hi", 5)

## Algorithm

```text
step1: copy chars while i<n AND src[i] != '\0'
step2: for the rest up to n, write '\0' (padding)
```

## Example Trace

```text
my_strncpy(dst, "Hi", 5)
  i=0:'H' i=1:'i' i=2:'\0' i=3:'\0' i=4:'\0'  -> "Hi" + 3 nulls

SAFE-USE TRAP: always do dst[n-1]='\0' yourself if src might be >= n.
```

## Starter Code

```c
#include <stdio.h>
#include <stddef.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char dst[6];
    my_strncpy(dst, "Hi", 6);
    printf("my_strncpy(Hi,6) -> \"%s\" (padded with nulls)\n", dst);

    char dst2[4];
    my_strncpy(dst2, "Hello", 4);       /* src longer than n: NOT terminated */
    dst2[3] = '\0';                      /* SAFE-USE: terminate ourselves */
    printf("my_strncpy(Hello,4)+manual NUL -> \"%s\"\n", dst2);
    return 0;
}
```

## Solution

```c
/* Custom strncpy: copy up to n chars from src to dst
 *
 * Mirrors the real strncpy's quirky contract:
 *   - copies at most n chars
 *   - if src is shorter than n, the remainder of dst is PADDED with '\0'
 *   - if src is n or longer, dst is NOT null-terminated (the famous trap!)
 *
 * Algorithm:
 *   step1: copy chars while i<n AND src[i] != '\0'
 *   step2: for the rest up to n, write '\0' (padding)
 *
 * Example: my_strncpy(dst, "Hi", 5)
 *   i=0:'H' i=1:'i' i=2:'\0' i=3:'\0' i=4:'\0'  -> "Hi" + 3 nulls
 *
 * SAFE-USE TRAP: always do dst[n-1]='\0' yourself if src might be >= n.
 */
#include <stdio.h>
#include <stddef.h>

char *my_strncpy(char *dst, const char *src, size_t n) {
    size_t i = 0;
    for (; i < n && src[i] != '\0'; i++)
        dst[i] = src[i];
    for (; i < n; i++)                  /* pad remainder with '\0' */
        dst[i] = '\0';
    return dst;
}

int main(void) {
    char dst[6];
    my_strncpy(dst, "Hi", 6);
    printf("my_strncpy(Hi,6) -> \"%s\" (padded with nulls)\n", dst);

    char dst2[4];
    my_strncpy(dst2, "Hello", 4);       /* src longer than n: NOT terminated */
    dst2[3] = '\0';                      /* SAFE-USE: terminate ourselves */
    printf("my_strncpy(Hello,4)+manual NUL -> \"%s\"\n", dst2);
    return 0;
}
```
