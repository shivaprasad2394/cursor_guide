---
id: "q112-house-robber-dp"
title: "House Robber (DP)"
pattern: "dynamic programming"
difficulty: "medium"
visualization: "dp-robber"
vizCategory: "dsa"
stdin: ""
expectedOutput: "maxLoot=12\n"
tape: 2,7,9,3,1
---
## At a glance

- **Goal:** House Robber (DP)
- **Pattern:** Dynamic Programming
- **Expected output:** `maxLoot=12`

## Before you start

Read [DP primer](dsa-guide.html#dp). Each house has money; you **cannot rob two neighbors**.

Full guide: [DSA Primer](dsa-guide.html#dp)

## How to think

At house `i`, either **rob it** (money[i] + best up to i-2) or **skip it** (best up to i-1). Track two running totals — no full array required in C.

## Diagram

```text
Houses: $2  $7  $9  $3  $1
Pick:   ✓      ✗   ✓      ✗   ✓  → total $12
```

## C walkthrough

```text
step1: `prev2=0`, `prev1=0` — best loot ending two back / one back
step2: `cur = max(prev1, nums[i]+prev2)` — rob or skip
step3: Shift window: `prev2=prev1`, `prev1=cur`
```

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
