---
id: "q20-missing-number-in-0-n-xor-method"
title: "Missing Number in 0..n (XOR method)"
pattern: "xor cancel"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "missing in 0..3=%d\\n"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "missing in 0..3=2\n"
---
## At a glance

- **Goal:** Missing Number in 0..n (XOR method)
- **Pattern:** Xor cancel
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `missing in 0..3=2`

## Description

Given n distinct numbers from {0, 1, ..., n}, find the missing one.

**Walkthrough hint:**

arr = [3, 0, 1], n = 3 (should have 0,1,2,3)

## Algorithm

```text
step1: XOR all values 0 to n together
step2: XOR all array elements together
step3: XOR the two results -> missing number
Why: a^a=0, so all duplicates cancel; the missing one survives
```

## Example Trace

```text
arr = [3, 0, 1], n = 3 (should have 0,1,2,3)
  XOR(0..3) = 0^1^2^3 = 0
  XOR(arr)  = 3^0^1   = 2
  0 ^ 2 = 2 -> missing is 2
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
        3,0,1
    };
    printf("missing in 0..3=%d\n", findMissing(a,3));
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

int findMissing(const int arr[], int n) {
    int x = 0;
    for (int i = 0; i <= n; i++) x ^= i;
    for (int i = 0;  i < n; i++) x ^= arr[i];
    return x;
}

int main(void) {
    int a[]={
        3,0,1
    };
    printf("missing in 0..3=%d\n", findMissing(a,3));
    return 0;
}
```
