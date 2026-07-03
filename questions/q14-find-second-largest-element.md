---
id: "q14-find-second-largest-element"
title: "Find Second Largest Element"
pattern: "single pass (two trackers)"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "2nd largest=%d\\n"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "2nd largest=34\n"
---
## At a glance

- **Goal:** Find Second Largest Element
- **Pattern:** Single pass (two trackers)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `2nd largest=34`

## Description

Find the second largest distinct value in an array.

**Walkthrough hint:**

arr = [12, 35, 1, 10, 34, 1]

## Algorithm

```text
step1: Initialize first = INT_MIN, second = INT_MIN
step2: Walk the array once:
       - if arr[i] > first: second = first, first = arr[i]
       - else if arr[i] > second AND arr[i] != first: second = arr[i]
step3: Return second (or -1 if not found)
```

## Example Trace

```text
arr = [12, 35, 1, 10, 34, 1]
  i=0: 12 > INT_MIN -> second=INT_MIN, first=12
  i=1: 35 > 12      -> second=12, first=35
  i=2: 1 < 12       -> skip
  i=3: 10 < 12      -> skip
  i=4: 34 > 12      -> second=34  (34 > second=12 AND 34 != first=35)
  Result: second = 34
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
    12,35,1,10,34,1};
    printf("2nd largest=%d\n", findSecondLargest(a,6));
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

int findSecondLargest(const int arr[], int n) {
    int first = INT_MIN, second = INT_MIN;
    for (int i = 0; i < n; i++) {
        if (arr[i] > first) {
            second = first;        /* old first becomes second */
            first  = arr[i];       /* new first */
        } else if (arr[i] > second && arr[i] != first) {
            second = arr[i];
        }
    }
    return (second == INT_MIN) ? -1 : second;
}

int main(void) {
    int a[]={12,35,1,10,34,1}; printf("2nd largest=%d\n", findSecondLargest(a,6));
    return 0;
}
```
