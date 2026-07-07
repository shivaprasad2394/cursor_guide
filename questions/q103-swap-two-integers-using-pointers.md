---
id: "q103-swap-two-integers-using-pointers"
title: "Swap Two Integers Using Pointers"
pattern: "pointer parameters"
difficulty: "easy"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "before: a=3 b=7\nafter:  a=7 b=3\n"
---
## At a glance

- **Goal:** Swap Two Integers Using Pointers
- **Pattern:** Pointer Parameters
- **Expected output:** `before: a=3 b=7 / after: a=7 b=3`

## Description

Write `void swap(int *pa, int *pb)` that exchanges the values at two addresses.

## Algorithm

```text
step1: Save *pa in a temporary variable
step2: Write *pb into *pa
step3: Write the saved value into *pb
```

## Example Trace

```text
a=3, b=7 → after swap a=7, b=3
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
    int a = 3, b = 7;
    printf("before: a=%d b=%d\n", a, b);
    swap(&a, &b);
    printf("after:  a=%d b=%d\n", a, b);
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
void swap(int *pa, int *pb) {
    int tmp = *pa;
    *pa = *pb;
    *pb = tmp;
}

int main(void) {
    int a = 3, b = 7;
    printf("before: a=%d b=%d\n", a, b);
    swap(&a, &b);
    printf("after:  a=%d b=%d\n", a, b);
    return 0;
}
```
