---
id: "q86-safe-string-building-with-snprintf-no-overflow"
title: "Safe string building with snprintf (no overflow)"
pattern: "parsing"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: "rc=0 buf=User: Alice (age 30)\n"
---

## Description

Build a formatted string into a fixed buffer WITHOUT ever overflowing it.

## Algorithm

```text
step1: snprintf(buf, size, fmt, ...) writes at most size-1 chars + '\0'
step2: it returns how many chars it WOULD have written
step3: if return value >= size, output was TRUNCATED -> handle it
```

## Example Trace

```text
buffer size 20, formatting "User: Alice (age 30)"
  fits -> returns 20-ish, no truncation
  tiny buffer -> returns full length, output truncated, still safe
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
    char buf[40];
    int rc=buildUserString(buf,sizeof buf,"Alice",30);
    printf("rc=%d buf=%s\n",rc,buf);
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

int buildUserString(char *buf, size_t size, const char *name, int age) {
    int n = snprintf(buf, size, "User: %s (age %d)", name, age);
    /* n = number of chars that WOULD be written (excluding '\0') */
    if (n < 0) return -1;                 /* encoding error */
    if ((size_t)n >= size) return 1;      /* truncated (output too long) */
    return 0;                             /* success, fully written */
}

int main(void) {
    char buf[40]; int rc=buildUserString(buf,sizeof buf,"Alice",30); printf("rc=%d buf=%s\n",rc,buf);
    return 0;
}
```
