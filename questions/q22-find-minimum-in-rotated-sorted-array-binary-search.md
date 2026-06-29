---
id: "q22-find-minimum-in-rotated-sorted-array-binary-search"
title: "Find Minimum in Rotated Sorted Array (binary search)"
pattern: "binary search"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(log n) time, O(1) space"
expectedOutput: "minRotated=0\n"
---

## Description

A sorted array has been rotated at an unknown pivot. Find the minimum element in O(log n).

## Algorithm

```text
step1: left=0, right=n-1
step2: While left < right:
       - mid = left + (right-left)/2  (overflow-safe!)
       - if arr[mid] > arr[right]: min is in RIGHT half -> left = mid + 1
       - else: min is mid or in LEFT half -> right = mid
step3: Return arr[left]
```

## Example Trace

```text
arr = [4, 5, 6, 7, 0, 1, 2]
  left=0, right=6, mid=3: arr[3]=7 > arr[6]=2 -> left=4
  left=4, right=6, mid=5: arr[5]=1 < arr[6]=2 -> right=5
  left=4, right=5, mid=4: arr[4]=0 < arr[5]=1 -> right=4
  left==right==4 -> arr[4] = 0 = MINIMUM
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
    4,5,6,7,0,1,2};
    printf("minRotated=%d\n", findMinRotated(a,7));
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

int findMinRotated(const int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] > arr[right]) left  = mid + 1;
        else                       right = mid;
    }
    return arr[left];
}

int main(void) {
    int a[]={4,5,6,7,0,1,2}; printf("minRotated=%d\n", findMinRotated(a,7));
    return 0;
}
```
