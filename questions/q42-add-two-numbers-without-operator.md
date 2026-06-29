---
id: "q42-add-two-numbers-without-operator"
title: "Add Two Numbers Without + Operator"
pattern: "bit manipulation"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(32) worst case = O(1)"
expectedOutput: "addNoPlus(15,32)=47\n"
---

## Description

Add Two Numbers Without + Operator

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
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}

int main(void) {
    printf("addNoPlus(15,32)=%d\n", addNoPlus(15,32));
    return 0;
}
```
