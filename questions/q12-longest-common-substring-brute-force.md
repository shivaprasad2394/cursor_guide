---
id: "q12-longest-common-substring-brute-force"
title: "Longest Common Substring (brute force)"
pattern: "strings"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(m * n * min(m,n)) time, O(result) space"
expectedOutput: |
  LCS substr=cd
---

## Description

Longest Common Substring (brute force)

## Algorithm

```text
step1: For every pair (i, j) where i is index in str1, j in str2
step2: Count how many consecutive characters match starting at (i, j)
step3: Track the maximum match length and its starting index
step4: Extract the result substring
```

## Example Trace

```text
a="abcdfgh", b="zcdemgh"
  i=2,j=1: a[2]='c'==b[1]='c', a[3]='d'==b[2]='d', a[4]='f'!=b[3]='e'
  Match length = 2 ("cd") -> new max
  Result: "cd"
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
    char *r=longestCommonSubstring("abcdfgh","zcdemgh");
    printf("LCS substr=%s\n", r);
    free(r);
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

char *longestCommonSubstring(const char *a, const char *b) {
    int m = (int)strlen(a), n = (int)strlen(b);
    int maxLen = 0, startIdx = 0;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            int len = 0;
            while (i + len < m && j + len < n && a[i + len] == b[j + len])
                len++;
            if (len > maxLen) { maxLen = len; startIdx = i; }
        }
    }
    char *res = (char *)malloc((size_t)(maxLen + 1));
    if (res == NULL) return NULL;
    memcpy(res, a + startIdx, (size_t)maxLen);
    res[maxLen] = '\0';
    return res;                       /* CALLER MUST free() */
}

int main(void) {
    char *r=longestCommonSubstring("abcdfgh","zcdemgh"); printf("LCS substr=%s\n", r); free(r);
    return 0;
}
```
