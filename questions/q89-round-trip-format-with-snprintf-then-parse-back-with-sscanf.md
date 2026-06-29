---
id: "q89-round-trip-format-with-snprintf-then-parse-back-with-sscanf"
title: "Round-trip: format with snprintf, then parse back with sscanf"
pattern: "parsing"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: |
  roundTrip(1,2,3)=MATCHED
---

## Description

Demonstrate serialization (snprintf) and deserialization (sscanf) as inverse operations -- the core of any text protocol or config file.

## Algorithm

```text
step1: snprintf packs three ints into "a,b,c"
step2: sscanf unpacks "a,b,c" back into three ints
step3: verify the round-trip preserved the values
```

## Example Trace

```text
(1,2,3) -> "1,2,3" -> (1,2,3)  [matches]
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
    printf("roundTrip(1,2,3)=%s\n", roundTripInts(1,2,3)?"MATCHED":"FAILED");
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

int roundTripInts(int a, int b, int c) {
    char buf[32];
    snprintf(buf, sizeof(buf), "%d,%d,%d", a, b, c);   /* serialize */
    int x, y, z;
    if (sscanf(buf, "%d,%d,%d", &x, &y, &z) != 3) return 0;  /* deserialize */
    return (x == a && y == b && z == c);               /* round-trip OK? */
}

int main(void) {
    printf("roundTrip(1,2,3)=%s\n", roundTripInts(1,2,3)?"MATCHED":"FAILED");
    return 0;
}
```
