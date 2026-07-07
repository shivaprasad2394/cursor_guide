---
id: "q13-validate-an-ipv4-address"
title: "Validate an IPv4 Address"
pattern: "state machine (single pass)"
difficulty: "easy"
visualization: "generic"
vizCategory: "strings"
tape: "192.168.0.1"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "isValidIPv4(192.168.1.10)=1\nisValidIPv4(1.2.3)=0\n"
---
## At a glance

- **Goal:** Validate an IPv4 Address
- **Pattern:** State machine (single pass)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `isValidIPv4(192.168.1.10)=1`

## Description

Implement **Validate an IPv4 Address** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

ip = "192.168.0.1"

## Algorithm

```text
step1: Walk char by char through the string
step2: On a digit: accumulate into 'num' (num = num*10 + digit)
step3: On a dot or end-of-string: validate the completed segment:
       - Must have at least 1 digit (no empty segments)
       - Must be 0-255
       - No leading zeros (if digits > 1, first digit can't be '0')
step4: After full walk, must have exactly 4 segments (3 dots + terminal)
```

## Example Trace

```text
ip = "192.168.0.1"
  Segment "192": digits=3, num=192, 0-255 OK
  Segment "168": digits=3, num=168, 0-255 OK
  Segment "0":   digits=1, num=0,   0-255 OK
  Segment "1":   digits=1, num=1,   0-255 OK
  dots = 4 (3 dots + 1 terminal) -> VALID
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
    printf("isValidIPv4(192.168.1.10)=%d\n", isValidIPv4("192.168.1.10"));
    printf("isValidIPv4(1.2.3)=%d\n", isValidIPv4("1.2.3"));
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

int isValidIPv4(const char *ip) {
    int len = (int)strlen(ip);
    if (len == 0) return 0;

    int dots = 0, num = 0, digits = 0;
    for (int i = 0; i <= len; i++) {
        char ch = ip[i];
        if (ch == '.' || ch == '\0') {
            if (digits == 0)                        return 0;  /* empty segment */
            if (digits > 1 && ip[i - digits] == '0') return 0;  /* leading zero */
            if (num > 255)                           return 0;  /* out of range */
            dots++;
            num = 0; digits = 0;
            if (ch == '\0') break;
        } else if (isdigit((unsigned char)ch)) {
            num = num * 10 + (ch - '0');
            digits++;
            if (digits > 3)                          return 0;
        } else {
            return 0;                                /* non-digit, non-dot */
        }
    }
    return dots == 4;                                 /* 3 dots + 1 terminal */
}

int main(void) {
    printf("isValidIPv4(192.168.1.10)=%d\n", isValidIPv4("192.168.1.10"));
    printf("isValidIPv4(1.2.3)=%d\n", isValidIPv4("1.2.3"));
    return 0;
}
```
