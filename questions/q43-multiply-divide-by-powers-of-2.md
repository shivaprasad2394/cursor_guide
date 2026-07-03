---
id: "q43-multiply-divide-by-powers-of-2"
title: "Multiply / Divide by Powers of 2"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "5*8=%d 40/4=%d\\n"
stdin: ""
expectedOutput: "5*8=40 40/4=10\n"
---
## At a glance

- **Goal:** Multiply / Divide by Powers of 2
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `5*8=40 40/4=10`

## Description

Implement **Multiply / Divide by Powers of 2** using the pattern above. Write the helper function(s); `main()` is provided.

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("5*8=%d 40/4=%d\n", mul2k(5,3), div2k(40,2));
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

int mul2k(int n, int k) { return n << k; }

int div2k(int n, int k) { return n >> k; }

int main(void) {
    printf("5*8=%d 40/4=%d\n", mul2k(5,3), div2k(40,2));
    return 0;
}
```
