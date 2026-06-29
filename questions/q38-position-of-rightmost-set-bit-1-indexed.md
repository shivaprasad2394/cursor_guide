---
id: "q38-position-of-rightmost-set-bit-1-indexed"
title: "Position of Rightmost Set Bit (1-indexed)"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(position) time, O(1) space"
expectedOutput: "rightmostSetBit(12)=3\n"
---

## Description

Position of Rightmost Set Bit (1-indexed)

## Algorithm

```text
step1: Isolate lowest set bit: iso = n & -n
       In two's complement: -n = ~n + 1, so only the lowest 1 survives
step2: Count shifts until iso == 1: that's the 0-indexed position
step3: Return position + 1 (1-indexed)
```

## Example Trace

```text
n = 12 = 1100
  -n = ...0100 (two's complement)
  n & -n = 0100 = 4 -> isolated bit at position 2
  Shift: 4 >> 1 = 2, 2 >> 1 = 1 -> 2 shifts -> position 2+1 = 3
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
    printf("rightmostSetBit(12)=%d\n", positionOfRightmostSetBit(12));
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

int positionOfRightmostSetBit(unsigned int n) {
    if (n == 0) return 0;
    unsigned int iso = n & -n;
    int pos = 0;
    while (iso > 1) { iso >>= 1; pos++; }
    return pos + 1;
}

int main(void) {
    printf("rightmostSetBit(12)=%d\n", positionOfRightmostSetBit(12));
    return 0;
}
```
