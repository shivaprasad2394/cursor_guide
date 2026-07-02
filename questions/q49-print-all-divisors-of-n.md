---
id: "q49-print-all-divisors-of-n"
title: "Print All Divisors of N"
pattern: "math / number"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "divisors of 36: 1 36 2 18 3 12 4 9 6\n"
---
## At a glance

- **Goal:** Print All Divisors of N
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `divisors of 36: 1 36 2 18 3 12 4 9 6`

## Description

Implement **Print All Divisors of N** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

n = 36

## Algorithm

```text
Loop i from 1 to sqrt(n). If n%i==0, both i and n/i are divisors.
```

## Example Trace

```text
n = 36
  i=1: 36%1==0 -> print 1, 36
  i=2: 36%2==0 -> print 2, 18
  i=3: 36%3==0 -> print 3, 12
  i=4: 36%4==0 -> print 4, 9
  i=5: 36%5!=0 -> skip
  i=6: 36%6==0 -> print 6 (6==36/6, so only once)
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
    printf("divisors of 36: ");
    printDivisors(36);
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

void printDivisors(int n) {
    for (int i = 1; i * i <= n; i++) {
        if (n % i == 0) {
            printf("%d ", i);
            if (i != n / i) printf("%d ", n / i);
        }
    }
    printf("\n");
}

int main(void) {
    printf("divisors of 36: "); printDivisors(36);
    return 0;
}
```
