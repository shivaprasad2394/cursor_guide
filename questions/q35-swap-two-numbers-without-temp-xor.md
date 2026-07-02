---
id: "q35-swap-two-numbers-without-temp-xor"
title: "Swap Two Numbers Without Temp (XOR)"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "after swap a=10 b=5\n"
---
## At a glance

- **Goal:** Swap Two Numbers Without Temp (XOR)
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `after swap a=10 b=5`

## Description

Implement **Swap Two Numbers Without Temp (XOR)** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
*a ^= *b  -- a now holds a^b
*b ^= *a  -- b = b^(a^b) = a  (original a)
*a ^= *b  -- a = (a^b)^a = b  (original b)
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
    int a=5,b=10;
    swapXOR(&a,&b);
    printf("after swap a=%d b=%d\n",a,b);
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

void swapXOR(int *a, int *b) {
    if (a == b) return;
    *a ^= *b;
    *b ^= *a;
    *a ^= *b;
}

int main(void) {
    int a=5,b=10; swapXOR(&a,&b); printf("after swap a=%d b=%d\n",a,b);
    return 0;
}
```
