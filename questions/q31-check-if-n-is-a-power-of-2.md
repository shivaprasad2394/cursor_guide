---
id: "q31-check-if-n-is-a-power-of-2"
title: "Check if n is a Power of 2"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(1) time, O(1) space"
expectedOutput: "isPow2(8)=1 isPow2(6)=0\n"
---

## Description

Powers of 2 have exactly ONE set bit: 1, 2, 4, 8, 16, ...

## Algorithm

```text
step1: A power of 2 in binary is 10...0 (one 1 followed by zeros)
step2: Subtracting 1 flips that bit and turns on all bits below:
       n = 1000, n-1 = 0111
step3: n & (n-1) == 0 iff n was a power of 2
step4: Must also exclude n == 0 (0 is NOT a power of 2)
```

## Example Trace

```text
n=8 -> 1000, n-1=7 -> 0111, 8 & 7 = 0 -> YES
         n=6 -> 0110, n-1=5 -> 0101, 6 & 5 = 4 -> NO
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
    printf("isPow2(8)=%d isPow2(6)=%d\n", isPowerOfTwo(8), isPowerOfTwo(6));
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

int isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

int main(void) {
    printf("isPow2(8)=%d isPow2(6)=%d\n", isPowerOfTwo(8), isPowerOfTwo(6));
    return 0;
}
```
