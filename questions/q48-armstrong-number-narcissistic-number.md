---
id: "q48-armstrong-number-narcissistic-number"
title: "Armstrong Number (Narcissistic Number)"
pattern: "math / number"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "armstrong(153)=1 armstrong(123)=0\n"
---
## At a glance

- **Goal:** Armstrong Number (Narcissistic Number)
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `armstrong(153)=1 armstrong(123)=0`

## Description

Implement **Armstrong Number (Narcissistic Number)** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: Count digits (d)
step2: For each digit: sum += digit^d
step3: Compare sum == original
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
    printf("armstrong(153)=%d armstrong(123)=%d\n", isArmstrong(153), isArmstrong(123));
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

static int intPow(int base, int exp) {
    int r = 1; for (int i = 0; i < exp; i++) r *= base; return r;
}

int isArmstrong(int n) {
    if (n < 0) return 0;
    int original = n, d = 0, temp = n;
    while (temp > 0) { d++; temp /= 10; }
    int sum = 0; temp = n;
    while (temp > 0) { sum += intPow(temp % 10, d); temp /= 10; }
    return sum == original;
}

int main(void) {
    printf("armstrong(153)=%d armstrong(123)=%d\n", isArmstrong(153), isArmstrong(123));
    return 0;
}
```
