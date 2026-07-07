---
id: "q45-digit-extraction"
title: "Digit Extraction"
pattern: "math / number"
difficulty: "easy"
visualization: "generic"
vizCategory: "math / number"
tape: "digits of 5283: "
stdin: ""
expectedOutput: "digits of 5283: 3 8 2 5\n"
---
## At a glance

- **Goal:** Digit Extraction
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `digits of 5283: 3 8 2 5`

## Description

Implement **Digit Extraction** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

n = 5283

## Algorithm

```text
n%10 extracts last digit, n/10 removes it. Loop until n==0.
Digits come out in REVERSE order.
```

## Example Trace

```text
n = 5283
  5283 % 10 = 3,  5283 / 10 = 528
   528 % 10 = 8,   528 / 10 = 52
    52 % 10 = 2,    52 / 10 = 5
     5 % 10 = 5,     5 / 10 = 0 -> stop
  Digits: 3, 8, 2, 5
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
    printf("digits of 5283: ");
    extractDigits(5283);
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

void extractDigits(int n) {
    if (n < 0) n = -n;
    if (n == 0) { printf("0\n"); return; }
    while (n > 0) {
        printf("%d ", n % 10);
        n /= 10;
    }
    printf("\n");
}

int main(void) {
    printf("digits of 5283: ");
    extractDigits(5283);
    return 0;
}
```
