---
id: "q26-heap-sort"
title: "Heap Sort"
pattern: "arrays"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "heapSort: "
stdin: ""
complexity: "O(n log n) time, O(1) space"
expectedOutput: "heapSort: 5 6 7 11 12 13\n"
---
## At a glance

- **Goal:** Heap Sort
- **Pattern:** Arrays
- **Complexity:** O(n log n) time, O(1) space
- **Expected output:** `heapSort: 5 6 7 11 12 13`

## Description

Implement **Heap Sort** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: Build a max-heap from the array (bottom-up, starting at n/2-1)
  step2: Repeatedly:
         - Swap root (max) with last unsorted element
         - Shrink heap by 1
         - Heapify the root to restore max-heap property

Children of node i: left = 2*i+1, right = 2*i+2
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
    12,11,13,5,6,7};
    heapSort(a,6);
    printf("heapSort: ");
    pr(a,6);
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
static void heapify(int arr[], int n, int root) {
    int largest = root;
    int left    = 2 * root + 1;
    int right   = 2 * root + 2;
    if (left  < n && arr[left]  > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != root) {
        int t = arr[root]; arr[root] = arr[largest]; arr[largest] = t;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int t = arr[0]; arr[0] = arr[i]; arr[i] = t;
        heapify(arr, i, 0);
    }
}

int main(void) {
    int a[]={12,11,13,5,6,7}; heapSort(a,6); printf("heapSort: "); pr(a,6);
    return 0;
}
```
