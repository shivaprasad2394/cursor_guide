---
id: "q116-jump-game-greedy"
title: "Jump Game (Greedy)"
pattern: "greedy"
difficulty: "medium"
visualization: "generic"
vizCategory: "dsa"
stdin: ""
expectedOutput: "canReachEnd=1\n"
---
## At a glance

- **Goal:** Jump Game (Greedy)
- **Pattern:** Greedy
- **Expected output:** `canReachEnd=1`

## Description

Can you reach the last index? Track farthest reachable index in one pass.

## Algorithm

```text
step1: farthest = 0
step2: for i while i <= farthest: farthest = max(farthest, i + nums[i])
step3: return farthest >= n-1
```

## Example Trace

```text
nums = [2,3,1,1,4] → can reach end
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
    int a[] = {2, 3, 1, 1, 4};
    printf("canReachEnd=%d\n", canJump(a, 5));
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
int canJump(const int nums[], int n) {
    int farthest = 0;
    for (int i = 0; i <= farthest && i < n; i++)
        if (i + nums[i] > farthest) farthest = i + nums[i];
    return farthest >= n - 1;
}

int main(void) {
    int a[] = {2, 3, 1, 1, 4};
    printf("canReachEnd=%d\n", canJump(a, 5));
    return 0;
}
```
