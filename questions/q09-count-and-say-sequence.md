---
id: "q09-count-and-say-sequence"
title: "Count and Say Sequence"
pattern: "strings"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n * L) where L is the length of each term"
expectedOutput: |
  Term 5: 111221
---

## Description

Count and Say Sequence

## Algorithm

```text
step1: Start with cur = "1"
step2: For each term from 2 to n:
       - Read cur left to right, count consecutive identical digits
       - Build next string: write count followed by digit
       - Copy next into cur for the next iteration
step3: Print the final term
```

## Example Trace

```text
Building term 4 from term 3 ("21"):
  Read '2': count=1 -> write "12"
  Read '1': count=1 -> write "11"
  next = "1211"
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
    countAndSay(5);
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

void countAndSay(int n) {
    char cur[512] = "1";
    char nxt[512];

    for (int term = 2; term <= n; term++) {
        int len = (int)strlen(cur);
        int w = 0;
        for (int i = 0; i < len; ) {
            char ch = cur[i];
            int count = 1;
            while (i + count < len && cur[i + count] == ch) count++;
            w += sprintf(nxt + w, "%d%c", count, ch);
            i += count;
        }
        nxt[w] = '\0';
        strcpy(cur, nxt);
    }
    printf("Term %d: %s\n", n, cur);
}

int main(void) {
    countAndSay(5);
    return 0;
}
```
