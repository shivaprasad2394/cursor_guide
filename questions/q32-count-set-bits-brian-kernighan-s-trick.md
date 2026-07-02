---
id: "q32-count-set-bits-brian-kernighan-s-trick"
title: "Count Set Bits (Brian Kernighan's Trick)"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(number of set bits), NOT O(32)"
expectedOutput: "countSetBits(13)=3\n"
---
## At a glance

- **Goal:** Count Set Bits (Brian Kernighan's Trick)
- **Pattern:** Bit manipulation
- **Complexity:** O(number of set bits), NOT O(32)
- **Expected output:** `countSetBits(13)=3`

## Description

Count how many bits are 1 in the binary representation of n.

**Walkthrough hint:**

n=13 (1101), count=0

## Algorithm

```text
step1: While n != 0:
         - n = n & (n-1)  -- this clears the LOWEST set bit each pass
         - count++
  step2: Return count

Why n & (n-1) works:
  n   = ...1000  (lowest set bit)
  n-1 = ...0111  (flips lowest set bit and all below)
  AND clears that bit, leaving all higher bits untouched
```

## Example Trace

```text
n=13 (1101), count=0
  1101 & 1100 = 1100, count=1  (cleared bit 0)
  1100 & 1011 = 1000, count=2  (cleared bit 2)
  1000 & 0111 = 0000, count=3  (cleared bit 3)
  n==0, STOP. Result: 3 set bits
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
    printf("countSetBits(13)=%d\n", countSetBits(13));
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

int countSetBits(unsigned int n) {
    int count = 0;
    while (n) { n &= (n - 1); count++; }
    return count;
}

int main(void) {
    printf("countSetBits(13)=%d\n", countSetBits(13));
    return 0;
}
```
