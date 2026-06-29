---
id: "q82-parse-three-integers-from-a-string-sscanf-basics"
title: "Parse three integers from a string (sscanf basics)"
pattern: "parsing"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: |
  matched=3 -> 10,20,30
---

## Description

Extract structured numbers out of a text line into variables.

## Algorithm

```text
step1: call sscanf(str, "%d %d %d", &a, &b, &c)
step2: check the return value == 3 (all three matched)
step3: if fewer matched, the input was malformed
```

## Example Trace

```text
str = "10 20 30"
  sscanf matches 3 items -> a=10, b=20, c=30, returns 3

str = "10 xx 30"
  sscanf matches only "10", stops at "xx" -> returns 1 (malformed)
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
    int a,b,c;
    int n=parseThreeInts("10 20 30",&a,&b,&c);
    printf("matched=%d -> %d,%d,%d\n",n,a,b,c);
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

int parseThreeInts(const char *str, int *a, int *b, int *c) {
    int matched = sscanf(str, "%d %d %d", a, b, c);
    return matched;                       /* caller checks == 3 */
}

int main(void) {
    int a,b,c; int n=parseThreeInts("10 20 30",&a,&b,&c); printf("matched=%d -> %d,%d,%d\n",n,a,b,c);
    return 0;
}
```
