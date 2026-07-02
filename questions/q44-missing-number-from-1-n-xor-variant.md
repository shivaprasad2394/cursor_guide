---
id: "q44-missing-number-from-1-n-xor-variant"
title: "Missing Number from 1..N (XOR variant)"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "missing 1..5=3\n"
---
## At a glance

- **Goal:** Missing Number from 1..N (XOR variant)
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `missing 1..5=3`

## Description

Implement **Missing Number from 1..N (XOR variant)** using the pattern above. Write the helper function(s); `main()` is provided.

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
    1,2,4,5};
    printf("missing 1..5=%d\n", findMissing1toN(a,5));
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

int findMissing1toN(const int arr[], int n) {
    int x = 0;
    for (int i = 1; i <= n; i++) x ^= i;
    for (int i = 0; i < n - 1; i++) x ^= arr[i];
    return x;
}

int main(void) {
    int a[]={1,2,4,5}; printf("missing 1..5=%d\n", findMissing1toN(a,5));
    return 0;
}
```
