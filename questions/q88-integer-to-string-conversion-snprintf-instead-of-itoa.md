---
id: "q88-integer-to-string-conversion-snprintf-instead-of-itoa"
title: "Integer to string conversion (snprintf instead of itoa)"
pattern: "parsing"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: "intToStr(-42)=-42\n"
---

## Description

C has no standard itoa(). snprintf is the portable, safe way to convert a number to its string form.

## Algorithm

```text
snprintf(buf, size, "%d", value)
```

## Example Trace

```text
42 -> "42",  -7 -> "-7"
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
    char b[16];
    intToStr(-42,b,sizeof b);
    printf("intToStr(-42)=%s\n",b);
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

void intToStr(int value, char *buf, size_t size) {
    snprintf(buf, size, "%d", value);
}

int main(void) {
    char b[16]; intToStr(-42,b,sizeof b); printf("intToStr(-42)=%s\n",b);
    return 0;
}
```
