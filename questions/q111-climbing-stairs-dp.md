---
id: "q111-climbing-stairs-dp"
title: "Climbing Stairs (DP)"
pattern: "dynamic programming"
difficulty: "easy"
visualization: "dp-stairs"
vizCategory: "dsa"
stdin: ""
expectedOutput: "ways(5)=8\n"
vizN: 5
---
## At a glance

- **Goal:** Climbing Stairs (DP)
- **Pattern:** Dynamic Programming
- **Expected output:** `ways(5)=8`

## Before you start

Read [DP primer](dsa-guide.html#dp) first. You only need a `for` loop and two integers — no pointer tricks.

Full guide: [DSA Primer](dsa-guide.html#dp)

## How to think

Ask: "How many ways to reach stair `i`?" You can arrive from `i-1` (one step) or `i-2` (two steps). So `ways(i) = ways(i-1) + ways(i-2)` — same as Fibonacci.

## Diagram

```text
Stair 5: ways = ways(4)+ways(3)
 dp: [1, 1, 2, 3, 5, 8]
```

## C walkthrough

```text
step1: `int a=1, b=1` — ways for stair 0 and 1
step2: Loop `i` from 2 to n: `c = a+b`, then shift `a=b`, `b=c`
step3: Return `b` — ways to reach stair n
```

## Description

Count distinct ways to climb `n` stairs taking 1 or 2 steps at a time. Classic 1-D DP / Fibonacci pattern.

## Algorithm

```text
step1: dp[0]=1, dp[1]=1
step2: for i from 2 to n: dp[i] = dp[i-1] + dp[i-2]
step3: return dp[n]
```

## Example Trace

```text
n=5 → 8 ways (1+1+1+1+1, 2+1+1+1, …)
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
    printf("ways(5)=%d\n", climbStairs(5));
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
int climbStairs(int n) {
    if (n <= 1) return 1;
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main(void) {
    printf("ways(5)=%d\n", climbStairs(5));
    return 0;
}
```
