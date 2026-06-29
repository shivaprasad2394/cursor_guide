---
id: "q15-move-all-zeros-to-end"
title: "Move All Zeros to End"
pattern: "two-pointer (read/write)"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "moveZeros: 1 3 12 0 0\n"
---

## Description

Move all 0s to the end while maintaining relative order of non-zeros.

## Algorithm

```text
step1: Use a write-index 'w' starting at 0
step2: Walk the array with read-index 'r':
       - if arr[r] != 0: copy arr[r] to arr[w], then w++
step3: After the loop, fill arr[w..n-1] with zeros
```

## Example Trace

```text
arr = [0, 1, 0, 3, 12]
  r=0: arr[0]=0, skip
  r=1: arr[1]=1, copy to arr[0], w=1 -> [1, 1, 0, 3, 12]
  r=2: arr[2]=0, skip
  r=3: arr[3]=3, copy to arr[1], w=2 -> [1, 3, 0, 3, 12]
  r=4: arr[4]=12, copy to arr[2], w=3 -> [1, 3, 12, 3, 12]
  Fill w=3 to n-1 with 0: [1, 3, 12, 0, 0]
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
    0,1,0,3,12};
    moveZerosToEnd(a,5);
    printf("moveZeros: ");
    pr(a,5);
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

void moveZerosToEnd(int arr[], int n) {
    int w = 0;
    for (int r = 0; r < n; r++) {
        if (arr[r] != 0) arr[w++] = arr[r];
    }
    while (w < n) arr[w++] = 0;
}

int main(void) {
    int a[]={0,1,0,3,12}; moveZerosToEnd(a,5); printf("moveZeros: "); pr(a,5);
    return 0;
}
```
