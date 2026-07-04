---
id: "q102-fibonacci-number-iterative"
title: "Fibonacci Number (iterative)"
pattern: "math / number"
difficulty: "easy"
visualization: "generic"
vizCategory: "math / number"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "fib(0)=0\\nfib(1)=1\\nfib(10)=55\\n"
---
## At a glance

- **Goal:** Fibonacci Number (iterative)
- **Pattern:** Math / number
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `fib(0)=0\nfib(1)=1\nfib(10)=55\n`

## Description

Return the nth Fibonacci number F(n) where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). Use iteration (no recursion).

**Walkthrough hint:**

fib(10) = 55

## Algorithm

```text
step1: If n <= 1 return n
step2: a=0, b=1
step3: For i from 2 to n: c=a+b; a=b; b=c
step4: Return b
```

## Example Trace

```text
n=5: 0,1,1,2,3,5 → return 5
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
        printf("fib(0)=%d\n", fib(0));
        printf("fib(1)=%d\n", fib(1));
        printf("fib(10)=%d\n", fib(10));
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
int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main(void) {
        printf("fib(0)=%d\n", fib(0));
        printf("fib(1)=%d\n", fib(1));
        printf("fib(10)=%d\n", fib(10));
    return 0;
}
```
