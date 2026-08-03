---
id: "q39-bit-range-operations-set-clear-write-bits-in-start-end"
title: "Bit Range Operations (Set / Clear / Write bits in [start..end])"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "setRange[1..3] of 0=0x%X\\n"
stdin: ""
expectedOutput: "setRange[1..3] of 0=0xE\nclearRange[1..3] of 0xFF=0xF1\nwrite 5 into [1..3] of 0=0xA\n"
---
## At a glance

- **Goal:** Bit Range Operations (Set / Clear / Write bits in [start..end])
- **Pattern:** Bit manipulation
- **Complexity:** See algorithm
- **Expected output:** `setRange[1..3] of 0=0xE`

## Description

Implement **Bit Range Operations (Set / Clear / Write bits in [start..end])** with 0-based, inclusive indices. Invalid ranges (`start < 0`, `end < start`, or `end` outside the unsigned-int width) leave the register unchanged.

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    printf("setRange[1..3] of 0=0x%X\n", setBitsInRange(0,1,3));
    printf("clearRange[1..3] of 0xFF=0x%X\n", clearBitsInRange(0xFF,1,3));
    printf("write 5 into [1..3] of 0=0x%X\n", writeBitsInRange(0,1,3,5));
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

static int rangeMask(int start, int end, unsigned int *mask) {
    const int width = (int)(sizeof(unsigned int) * CHAR_BIT);
    if (mask == NULL || start < 0 || end < start || end >= width) return 0;

    const unsigned int nbits = (unsigned int)(end - start + 1);
    *mask = nbits == (unsigned int)width
        ? ~0u
        : ((1u << nbits) - 1u) << (unsigned int)start;
    return 1;
}

unsigned int setBitsInRange(unsigned int reg, int s, int e) {
    unsigned int mask;
    return rangeMask(s, e, &mask) ? reg | mask : reg;
}

unsigned int clearBitsInRange(unsigned int reg, int s, int e) {
    unsigned int mask;
    return rangeMask(s, e, &mask) ? reg & ~mask : reg;
}

unsigned int writeBitsInRange(unsigned int reg, int s, int e, unsigned int val) {
    unsigned int mask;
    if (!rangeMask(s, e, &mask)) return reg;
    val = (val << (unsigned int)s) & mask;
    return (reg & ~mask) | val;
}

int main(void) {
    printf("setRange[1..3] of 0=0x%X\n", setBitsInRange(0,1,3));
    printf("clearRange[1..3] of 0xFF=0x%X\n", clearBitsInRange(0xFF,1,3));
    printf("write 5 into [1..3] of 0=0x%X\n", writeBitsInRange(0,1,3,5));
    return 0;
}
```
