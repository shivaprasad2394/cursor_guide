---
id: "q110-return-min-max-via-output-pointers"
title: "Return Min and Max via Output Pointers"
pattern: "output parameters"
difficulty: "easy"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "min=2 max=15\n"
---
## At a glance

- **Goal:** Return Min and Max via Output Pointers
- **Pattern:** Output Parameters
- **Expected output:** `min=2 max=15`

## Description

Implement `void minMax(const int *arr, int n, int *outMin, int *outMax)` using pointer parameters to return two results.

## Algorithm

```text
step1: *outMin = *outMax = *arr
step2: Walk p from arr+1 to arr+n, updating *outMin / *outMax
```

## Example Trace

```text
[8,2,15,4] → min=2 max=15
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
    int a[] = {8, 2, 15, 4};
    int lo, hi;
    minMax(a, 4, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
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
void minMax(const int *arr, int n, int *outMin, int *outMax) {
    *outMin = *outMax = arr[0];
    for (const int *p = arr + 1; p < arr + n; p++) {
        if (*p < *outMin) *outMin = *p;
        if (*p > *outMax) *outMax = *p;
    }
}

int main(void) {
    int a[] = {8, 2, 15, 4};
    int lo, hi;
    minMax(a, 4, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    return 0;
}
```
