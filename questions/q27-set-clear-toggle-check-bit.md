---
id: "q27-set-clear-toggle-check-bit"
title: "Set / Clear / Toggle / Check Bit"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "set bit1 of 12=14\nclear bit2 of 12=8\ntoggle bit1 of 12=14\ncheck bit2 of 12=1\n"
---

## Description

Set / Clear / Toggle / Check Bit

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("set bit1 of 12=%u\n",setBit(12,1));
    printf("clear bit2 of 12=%u\n",clearBit(12,2));
    printf("toggle bit1 of 12=%u\n",toggleBit(12,1));
    printf("check bit2 of 12=%d\n",checkBit(12,2));
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

unsigned int setBit    (unsigned int n, int pos) { return n |  (1u << pos); }

unsigned int clearBit  (unsigned int n, int pos) { return n & ~(1u << pos); }

unsigned int toggleBit (unsigned int n, int pos) { return n ^  (1u << pos); }

int          checkBit  (unsigned int n, int pos) { return (n >> pos) & 1;   }

int main(void) {
    printf("set bit1 of 12=%u\n",setBit(12,1)); printf("clear bit2 of 12=%u\n",clearBit(12,2)); printf("toggle bit1 of 12=%u\n",toggleBit(12,1)); printf("check bit2 of 12=%d\n",checkBit(12,2));
    return 0;
}
```
