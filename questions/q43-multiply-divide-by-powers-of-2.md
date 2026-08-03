---
id: "q43-multiply-divide-by-powers-of-2"
title: "Multiply / Divide by Powers of 2"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "5*8=%u 40/4=%u\\n"
stdin: ""
expectedOutput: "5*8=40 40/4=10\n"
---
## At a glance

- **Goal:** Multiply / Divide by Powers of 2
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `5*8=40 40/4=10`

## Description

Implement **Multiply / Divide by Powers of 2** for unsigned integers. A shift count outside the type width, or a multiplication that would exceed `UINT_MAX`, returns 0; division uses defined logical right shift.

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("5*8=%u 40/4=%u\n", mul2k(5u,3u), div2k(40u,2u));
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

unsigned int mul2k(unsigned int n, unsigned int k) {
    const unsigned int width = sizeof n * CHAR_BIT;
    if (k >= width || n > (UINT_MAX >> k)) return 0u;
    return n << k;
}

unsigned int div2k(unsigned int n, unsigned int k) {
    const unsigned int width = sizeof n * CHAR_BIT;
    return k < width ? n >> k : 0u;
}

int main(void) {
    printf("5*8=%u 40/4=%u\n", mul2k(5u,3u), div2k(40u,2u));
    return 0;
}
```
