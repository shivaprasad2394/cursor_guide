---
id: "q36-reverse-bits-of-a-32-bit-number"
title: "Reverse Bits of a 32-bit Number"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "reverseBits(5)=%u\\n"
stdin: ""
complexity: "O(32) = O(1) time"
expectedOutput: "reverseBits(5)=2684354560\n"
---
## At a glance

- **Goal:** Reverse Bits of a 32-bit Number
- **Pattern:** Bit manipulation
- **Complexity:** O(32) = O(1) time
- **Expected output:** `reverseBits(5)=2684354560`

## Description

Implement **Reverse Bits of a 32-bit Number** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: result = 0
  step2: Loop 32 times:
         - Shift result LEFT by 1 (make room)
         - OR in the LSB of n: result |= (n & 1)
         - Shift n RIGHT by 1 (move to next bit)
  step3: Return result

Example (4-bit demo): n = 0101 (5)
  iter1: result = 0000<<1 | 1 = 0001, n = 0010
  iter2: result = 0010<<1 | 0 = 0010, n = 0001
  iter3: result = 0100<<1 | 1 = 0101, n = 0000
  iter4: result = 1010<<1 | 0 = 1010
  Result: 1010 (10)
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
    printf("reverseBits(5)=%u\n", reverseBits(5));
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

unsigned int reverseBits(unsigned int n) {
    unsigned int result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1u);
        n >>= 1;
    }
    return result;
}

int main(void) {
    printf("reverseBits(5)=%u\n", reverseBits(5));
    return 0;
}
```
