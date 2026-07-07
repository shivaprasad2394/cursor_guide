---
id: "q96-best-time-to-buy-and-sell-stock"
title: "Best Time to Buy and Sell Stock"
pattern: "single pass (track min, max profit)"
difficulty: "easy"
visualization: "generic"
vizCategory: "arrays"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "maxProfit=5\\n"
---
## At a glance

- **Goal:** Best Time to Buy and Sell Stock
- **Pattern:** Single pass (track min, max profit)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `maxProfit=5\n`

## Description

One transaction: buy once, sell once later. Return maximum profit (0 if none).

**Walkthrough hint:**

prices = [7, 1, 5, 3, 6, 4] → buy at 1, sell at 6, profit = 5

## Algorithm

```text
step1: minPrice = prices[0], maxProfit = 0
step2: For each price from index 1:
step3:   Update minPrice = min(minPrice, price)
step4:   maxProfit = max(maxProfit, price - minPrice)
step5: Return maxProfit
```

## Example Trace

```text
prices = [7, 1, 5, 3, 6, 4]
  i=1: min=1, profit=max(0,1-1)=0
  i=2: min=1, profit=max(0,5-1)=4
  i=4: min=1, profit=max(4,6-1)=5  ← answer
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
    int p[] = {
        7, 1, 5, 3, 6, 4
    };
    printf("maxProfit=%d\n", maxProfit(p, 6));
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
int maxProfit(const int prices[], int n) {
    if (n < 2) return 0;
    int minP = prices[0], best = 0;
    for (int i = 1; i < n; i++) {
        if (prices[i] < minP) minP = prices[i];
        else {
            int p = prices[i] - minP;
            if (p > best) best = p;
        }
    }
    return best;
}

int main(void) {
    int p[] = {
        7, 1, 5, 3, 6, 4
    };
    printf("maxProfit=%d\n", maxProfit(p, 6));
    return 0;
}
```
