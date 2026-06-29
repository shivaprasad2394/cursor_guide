---
id: "q19-majority-element-boyer-moore-voting"
title: "Majority Element (Boyer-Moore Voting)"
pattern: "single pass greedy (vote + verify)"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "majority=2\n"
---

## Description

Find the element that appears MORE than n/2 times.

## Algorithm

```text
PHASE 1 (candidate selection):
  step1: candidate=0, count=0
  step2: For each element:
         - if count==0: candidate = arr[i], count = 1
         - else if arr[i]==candidate: count++
         - else: count--

PHASE 2 (verification - MANDATORY):
  step3: Count actual occurrences of candidate
  step4: If count > n/2, return candidate. Else return -1.
```

## Example Trace

```text
arr = [2, 2, 1, 1, 1, 2, 2]
  Phase 1: candidate ends as 2 (count survives)
  Phase 2: count of 2 = 4, n/2 = 3, 4 > 3 -> majority IS 2
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
    2,2,1,1,1,2,2};
    printf("majority=%d\n", findMajority(a,7));
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

int findMajority(const int arr[], int n) {
    int candidate = 0, count = 0;
    for (int i = 0; i < n; i++) {
        if (count == 0) { candidate = arr[i]; count = 1; }
        else if (arr[i] == candidate) count++;
        else count--;
    }
    count = 0;
    for (int i = 0; i < n; i++) if (arr[i] == candidate) count++;
    return (count > n / 2) ? candidate : -1;
}

int main(void) {
    int a[]={2,2,1,1,1,2,2}; printf("majority=%d\n", findMajority(a,7));
    return 0;
}
```
