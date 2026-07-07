---
id: "q21-reverse-array-in-groups-of-k"
title: "Reverse Array in Groups of k"
pattern: "arrays"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "revGroups3: "
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "revGroups3: 3 2 1 6 5 4 9 8 7\n"
---
## At a glance

- **Goal:** Reverse Array in Groups of k
- **Pattern:** Arrays
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `revGroups3: 3 2 1 6 5 4 9 8 7`

## Description

Implement **Reverse Array in Groups of k** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

arr = [1,2,3,4,5,6,7,8,9], k=3

## Algorithm

```text
step1: Walk array in strides of k (i=0, i+=k)
step2: For each stride, reverse from i to min(i+k-1, n-1)
       (last group may have fewer than k elements)
```

## Example Trace

```text
arr = [1,2,3,4,5,6,7,8,9], k=3
  i=0: reverse [0..2]: [3,2,1, 4,5,6, 7,8,9]
  i=3: reverse [3..5]: [3,2,1, 6,5,4, 7,8,9]
  i=6: reverse [6..8]: [3,2,1, 6,5,4, 9,8,7]
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
        1,2,3,4,5,6,7,8,9
    }
    reverseInGroups(a,9,3);
    printf("revGroups3: ");
    pr(a,9);
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

static void pr(const int*a,int n){for (int i=0;i<n;i++)printf("%d ",a[i]);printf("\n");}
static void revArr(int a[], int i, int j) {
    while (i < j) { int t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
}

void reverseInGroups(int arr[], int n, int k) {
    if (k <= 1) return;
    for (int i = 0; i < n; i += k) {
        int end = (i + k - 1 < n) ? i + k - 1 : n - 1;
        revArr(arr, i, end);
    }
}

int main(void) {
    int a[]={
        1,2,3,4,5,6,7,8,9
    }
    reverseInGroups(a,9,3);
    printf("revGroups3: ");
    pr(a,9);
    return 0;
}
```
