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

Implement **Bit Range Operations (Set / Clear / Write bits in [start..end])** using the pattern above. Write the helper function(s); `main()` is provided.

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

static unsigned int rangeMask(int start, int end) {
    int nbits = end - start + 1;
    return ((1u << nbits) - 1u) << start;
}

unsigned int setBitsInRange  (unsigned int reg, int s, int e) { return reg | rangeMask(s,e); }

unsigned int clearBitsInRange(unsigned int reg, int s, int e) { return reg & ~rangeMask(s,e); }

unsigned int writeBitsInRange(unsigned int reg, int s, int e, unsigned int val) {
    unsigned int mask = rangeMask(s, e);
    val = (val << s) & mask;
    return (reg & ~mask) | val;
}

int main(void) {
    printf("setRange[1..3] of 0=0x%X\n", setBitsInRange(0,1,3)); printf("clearRange[1..3] of 0xFF=0x%X\n", clearBitsInRange(0xFF,1,3)); printf("write 5 into [1..3] of 0=0x%X\n", writeBitsInRange(0,1,3,5));
    return 0;
}
```
