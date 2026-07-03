---
id: "q46-reverse-a-number"
title: "Reverse a Number"
pattern: "math / number"
difficulty: "easy"
visualization: "generic"
vizCategory: "math / number"
tape: "reverse(1234)=%d\\n"
stdin: ""
expectedOutput: "reverse(1234)=4321\n"
---
## At a glance

- **Goal:** Reverse a Number
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `reverse(1234)=4321`

## Description

Implement **Reverse a Number** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

n = 1234

## Algorithm

```text
Build reversed number digit by digit:
  rev = rev * 10 + (n % 10),  n = n / 10
```

## Example Trace

```text
n = 1234
  rev=0:  rev = 0*10+4 = 4,     n=123
  rev=4:  rev = 4*10+3 = 43,    n=12
  rev=43: rev = 43*10+2 = 432,  n=1
  rev=432: rev = 432*10+1 = 4321, n=0
  Result: 4321
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
    printf("reverse(1234)=%d\n", reverseNumber(1234));
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

int reverseNumber(int n) {
    if (n == INT_MIN) return 0;        /* INT_MIN * -1 overflows */
    int rev = 0;
    int sign = (n < 0) ? -1 : 1;
    n *= sign;
    while (n > 0) {
        int digit = n % 10;
        if (rev > (INT_MAX - digit) / 10) return 0;
        rev = rev * 10 + digit;
        n /= 10;
    }
    return rev * sign;
}

int main(void) {
    printf("reverse(1234)=%d\n", reverseNumber(1234));
    return 0;
}
```
