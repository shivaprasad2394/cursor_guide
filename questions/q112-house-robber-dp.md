---
id: "q112-house-robber-dp"
title: "House Robber (DP)"
pattern: "dynamic programming"
difficulty: "medium"
visualization: "generic"
vizCategory: "dsa"
stdin: ""
expectedOutput: "maxLoot=12\n"
---
## At a glance

- **Goal:** House Robber (DP)
- **Pattern:** Dynamic Programming
- **Expected output:** `maxLoot=12`

## Description

Max money robbing non-adjacent houses. `dp[i] = max(dp[i-1], nums[i] + dp[i-2])`.

## Algorithm

```text
step1: track prev2 and prev1 (best up to i-2 and i-1)
step2: for each house: cur = max(prev1, nums[i] + prev2)
step3: shift window forward
```

## Example Trace

```text
nums = [2,7,9,3,1] → pick 2+9+1 = 12
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
    int a[] = {2, 7, 9, 3, 1};
    printf("maxLoot=%d\n", rob(a, 5));
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
int rob(const int nums[], int n) {
    int prev2 = 0, prev1 = 0;
    for (int i = 0; i < n; i++) {
        int cur = prev1 > nums[i] + prev2 ? prev1 : nums[i] + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

int main(void) {
    int a[] = {2, 7, 9, 3, 1};
    printf("maxLoot=%d\n", rob(a, 5));
    return 0;
}
```
