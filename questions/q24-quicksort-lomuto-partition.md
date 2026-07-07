---
id: "q24-quicksort-lomuto-partition"
title: "Quicksort (Lomuto partition)"
pattern: "arrays"
difficulty: "medium"
visualization: "generic"
vizCategory: "arrays"
tape: "quickSort: "
stdin: ""
complexity: "O(n log n) average, O(n^2) worst (sorted input)"
expectedOutput: "quickSort: 1 5 7 8 9 10\n"
---
## At a glance

- **Goal:** Quicksort (Lomuto partition)
- **Pattern:** Arrays
- **Complexity:** O(n log n) average, O(n^2) worst (sorted input)
- **Expected output:** `quickSort: 1 5 7 8 9 10`

## Description

Implement **Quicksort (Lomuto partition)** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: Pick pivot = arr[high] (last element)
step2: Partition: walk j from low to high-1
       - if arr[j] <= pivot: swap arr[j] with arr[++i]
step3: Place pivot at arr[i+1] (its correct sorted position)
step4: Recurse on left partition (low..p-1) and right (p+1..high)
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
        10,7,8,9,1,5
    }
    quickSort(a,0,5);
    printf("quickSort: ");
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

static void pr(const int*a,int n){for (int i=0;i<n;i++)printf("%d ",a[i]);printf("\n");}
static void swapi(int *a, int *b) { int t = *a; *a = *b; *b = t; }
static int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) { i++; swapi(&arr[i], &arr[j]); }
    }
    swapi(&arr[i + 1], &arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int p = partition(arr, low, high);
        quickSort(arr, low, p - 1);
        quickSort(arr, p + 1, high);
    }
}

int main(void) {
    int a[]={
        10,7,8,9,1,5
    }
    quickSort(a,0,5);
    printf("quickSort: ");
    pr(a,6);
    return 0;
}
```
