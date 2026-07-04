---
id: "q97-implement-atoi-string-to-integer"
title: "Implement atoi (String to Integer)"
pattern: "state machine (single pass)"
difficulty: "medium"
visualization: "generic"
vizCategory: "strings"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "atoi(\"42\")=42\\natoi(\"  -4193\")=-4193\\n"
---
## At a glance

- **Goal:** Implement atoi (String to Integer)
- **Pattern:** State machine (single pass)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `atoi("42")=42\natoi("  -4193")=-4193\n`

## Description

Convert a string to a 32-bit signed integer (like C's `atoi`): skip whitespace, optional sign, read digits.

**Walkthrough hint:**

s = "  -4193 abc" → -4193

## Algorithm

```text
step1: Skip leading whitespace
step2: Read optional '+' or '-' sign
step3: While next char is digit: result = result*10 + digit
step4: Apply sign and clamp to INT range if needed
step5: Return result
```

## Example Trace

```text
s = "  -4193"
  skip spaces → '-'
  sign = -1
  read '4','1','9','3' → result = 4193
  return -4193
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
        printf("atoi(\"42\")=%d\n", myAtoi("42"));
        printf("atoi(\"  -4193\")=%d\n", myAtoi("  -4193"));
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
int myAtoi(const char *s) {
    while (*s == ' ' || *s == '\t') s++;
    int sign = 1;
    if (*s == '-' || *s == '+') { if (*s == '-') sign = -1; s++; }
    long val = 0;
    while (*s >= '0' && *s <= '9') {
        val = val * 10 + (*s - '0');
        if (val * sign > INT_MAX) return INT_MAX;
        if (val * sign < INT_MIN) return INT_MIN;
        s++;
    }
    return (int)(val * sign);
}

int main(void) {
        printf("atoi(\"42\")=%d\n", myAtoi("42"));
        printf("atoi(\"  -4193\")=%d\n", myAtoi("  -4193"));
    return 0;
}
```
