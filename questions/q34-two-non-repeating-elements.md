---
id: "q34-two-non-repeating-elements"
title: "Two Non-Repeating Elements"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  two uniques=7,9
---

## Description

Every element appears twice except TWO distinct elements a and b. Find both.

## Algorithm

```text
step1: XOR everything -> result = a ^ b (nonzero since a != b)
step2: Find any set bit in result. Easiest: diffBit = x & -x
       This bit is where a and b DIFFER
step3: Partition array by that bit:
       - Group1 (bit set): XOR all -> gives a
       - Group2 (bit clear): XOR all -> gives b
       Pairs within each group still cancel out
```

## Example Trace

```text
arr = [2, 3, 7, 9, 11, 2, 3, 11]
  XOR all = 7 ^ 9 = 14 = 1110
  diffBit = 14 & -14 = 2 = 0010
  Group1 (bit 1 set): {2,3,7,2,3} -> XOR = 7
  Group2 (bit 1 clear): {9,11,11} -> XOR = 9
  Result: 7 and 9
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
    2,3,7,9,11,2,3,11},x,y;
    findTwoUniques(a,8,&x,&y);
    printf("two uniques=%d,%d\n",x,y);
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

void findTwoUniques(const int arr[], int n, int *a, int *b) {
    int x = 0;
    for (int i = 0; i < n; i++) x ^= arr[i];
    int diffBit = x & -x;
    int g1 = 0, g2 = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] & diffBit) g1 ^= arr[i];
        else                  g2 ^= arr[i];
    }
    *a = g1; *b = g2;
}

int main(void) {
    int a[]={2,3,7,9,11,2,3,11},x,y; findTwoUniques(a,8,&x,&y); printf("two uniques=%d,%d\n",x,y);
    return 0;
}
```
