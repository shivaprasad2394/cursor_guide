---
id: "q33-single-non-repeating-element-xor"
title: "Single Non-Repeating Element (XOR)"
pattern: "xor cancel"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "single=%d\\n"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "single=4\n"
---
## At a glance

- **Goal:** Single Non-Repeating Element (XOR)
- **Pattern:** Xor cancel
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `single=4`

## Description

Every element appears exactly twice except one. Find the unique one.

**Walkthrough hint:**

arr = [4, 1, 2, 1, 2]

## Algorithm

```text
step1: Initialize result = 0
step2: XOR every element into result
step3: Duplicates cancel (a^a=0), unique survives (x^0=x)
```

## Example Trace

```text
arr = [4, 1, 2, 1, 2]
  0 ^ 4 = 4
  4 ^ 1 = 5
  5 ^ 2 = 7
  7 ^ 1 = 6   (1 cancels)
  6 ^ 2 = 4   (2 cancels)
  Result: 4
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
    int a[]={
    4,1,2,1,2};
    printf("single=%d\n", findSingle(a,5));
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

int findSingle(const int arr[], int n) {
    int result = 0;
    for (int i = 0; i < n; i++) result ^= arr[i];
    return result;
}

int main(void) {
    int a[]={4,1,2,1,2}; printf("single=%d\n", findSingle(a,5));
    return 0;
}
```
