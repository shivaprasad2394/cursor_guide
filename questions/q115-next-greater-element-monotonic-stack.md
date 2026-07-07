---
id: "q115-next-greater-element-monotonic-stack"
title: "Next Greater Element (Monotonic Stack)"
pattern: "monotonic stack"
difficulty: "medium"
visualization: "monotonic-stack"
vizCategory: "dsa"
stdin: ""
tape: "2,1,2,4,3,8"
expectedOutput: "nge: 4 2 4 8 -1 8\n"
---
## At a glance

- **Goal:** Next Greater Element (Monotonic Stack)
- **Pattern:** Monotonic Stack
- **Expected output:** `nge: 4 2 4 8 -1 8`

## Description

For each element, find the next greater element to the right. Classic monotonic decreasing stack.

## Algorithm

```text
step1: scan right to left OR left to right with stack
step2: pop while stack top <= current
step3: answer[i] = stack top or -1; push i
```

## Example Trace

```text
nums = [2,1,2,4,3] → nge = [3,2,4,-1,-1]
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
    int a[] = {2, 1, 2, 4, 3, 8};
    int out[6];
    nextGreater(a, 6, out);
    printf("nge:");
    for (int i = 0; i < 6; i++) printf(" %d", out[i]);
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
void nextGreater(const int nums[], int n, int out[]) {
    int st[64], top = -1;
    for (int i = n - 1; i >= 0; i--) {
        while (top >= 0 && nums[st[top]] <= nums[i]) top--;
        out[i] = top >= 0 ? nums[st[top]] : -1;
        st[++top] = i;
    }
}

int main(void) {
    int a[] = {2, 1, 2, 4, 3, 8};
    int out[6];
    nextGreater(a, 6, out);
    printf("nge:");
    for (int i = 0; i < 6; i++) printf(" %d", out[i]);
    printf("\n");
    return 0;
}
```
