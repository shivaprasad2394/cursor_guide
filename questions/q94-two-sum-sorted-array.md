---
id: "q94-two-sum-sorted-array"
title: "Two Sum (sorted array, two-pointer)"
pattern: "two-pointer (opposite ends)"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "twoSum([2,7,11,15],9) -> 0,1\n"
---
## At a glance

- **Goal:** Two Sum (sorted array, two-pointer)
- **Pattern:** Two-pointer (opposite ends)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `twoSum([2,7,11,15],9) -> 0,1`

## Description

Given a **sorted** array and a target, return indices of two numbers that add up to target (classic FAANG warm-up).

**Walkthrough hint:**

arr = [2, 7, 11, 15], target = 9 → indices 0 and 1

## Algorithm

```text
step1: left = 0, right = n - 1
step2: While left < right: sum = arr[left] + arr[right]
step3: If sum == target, return left and right
step4: If sum < target, left++; else right--
step5: Return -1 if no pair found
```

## Example Trace

```text
arr = [2, 7, 11, 15], target = 9
  left=0, right=3: 2+15=17 > 9 → right--
  left=0, right=2: 2+11=13 > 9 → right--
  left=0, right=1: 2+7=9  → FOUND (0, 1)
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
    int a[] = {
        2, 7, 11, 15
    }
    int i, j;
    if (twoSum(a, 4, 9, &i, &j))
            printf("twoSum([2,7,11,15],9) -> %d,%d\n", i, j);
    else
            printf("no pair\n");
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
int twoSum(const int arr[], int n, int target, int *i, int *j) {
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) { *i = left; *j = right; return 1; }
        if (sum < target) left++;
        else right--;
    }
    return 0;
}

int main(void) {
    int a[] = {
        2, 7, 11, 15
    }
    int i, j;
    if (twoSum(a, 4, 9, &i, &j))
            printf("twoSum([2,7,11,15],9) -> %d,%d\n", i, j);
    else
            printf("no pair\n");
    return 0;
}
```
