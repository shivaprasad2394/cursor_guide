---
id: "q114-daily-temperatures-monotonic-stack"
title: "Daily Temperatures (Monotonic Stack)"
pattern: "monotonic stack"
difficulty: "medium"
visualization: "monotonic-stack"
vizCategory: "dsa"
stdin: ""
tape: "73,74,75,71,69,72,76,73"
expectedOutput: "wait: 1 1 4 2 1 1 0 0\n"
---
## At a glance

- **Goal:** Daily Temperatures (Monotonic Stack)
- **Pattern:** Monotonic Stack
- **Expected output:** `wait: 1 1 4 2 1 1 0 0`

## Description

For each day, days until a warmer temperature. Decreasing monotonic stack of indices.

## Algorithm

```text
step1: stack holds indices with decreasing temps
step2: while current temp > temp[stack.top]: pop and set answer
step3: push current index
```

## Example Trace

```text
T = [73,74,75,71,69,72,76,73] → wait [1,1,4,2,1,1,0,0]
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
    int T[] = {73, 74, 75, 71, 69, 72, 76, 73};
    int ans[8];
    dailyWait(T, 8, ans);
    printf("wait:");
    for (int i = 0; i < 8; i++) printf(" %d", ans[i]);
    printf("\n");
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
void dailyWait(const int T[], int n, int out[]) {
    int st[64], top = -1;
    for (int i = 0; i < n; i++) out[i] = 0;
    for (int i = 0; i < n; i++) {
        while (top >= 0 && T[i] > T[st[top]]) {
            int j = st[top--];
            out[j] = i - j;
        }
        st[++top] = i;
    }
}

int main(void) {
    int T[] = {73, 74, 75, 71, 69, 72, 76, 73};
    int ans[8];
    dailyWait(T, 8, ans);
    printf("wait:");
    for (int i = 0; i < 8; i++) printf(" %d", ans[i]);
    printf("\n");
    return 0;
}
```
