---
id: "q27-set-clear-toggle-check-bit"
title: "Set / Clear / Toggle / Check Bit"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "set bit1 of 12=%u\\n"
stdin: ""
expectedOutput: "set bit1 of 12=14\nclear bit2 of 12=8\ntoggle bit1 of 12=14\ncheck bit2 of 12=1\n"
---
## At a glance

- **Goal:** Set / Clear / Toggle / Check Bit
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `set bit1 of 12=14`

## Description

Implement **Set / Clear / Toggle / Check Bit** using a **0-based** bit index (`pos == 0` is the least-significant bit). The helpers use unsigned values and treat an out-of-range index as a no-op (or false for `checkBit`).

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("set bit1 of 12=%u\n",setBit(12u,1u));
    printf("clear bit2 of 12=%u\n",clearBit(12u,2u));
    printf("toggle bit1 of 12=%u\n",toggleBit(12u,1u));
    printf("check bit2 of 12=%d\n",checkBit(12u,2u));
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

static int validBitIndex(unsigned int pos) {
    return pos < sizeof(unsigned int) * CHAR_BIT;
}

unsigned int setBit(unsigned int n, unsigned int pos) {
    return validBitIndex(pos) ? n | (1u << pos) : n;
}

unsigned int clearBit(unsigned int n, unsigned int pos) {
    return validBitIndex(pos) ? n & ~(1u << pos) : n;
}

unsigned int toggleBit(unsigned int n, unsigned int pos) {
    return validBitIndex(pos) ? n ^ (1u << pos) : n;
}

int checkBit(unsigned int n, unsigned int pos) {
    return validBitIndex(pos) ? (int)((n >> pos) & 1u) : 0;
}

int main(void) {
    printf("set bit1 of 12=%u\n",setBit(12u,1u));
    printf("clear bit2 of 12=%u\n",clearBit(12u,2u));
    printf("toggle bit1 of 12=%u\n",toggleBit(12u,1u));
    printf("check bit2 of 12=%d\n",checkBit(12u,2u));
    return 0;
}
```
