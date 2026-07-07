---
id: "q104-reverse-array-with-pointer-walking"
title: "Reverse Array with Pointer Walking"
pattern: "pointer arithmetic"
difficulty: "easy"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "reversed: 5 4 3 2 1\n"
---
## At a glance

- **Goal:** Reverse Array with Pointer Walking
- **Pattern:** Pointer Arithmetic
- **Expected output:** `reversed: 5 4 3 2 1`

## Description

Reverse an array in-place using two pointers (`left` and `right`) — no index subscripts in the loop body.

## Algorithm

```text
step1: left = arr, right = arr + n - 1
step2: While left < right: swap *left and *right, then left++, right--
step3: Print the reversed array
```

## Example Trace

```text
[1,2,3,4,5] → [5,4,3,2,1]
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
    reverseWithPtrs(a, 5);
    printf("reversed:");
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
void reverseWithPtrs(int *arr, int n) {
    int *left = arr;
    int *right = arr + n - 1;
    while (left < right) {
        int t = *left;
        *left = *right;
        *right = t;
        left++;
        right--;
    }
}

int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    reverseWithPtrs(a, 5);
    printf("reversed:");
    for (int i = 0; i < 5; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
```
