---
id: "q03-longest-palindromic-substring-expand-around-center"
title: "Longest Palindromic Substring (expand around center)"
pattern: "expand from center"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n^2) time, O(1) space"
expectedOutput: |
  LPS(babad)="bab" len 3
---

## Description

Find the longest substring that reads the same forwards and backwards.

## Algorithm

```text
step1: For each index i in the string, treat it as the CENTER of a palindrome
step2: Expand outward (left--, right++) as long as chars match
step3: Check BOTH odd-length centers (i,i) and even-length centers (i,i+1)
step4: Track the longest palindrome found (start index + length)
```

## Example Trace

```text
"babad" -> "bab" or "aba" (length 3).

str = "babad"
  i=0: center 'b' -> expand: "b" (len 1)
  i=1: center 'a' -> expand: "a"->"bab" (len 3, NEW MAX)
  i=2: center 'b' -> expand: "b"->"aba" (len 3, ties)
  i=3: center 'a' -> expand: "a" (len 1)
  i=4: center 'd' -> expand: "d" (len 1)
  Result: start=0, length=3 -> "bab"
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
    int s,l;
    longestPalindrome("babad",&s,&l);
    printf("LPS(babad)=\"%.*s\" len %d\n", l, "babad"+s, l);
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

void longestPalindrome(const char *s, int *outStart, int *outLen) {
    int n = (int)strlen(s);
    if (n == 0) { *outStart = 0; *outLen = 0; return; }  /* edge: empty string */
    int maxLen = 1, start = 0;

    for (int i = 0; i < n; i++) {
        /* Odd-length: center at i */
        int lo = i, hi = i;
        while (lo >= 0 && hi < n && s[lo] == s[hi]) {
            if (hi - lo + 1 > maxLen) { start = lo; maxLen = hi - lo + 1; }
            lo--; hi++;
        }
        /* Even-length: center between i and i+1 */
        lo = i; hi = i + 1;
        while (lo >= 0 && hi < n && s[lo] == s[hi]) {
            if (hi - lo + 1 > maxLen) { start = lo; maxLen = hi - lo + 1; }
            lo--; hi++;
        }
    }
    *outStart = start;
    *outLen   = maxLen;
}

int main(void) {
    int s,l; longestPalindrome("babad",&s,&l); printf("LPS(babad)=\"%.*s\" len %d\n", l, "babad"+s, l);
    return 0;
}
```
