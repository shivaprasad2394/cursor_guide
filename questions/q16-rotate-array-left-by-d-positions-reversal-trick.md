---
id: "q16-rotate-array-left-by-d-positions-reversal-trick"
title: "Rotate Array Left by d Positions (reversal trick)"
pattern: "reversal trick (three reverses)"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  rotateLeft2: 3 4 5 6 7 1 2
---

## Description

Shift all elements left by d positions. Elements that fall off the left end wrap around to the right.

## Algorithm

```text
step1: Normalize d = d % n (handles d > n)
step2: Reverse first d elements:     [2,1,3,4,5,6,7]
step3: Reverse remaining n-d elems:  [2,1,7,6,5,4,3]
step4: Reverse the entire array:     [3,4,5,6,7,1,2]
```

## Example Trace

```text
[1,2,3,4,5,6,7] d=2 -> [3,4,5,6,7,1,2]

arr = [1,2,3,4,5,6,7], d=2
  After rev(0..1):  [2,1,3,4,5,6,7]
  After rev(2..6):  [2,1,7,6,5,4,3]
  After rev(0..6):  [3,4,5,6,7,1,2]  <- correct!
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
    1,2,3,4,5,6,7};
    rotateLeft(a,7,2);
    printf("rotateLeft2: ");
    pr(a,7);
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

static void pr(const int*a,int n){for(int i=0;i<n;i++)printf("%d ",a[i]);printf("\n");}
static void revArr(int a[], int i, int j) {
    while (i < j) { int t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
}

void rotateLeft(int arr[], int n, int d) {
    if (n == 0) return;
    d %= n;                            /* handle d > n */
    if (d == 0) return;                /* no rotation needed */
    revArr(arr, 0, d - 1);            /* reverse first d */
    revArr(arr, d, n - 1);            /* reverse rest */
    revArr(arr, 0, n - 1);            /* reverse whole */
}

int main(void) {
    int a[]={1,2,3,4,5,6,7}; rotateLeft(a,7,2); printf("rotateLeft2: "); pr(a,7);
    return 0;
}
```
