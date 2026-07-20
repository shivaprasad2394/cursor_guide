---
id: "q123-subsets-backtracking"
title: "Subsets (Backtracking)"
pattern: "backtracking"
difficulty: "medium"
visualization: "generic"
vizCategory: "dsa"
stdin: ""
expectedOutput: "subsetCount=8\n"
tape: 1,2,3
---
## At a glance

- **Goal:** Subsets (Backtracking)
- **Pattern:** Backtracking
- **Expected output:** `subsetCount=8`

## Before you start

Read [Backtracking primer](dsa-guide.html#backtracking). Try a choice, recurse, then undo — like exploring a decision tree.

Full guide: [DSA Primer](dsa-guide.html#backtracking)

## How to think

Each element is include or skip. Recurse from `start`: count current subset, then loop `i` from start and recurse with `i+1` after picking index i.

## Diagram

```text
3 elements → 2³ = 8 subsets including empty set
```

## C walkthrough

```text
step1: helper(start): increment global count
step2: for i from start to n-1: helper(i+1)
step3: return count from helper(0)
```

## Description

Count all subsets of `{1,2,3}` using backtracking. Empty set counts as one subset.

## Algorithm

```text
step1: cnt = 0
step2: helper(start): cnt++; for i from start to n-1: helper(i+1)
step3: return cnt
```

## Example Trace

```text
{1,2,3} → {}, {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3} → 8
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
    int a[] = {1, 2, 3};
    printf("subsetCount=%d\n", countSubsets(a, 3));
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

static void subsetCountR(const int nums[], int n, int start, int *cnt) {
    (*cnt)++;
    for (int i = start; i < n; i++)
        subsetCountR(nums, n, i + 1, cnt);
}

int countSubsets(const int nums[], int n) {
    int cnt = 0;
    subsetCountR(nums, n, 0, &cnt);
    return cnt;
}

int main(void) {
    int a[] = {1, 2, 3};
    printf("subsetCount=%d\n", countSubsets(a, 3));
    return 0;
}
```
