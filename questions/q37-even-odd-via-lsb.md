---
id: "q37-even-odd-via-lsb"
title: "Even / Odd via LSB"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: |
  isEven(4)=1 isEven(7)=0
---

## Description

Even / Odd via LSB

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("isEven(4)=%d isEven(7)=%d\n", isEven(4), isEven(7));
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

int isEven(int n) { return (n & 1) == 0; }

int main(void) {
    printf("isEven(4)=%d isEven(7)=%d\n", isEven(4), isEven(7));
    return 0;
}
```
