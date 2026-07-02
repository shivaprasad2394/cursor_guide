---
id: "q52-big-integer-addition-string-based"
title: "Big Integer Addition (string-based)"
pattern: "math / number"
difficulty: "easy"
visualization: "none"
stdin: ""
expectedOutput: "999+1=1000\n"
---
## At a glance

- **Goal:** Big Integer Addition (string-based)
- **Pattern:** Math / number
- **Complexity:** See algorithm
- **Expected output:** `999+1=1000`

## Description

Implement **Big Integer Addition (string-based)** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

"999" + "1"

## Algorithm

```text
step1: Walk both strings from RIGHT to LEFT (least significant digit)
step2: Add digits + carry. Store (sum % 10), carry forward (sum / 10).
step3: If one string is shorter, treat missing digits as 0.
step4: After loop, if carry > 0, write it.
step5: Result is built in reverse -> reverse it at end.
```

## Example Trace

```text
"999" + "1"
  9+1+0=10 -> write 0, carry=1
  9+0+1=10 -> write 0, carry=1
  9+0+1=10 -> write 0, carry=1
  carry=1  -> write 1
  Reverse "0001" -> "1000"
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
    char r[64];
    addBigInt("999","1",r,sizeof r);
    printf("999+1=%s\n", r);
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

void addBigInt(const char *a, const char *b, char *result, int resCap) {
    int la = (int)strlen(a), lb = (int)strlen(b);
    int carry = 0, k = 0;
    int i = la - 1, j = lb - 1;
    while (i >= 0 || j >= 0 || carry) {
        int sum = carry;
        if (i >= 0) sum += a[i--] - '0';
        if (j >= 0) sum += b[j--] - '0';
        if (k < resCap - 1) result[k++] = (char)('0' + (sum % 10));
        carry = sum / 10;
    }
    result[k] = '\0';
    for (int l = 0, r = k - 1; l < r; l++, r--) {
        char t = result[l]; result[l] = result[r]; result[r] = t;
    }
}

int main(void) {
    char r[64]; addBigInt("999","1",r,sizeof r); printf("999+1=%s\n", r);
    return 0;
}
```
