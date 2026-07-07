---
id: "q81-custom-memset"
title: "Custom memset"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "generic"
vizCategory: "memory, dma, mmap & reimplementing libc"
tape: "****"
stdin: ""
expectedOutput: "my_memset('*',4) -> ****\nmy_memset(arr,1) -> arr[0]=0x01010101 (NOT 1!)\n"
---
## At a glance

- **Goal:** Custom memset
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `my_memset('*',4) -> ****`

## Description

Implement **Custom memset** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

my_memset(buf, '*', 4) -> buf = "****"

## Algorithm

```text
step1: cast dst to unsigned char*
step2: store the low 8 bits of c into each of the n bytes
step3: return dst
```

## Example Trace

```text
my_memset(buf, '*', 4) -> buf = "****"
```

## Starter Code

```c
#include <stdio.h>
#include <stddef.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char buf[8] = {
        0
    }
    my_memset(buf, '*', 4);
    printf("my_memset('*',4) -> %s\n", buf);
    /* show the byte-fill gotcha on ints */
    int arr[2];
    my_memset(arr, 1, sizeof arr);
    /* each BYTE = 0x01 */
    printf("my_memset(arr,1) -> arr[0]=0x%08X (NOT 1!)\n", arr[0]);
    return 0;
}
```

## Solution

```c
/* Custom memset: fill n bytes of dst with byte value c
 *
 * Algorithm:
 *   step1: cast dst to unsigned char*
 *   step2: store the low 8 bits of c into each of the n bytes
 *   step3: return dst
 *
 * Note: memset works on BYTES. memset(arr, 1, n) on an int array does NOT
 * set each int to 1 - it sets every byte to 0x01, giving 0x01010101.
 * Only 0 (and -1) are "safe" fill values for non-char arrays.
 *
 * Example: my_memset(buf, '*', 4) -> buf = "****"
 */
#include <stdio.h>
#include <stddef.h>

void *my_memset(void *dst, int c, size_t n) {
    unsigned char *d = (unsigned char *)dst;
    unsigned char byte = (unsigned char)c;
    for (size_t i = 0; i < n; i++)
        d[i] = byte;
    return dst;
}

int main(void) {
    char buf[8] = {
        0
    }
    my_memset(buf, '*', 4);
    printf("my_memset('*',4) -> %s\n", buf);
    /* show the byte-fill gotcha on ints */
    int arr[2];
    my_memset(arr, 1, sizeof arr);
    /* each BYTE = 0x01 */
    printf("my_memset(arr,1) -> arr[0]=0x%08X (NOT 1!)\n", arr[0]);
    return 0;
}
```
