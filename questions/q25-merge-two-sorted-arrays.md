---
id: "q25-merge-two-sorted-arrays"
title: "Merge Two Sorted Arrays"
pattern: "arrays"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "merge: "
stdin: ""
complexity: "O(m+n) time, O(m+n) space"
expectedOutput: "merge: 1 2 3 4 5 6\n"
---
## At a glance

- **Goal:** Merge Two Sorted Arrays
- **Pattern:** Arrays
- **Complexity:** O(m+n) time, O(m+n) space
- **Expected output:** `merge: 1 2 3 4 5 6`

## Description

Implement **Merge Two Sorted Arrays** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: Use three pointers: i for a[], j for b[], k for out[]
step2: Compare a[i] and b[j], take the smaller one into out[k++]
step3: When one array is exhausted, copy the remainder of the other
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
    1,3,5},b[]={
    2,4,6},o[6];
    mergeSorted(a,3,b,3,o);
    printf("merge: ");
    pr(o,6);
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

void mergeSorted(const int a[], int m, const int b[], int n, int out[]) {
    int i = 0, j = 0, k = 0;
    while (i < m && j < n)
        out[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
    while (i < m) out[k++] = a[i++];
    while (j < n) out[k++] = b[j++];
}

int main(void) {
    int a[]={1,3,5},b[]={2,4,6},o[6]; mergeSorted(a,3,b,3,o); printf("merge: "); pr(o,6);
    return 0;
}
```
