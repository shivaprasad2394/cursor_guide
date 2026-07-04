---
id: "q95-contains-duplicate"
title: "Contains Duplicate"
pattern: "frequency table (boolean variant)"
difficulty: "easy"
visualization: "generic"
vizCategory: "arrays"
stdin: ""
complexity: "O(n) time, O(n) space"
expectedOutput: "containsDuplicate([1,2,3,1])=1\\ncontainsDuplicate([1,2,3,4])=0\\n"
---
## At a glance

- **Goal:** Contains Duplicate
- **Pattern:** Frequency table (boolean variant)
- **Complexity:** O(n) time, O(n) space
- **Expected output:** `containsDuplicate([1,2,3,1])=1\ncontainsDuplicate([1,2,3,4])=0\n`

## Description

Return true if any value appears at least twice in the array.

**Walkthrough hint:**

arr = [1, 2, 3, 1] → duplicate exists

## Algorithm

```text
step1: Create a seen[] table (or hash set)
step2: For each element arr[i]:
step3:   If already seen, return 1 (true)
step4:   Mark arr[i] as seen
step5: Return 0 (false) if loop finishes
```

## Example Trace

```text
arr = [1, 2, 3, 1]
  i=0: seen[1]=false → mark seen
  i=1: seen[2]=false → mark seen
  i=2: seen[3]=false → mark seen
  i=3: seen[1]=true  → DUPLICATE FOUND
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
        int a1[] = {1, 2, 3, 1}, a2[] = {1, 2, 3, 4};
        printf("containsDuplicate([1,2,3,1])=%d\n", containsDuplicate(a1, 4));
        printf("containsDuplicate([1,2,3,4])=%d\n", containsDuplicate(a2, 4));
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
int containsDuplicate(const int arr[], int n) {
    int seen[100001] = {0};
    for (int i = 0; i < n; i++) {
        if (seen[arr[i] + 50000]) return 1;
        seen[arr[i] + 50000] = 1;
    }
    return 0;
}

int main(void) {
        int a1[] = {1, 2, 3, 1}, a2[] = {1, 2, 3, 4};
        printf("containsDuplicate([1,2,3,1])=%d\n", containsDuplicate(a1, 4));
        printf("containsDuplicate([1,2,3,4])=%d\n", containsDuplicate(a2, 4));
    return 0;
}
```
