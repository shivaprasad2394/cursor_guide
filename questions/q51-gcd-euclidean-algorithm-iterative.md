---
id: "q51-gcd-euclidean-algorithm-iterative"
title: "GCD - Euclidean Algorithm (iterative)"
pattern: "math / number"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "gcd(48,18)=6 lcm(12,18)=36\n"
---
## At a glance

- **Goal:** GCD - Euclidean Algorithm (iterative)
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `gcd(48,18)=6 lcm(12,18)=36`

## Description

Implement **GCD - Euclidean Algorithm (iterative)** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

gcd(48, 18)

## Algorithm

```text
while b != 0: temp=b, b=a%b, a=temp. Return a.
```

## Example Trace

```text
gcd(48, 18)
  48 % 18 = 12 -> gcd(18, 12)
  18 % 12 = 6  -> gcd(12, 6)
  12 % 6  = 0  -> gcd(6, 0)  -> answer = 6

LCM from GCD: lcm(a,b) = (a / gcd(a,b)) * b  (divide first to avoid overflow!)
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
    printf("gcd(48,18)=%d lcm(12,18)=%d\n", gcd(48,18), lcm(12,18));
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

int gcd(int a, int b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (b != 0) { int t = b; b = a % b; a = t; }
    return a;
}

int lcm(int a, int b) {
    if (a == 0 || b == 0) return 0;
    return (a / gcd(a, b)) * b;
}

int main(void) {
    printf("gcd(48,18)=%d lcm(12,18)=%d\n", gcd(48,18), lcm(12,18));
    return 0;
}
```
