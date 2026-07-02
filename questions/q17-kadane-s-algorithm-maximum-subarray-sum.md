---
id: "q17-kadane-s-algorithm-maximum-subarray-sum"
title: "Kadane's Algorithm (Maximum Subarray Sum)"
pattern: "single pass greedy (extend or restart)"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "kadane=7\n"
---
## At a glance

- **Goal:** Kadane's Algorithm (Maximum Subarray Sum)
- **Pattern:** Single pass greedy (extend or restart)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `kadane=7`

## Description

Find the contiguous subarray with the largest sum.

**Walkthrough hint:**

arr = [-2, -3, 4, -1, -2, 1, 5, -3]

## Algorithm

```text
step1: Initialize maxEndingHere = arr[0], maxSoFar = arr[0]
step2: For each element from index 1:
       - Decision: should I EXTEND the current subarray or START fresh?
       - maxEndingHere = max(arr[i], maxEndingHere + arr[i])
       - if maxEndingHere > maxSoFar: update maxSoFar
step3: Return maxSoFar
```

## Example Trace

```text
arr = [-2, -3, 4, -1, -2, 1, 5, -3]
  i=0: maxHere=-2, maxSoFar=-2
  i=1: maxHere=max(-3, -2+-3=-5)=-3, maxSoFar=-2
  i=2: maxHere=max(4, -3+4=1)=4, maxSoFar=4
  i=3: maxHere=max(-1, 4+-1=3)=3, maxSoFar=4
  i=4: maxHere=max(-2, 3+-2=1)=1, maxSoFar=4
  i=5: maxHere=max(1, 1+1=2)=2, maxSoFar=4
  i=6: maxHere=max(5, 2+5=7)=7, maxSoFar=7  <- NEW MAX
  i=7: maxHere=max(-3, 7+-3=4)=4, maxSoFar=7
  Result: 7 (subarray: [4,-1,-2,1,5])
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
    -2,-3,4,-1,-2,1,5,-3};
    printf("kadane=%d\n", kadane(a,8));
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

int kadane(const int arr[], int n) {
    if (n <= 0) return 0;              /* edge: empty array */
    int maxHere = arr[0];
    int maxSoFar = arr[0];
    for (int i = 1; i < n; i++) {
        int ext = maxHere + arr[i];
        maxHere = (arr[i] > ext) ? arr[i] : ext;
        if (maxHere > maxSoFar) maxSoFar = maxHere;
    }
    return maxSoFar;
}

int main(void) {
    int a[]={-2,-3,4,-1,-2,1,5,-3}; printf("kadane=%d\n", kadane(a,8));
    return 0;
}
```
