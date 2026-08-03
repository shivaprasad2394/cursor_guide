---
id: "q42-add-two-numbers-without-operator"
title: "Add Two Numbers Without + Operator"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "generic"
vizCategory: "bit manipulation"
tape: "addNoPlus(15,32)=%d\\n"
stdin: ""
complexity: "O(32) worst case = O(1)"
expectedOutput: "addNoPlus(15,32)=47\n"
---
## At a glance

- **Goal:** Add Two Numbers Without + Operator
- **Pattern:** Bit manipulation
- **Complexity:** O(32) worst case = O(1)
- **Expected output:** `addNoPlus(15,32)=47`

## Description

Implement **Add Two Numbers Without + Operator** using the pattern above. This teaching API accepts non-negative `int` operands whose mathematical sum fits in `int`; it returns 0 outside that safe domain. Carry propagation is performed with unsigned arithmetic so left shifts are defined.

**Walkthrough hint:**

a=15 (1111), b=32 (100000)

## Algorithm

```text
step1: XOR gives the sum WITHOUT carry:   sum = a ^ b
step2: AND-then-shift gives the carry:    carry = (a & b) << 1
step3: Repeat: a = sum, b = carry, until carry == 0
```

## Example Trace

```text
a=15 (1111), b=32 (100000)
  iter1: sum = 1111 ^ 100000 = 101111, carry = 0
  carry == 0, STOP. Result: 101111 = 47
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
    printf("addNoPlus(15,32)=%d\n", addNoPlus(15,32));
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

int addNoPlus(int a, int b) {
    if (a < 0 || b < 0 || a > INT_MAX - b) return 0;

    unsigned int ua = (unsigned int)a;
    unsigned int ub = (unsigned int)b;
    while (ub != 0u) {
        unsigned int carry = (ua & ub) << 1;
        ua ^= ub;
        ub = carry;
    }
    return (int)ua;
}

int main(void) {
    printf("addNoPlus(15,32)=%d\n", addNoPlus(15,32));
    return 0;
}
```
