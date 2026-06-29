---
id: "q10-check-if-t-is-a-subsequence-of-s"
title: "Check If t Is a Subsequence of s"
pattern: "two-pointer (merge walk)"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  isSubsequence(capgemini,cgm)=1
---

## Description

A subsequence is formed by deleting zero or more characters from a string WITHOUT changing the order of remaining characters.

## Algorithm

```text
step1: Use two pointers: i walks main string s, j walks subsequence t
step2: If s[i] == t[j]: match found, advance BOTH i and j
       If s[i] != t[j]: no match, advance ONLY i
step3: If j reaches end of t, ALL chars of t were matched -> return 1
       If i reaches end of s first -> return 0
```

## Example Trace

```text
"cgm" is a subsequence of "capgemini"

s="capgemini", t="cgm"
  i=0('c')==t[0]('c'): match! j=1, i=1
  i=1('a')!=t[1]('g'): skip, i=2
  i=2('p')!=t[1]('g'): skip, i=3
  i=3('g')==t[1]('g'): match! j=2, i=4
  i=4('e')!=t[2]('m'): skip, i=5
  i=5('m')==t[2]('m'): match! j=3
  j==3==strlen(t) -> ALL matched, return 1
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
    printf("isSubsequence(capgemini,cgm)=%d\n", isSubsequence("capgemini","cgm"));
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

int isSubsequence(const char *s, const char *t) {
    int i = 0, j = 0;
    int sLen = (int)strlen(s), tLen = (int)strlen(t);
    while (i < sLen && j < tLen) {
        if (s[i] == t[j]) j++;    /* match: advance subsequence pointer */
        i++;                      /* always advance main string pointer */
    }
    return j == tLen;             /* did we match ALL chars of t? */
}

int main(void) {
    printf("isSubsequence(capgemini,cgm)=%d\n", isSubsequence("capgemini","cgm"));
    return 0;
}
```
