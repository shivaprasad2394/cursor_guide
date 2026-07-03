---
id: "q47-palindrome-number-check"
title: "Palindrome Number Check"
pattern: "math / number"
difficulty: "easy"
visualization: "generic"
vizCategory: "math / number"
tape: "palin(121)=%d palin(123)=%d\\n"
stdin: ""
expectedOutput: "palin(121)=1 palin(123)=0\n"
---
## At a glance

- **Goal:** Palindrome Number Check
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `palin(121)=1 palin(123)=0`

## Description

Implement **Palindrome Number Check** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

121 -> reversed = 121 -> equal -> palindrome

## Algorithm

```text
Reverse the number, compare to original.
  Negatives are NEVER palindromes.
```

## Example Trace

```text
121 -> reversed = 121 -> equal -> palindrome
         -121 -> negative -> NOT palindrome
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
    printf("palin(121)=%d palin(123)=%d\n", isPalindromeNumber(121), isPalindromeNumber(123));
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

int isPalindromeNumber(int n) {
    if (n < 0) return 0;
    int original = n, rev = 0;
    while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }
    return rev == original;
}

int main(void) {
    printf("palin(121)=%d palin(123)=%d\n", isPalindromeNumber(121), isPalindromeNumber(123));
    return 0;
}
```
