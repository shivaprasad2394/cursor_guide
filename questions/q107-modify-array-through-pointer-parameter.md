---
id: "q107-modify-array-through-pointer-parameter"
title: "Modify Array Through Pointer Parameter"
pattern: "pointer parameter"
difficulty: "easy"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "scaled: 2 4 6 8 10\n"
---
## At a glance

- **Goal:** Modify Array Through Pointer Parameter
- **Pattern:** Pointer Parameter
- **Expected output:** `scaled: 2 4 6 8 10`

## Description

Implement `void scale(int *arr, int n, int factor)` that multiplies every element through pointer walking.

## Algorithm

```text
step1: end = arr + n
step2: Walk p from arr to end-1, doing *p *= factor
```

## Example Trace

```text
[1,2,3,4,5] with factor 2 → [2,4,6,8,10]
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    scale(a, 5, 2);
    printf("scaled:");
    for (int i = 0; i < 5; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
```

## Solution

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
void scale(int *arr, int n, int factor) {
    int *end = arr + n;
    for (int *p = arr; p < end; p++)
        *p *= factor;
}

int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    scale(a, 5, 2);
    printf("scaled:");
    for (int i = 0; i < 5; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
```
