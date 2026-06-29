---
id: "q84-parse-an-ipv4-address-into-four-octets-sscanf-with-field-count"
title: "Parse an IPv4 address into four octets (sscanf with field count)"
pattern: "parsing"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: "valid=1 -> 192.168.1.10\n"
---

## Description

Convert "192.168.1.10" into four integers, validating the structure.

## Algorithm

```text
step1: sscanf(str, "%d.%d.%d.%d", &o1,&o2,&o3,&o4)
step2: require return value == 4 (exactly four octets)
step3: validate each octet is in range 0..255
```

## Example Trace

```text
"192.168.1.10" -> 192,168,1,10 (valid)
         "192.168.1"     -> returns 3 (invalid - missing octet)
         "300.1.2.3"     -> returns 4 but 300 > 255 (invalid range)
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
    int o[4];
    int ok=parseIPv4("192.168.1.10",o);
    printf("valid=%d -> %d.%d.%d.%d\n",ok,o[0],o[1],o[2],o[3]);
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

int parseIPv4(const char *str, int octets[4]) {
    int matched = sscanf(str, "%d.%d.%d.%d",
                         &octets[0], &octets[1], &octets[2], &octets[3]);
    if (matched != 4) return 0;           /* wrong number of octets */
    for (int i = 0; i < 4; i++)
        if (octets[i] < 0 || octets[i] > 255) return 0;  /* out of range */
    return 1;                             /* valid */
}

int main(void) {
    int o[4]; int ok=parseIPv4("192.168.1.10",o); printf("valid=%d -> %d.%d.%d.%d\n",ok,o[0],o[1],o[2],o[3]);
    return 0;
}
```
