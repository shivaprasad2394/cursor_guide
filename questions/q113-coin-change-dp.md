---
id: "q113-coin-change-dp"
title: "Coin Change (DP)"
pattern: "dynamic programming"
difficulty: "medium"
visualization: "generic"
vizCategory: "dsa"
stdin: ""
expectedOutput: "minCoins(11)=3\n"
---
## At a glance

- **Goal:** Coin Change (DP)
- **Pattern:** Dynamic Programming
- **Expected output:** `minCoins(11)=3`

## Description

Fewest coins to make amount `11` from `{1,2,5}`. Unbounded knapsack DP.

## Algorithm

```text
step1: dp[0]=0, dp[1..amount]=INF
step2: for each coin, for a from coin to amount: dp[a] = min(dp[a], dp[a-coin]+1)
step3: return dp[amount] or -1
```

## Example Trace

```text
amount=11, coins {1,2,5} → 5+5+1 = 3 coins
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
    int c[] = {1, 2, 5};
    printf("minCoins(11)=%d\n", coinChange(c, 3, 11));
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
int coinChange(const int coins[], int n, int amount) {
    int dp[512];
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;
    for (int c = 0; c < n; c++)
        for (int a = coins[c]; a <= amount; a++)
            if (dp[a - coins[c]] + 1 < dp[a]) dp[a] = dp[a - coins[c]] + 1;
    return dp[amount] > amount ? -1 : dp[amount];
}

int main(void) {
    int c[] = {1, 2, 5};
    printf("minCoins(11)=%d\n", coinChange(c, 3, 11));
    return 0;
}
```
