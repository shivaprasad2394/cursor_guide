---
id: "q38-position-of-rightmost-set-bit-1-indexed"
title: "Position of Rightmost Set Bit (1-indexed)"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "rightmostSetBit(12)=%d\\n"
stdin: ""
complexity: "O(position) time, O(1) space"
expectedOutput: "rightmostSetBit(12)=3\n"
---
## At a glance

- **Goal:** Position of Rightmost Set Bit (1-indexed)
- **Pattern:** Bit manipulation
- **Complexity:** O(position) time, O(1) space
- **Expected output:** `rightmostSetBit(12)=3`

## Description

Return the **1-based result position** required by the title: the least-significant bit is result position 1, and zero has no set bit so it returns 0. Internally, bit indices remain 0-based, consistent with the bit-operation APIs.

**Walkthrough hint:**

n = 12 = 1100

## Algorithm

```text
step1: Isolate lowest set bit: iso = n & (0u - n)
       Unsigned subtraction wraps modulo the type width, so this is defined
step2: Count shifts until iso == 1: that's the 0-indexed position
step3: Return position + 1 (1-indexed)
```

## Example Trace

```text
n = 12 = 1100
  0u - n wraps to ...0100
  n & (0u - n) = 0100 = 4 -> isolated 0-based bit index 2
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
    unsigned int iso = n & (0u - n);
    int pos = 0;
    while (iso > 1) { iso >>= 1; pos++; }
    return pos + 1;
}

int main(void) {
    printf("rightmostSetBit(12)=%d\n", positionOfRightmostSetBit(12));
    return 0;
}
```
