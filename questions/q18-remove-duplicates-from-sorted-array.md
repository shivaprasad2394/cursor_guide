---
id: "q18-remove-duplicates-from-sorted-array"
title: "Remove Duplicates from Sorted Array"
pattern: "two-pointer (slow/fast)"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  removeDups: 1 2 3 4
---

## Description

Given a SORTED array, remove duplicates in-place. Return new length.

## Algorithm

```text
step1: slow = 0 (tracks tail of unique prefix)
step2: fast walks from 1 to n-1:
       - if arr[fast] != arr[slow]: slow++, copy arr[fast] to arr[slow]
step3: Return slow + 1 (length, not index)
```

## Example Trace

```text
arr = [1, 1, 2, 2, 3, 4, 4]
  fast=1: arr[1]=1 == arr[0]=1 -> skip
  fast=2: arr[2]=2 != arr[0]=1 -> slow=1, arr[1]=2
  fast=3: arr[3]=2 == arr[1]=2 -> skip
  fast=4: arr[4]=3 != arr[1]=2 -> slow=2, arr[2]=3
  fast=5: arr[5]=4 != arr[2]=3 -> slow=3, arr[3]=4
  fast=6: arr[6]=4 == arr[3]=4 -> skip
  Result: new length = 3+1 = 4, arr = [1,2,3,4,...]
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
    1,1,2,2,3,4,4};
    int n=removeDuplicates(a,7);
    printf("removeDups: ");
    pr(a,n);
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

int removeDuplicates(int arr[], int n) {
    if (n == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < n; fast++) {
        if (arr[fast] != arr[slow]) {
            slow++;
            arr[slow] = arr[fast];
        }
    }
    return slow + 1;
}

int main(void) {
    int a[]={1,1,2,2,3,4,4}; int n=removeDuplicates(a,7); printf("removeDups: "); pr(a,n);
    return 0;
}
```
