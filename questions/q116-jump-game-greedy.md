---
id: "q116-jump-game-greedy"
title: "Jump Game (Greedy)"
pattern: "greedy"
difficulty: "medium"
visualization: "jump-game"
vizCategory: "dsa"
stdin: ""
expectedOutput: "canReachEnd=1\n"
tape: 2,3,1,1,4
---
## At a glance

- **Goal:** Jump Game (Greedy)
- **Pattern:** Greedy
- **Expected output:** `canReachEnd=1`

## Before you start

Read [Greedy primer](dsa-guide.html#greedy). One pass, one variable — easiest DSA question to start with.

Full guide: [DSA Primer](dsa-guide.html#greedy)

## How to think

From index `i` you can jump up to `nums[i]` steps. Track **farthest** index reachable. If `farthest` ever passes the last index, answer is yes.

## Diagram

```text
Index: 0  1  2  3  4
nums:  2  3  1  1  4
farthest grows: 2 → 4 → … → past end
```

## C walkthrough

```text
step1: `farthest = 0`
step2: Loop while `i <= farthest` — if `i + nums[i] > farthest`, update farthest
step3: Return `farthest >= n-1`
```

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
