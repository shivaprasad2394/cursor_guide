---
id: "q50-prime-number-check-6k-1-optimization"
title: "Prime Number Check (6k +/- 1 optimization)"
pattern: "math / number"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: |
  isPrime(29)=1 isPrime(15)=0
---

## Description

Prime Number Check (6k +/- 1 optimization)

## Example Trace

```text
n = 29
  29 > 3, not divisible by 2 or 3
  i=5: 29%5=4 (no), 29%7=1 (no). 7*7=49 > 29 -> stop
  Result: PRIME
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
    printf("isPrime(29)=%d isPrime(15)=%d\n", isPrime(29), isPrime(15));
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

int isPrime(int n) {
    if (n <= 1) return 0;
    if (n <= 3) return 1;
    if (n % 2 == 0 || n % 3 == 0) return 0;
    for (int i = 5; i * i <= n; i += 6)
        if (n % i == 0 || n % (i + 2) == 0) return 0;
    return 1;
}

int main(void) {
    printf("isPrime(29)=%d isPrime(15)=%d\n", isPrime(29), isPrime(15));
    return 0;
}
```
