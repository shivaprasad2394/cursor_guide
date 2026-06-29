---
id: "q23-binary-search-iterative"
title: "Binary Search (iterative)"
pattern: "arrays"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(log n) time, O(1) space Precondition: array MUST be sorted"
expectedOutput: "binSearch(7)=3\n"
---

## Description

Binary Search (iterative)

## Algorithm

```text
step1: left=0, right=n-1
step2: While left <= right:
       - mid = left + (right-left)/2
       - if arr[mid] == target: return mid
       - if arr[mid] < target:  search right half (left = mid+1)
       - if arr[mid] > target:  search left half (right = mid-1)
step3: Return -1 (not found)
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
    1,3,5,7,9,11};
    printf("binSearch(7)=%d\n", binarySearch(a,6,7));
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

int binarySearch(const int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if      (arr[mid] == target) return mid;
        else if (arr[mid] <  target) left  = mid + 1;
        else                         right = mid - 1;
    }
    return -1;
}

int main(void) {
    int a[]={1,3,5,7,9,11}; printf("binSearch(7)=%d\n", binarySearch(a,6,7));
    return 0;
}
```
