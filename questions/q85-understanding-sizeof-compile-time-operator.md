---
id: "q85-understanding-sizeof-compile-time-operator"
title: "Understanding sizeof (compile-time operator)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: |
  MY_SIZEOF(int)    = 4 (real sizeof = 4)
  MY_SIZEOF(double) = 8 (real sizeof = 8)
  MY_SIZEOF(arr)    = 40 (real sizeof = 40)
  array length = sizeof(arr)/sizeof(arr[0]) = 10
---

## Description

Understanding sizeof (compile-time operator)

## Example Trace

```text
int x; MY_SIZEOF(x) -> 4 on a 32-bit-int machine.
```

## Starter Code

```c
#include <stdio.h>
#define MY_SIZEOF(x)  ((char *)(&(x) + 1) - (char *)&(x))

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    int   i;
    double d;
    int   arr[10];

    printf("MY_SIZEOF(int)    = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(i), sizeof i);
    printf("MY_SIZEOF(double) = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(d), sizeof d);
    printf("MY_SIZEOF(arr)    = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(arr), sizeof arr);
    printf("array length = sizeof(arr)/sizeof(arr[0]) = %zu\n",
           sizeof arr / sizeof arr[0]);
    return 0;
}
```

## Solution

```c
/* "Custom sizeof": understand what sizeof really is
 *
 * sizeof is a COMPILE-TIME OPERATOR, not a function - the compiler replaces
 * it with a constant. You cannot truly reimplement it as a function, but a
 * classic pointer-arithmetic trick reveals how it could be computed:
 *
 *   MY_SIZEOF(x):  (char*)(&(x) + 1) - (char*)&(x)
 *     - &(x)     : address of x
 *     - &(x) + 1 : address ONE ELEMENT past x (pointer arithmetic scales by
 *                  the type's size - this is the key insight)
 *     - subtract as char* (byte pointers) -> the size in bytes
 *
 * It also explains the #1 array gotcha:
 *   sizeof(array) = total bytes;  sizeof(array)/sizeof(array[0]) = length.
 *   BUT once an array DECAYS to a pointer (e.g. a function parameter),
 *   sizeof gives the POINTER size, not the array size.
 *
 * Example: int x; MY_SIZEOF(x) -> 4 on a 32-bit-int machine.
 */
#include <stdio.h>

#define MY_SIZEOF(x)  ((char *)(&(x) + 1) - (char *)&(x))

int main(void) {
    int   i;
    double d;
    int   arr[10];

    printf("MY_SIZEOF(int)    = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(i), sizeof i);
    printf("MY_SIZEOF(double) = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(d), sizeof d);
    printf("MY_SIZEOF(arr)    = %ld (real sizeof = %zu)\n",
           MY_SIZEOF(arr), sizeof arr);
    printf("array length = sizeof(arr)/sizeof(arr[0]) = %zu\n",
           sizeof arr / sizeof arr[0]);
    return 0;
}
```
