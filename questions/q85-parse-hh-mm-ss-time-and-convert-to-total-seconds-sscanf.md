---
id: "q85-parse-hh-mm-ss-time-and-convert-to-total-seconds-sscanf"
title: "Parse \"HH:MM:SS\" time and convert to total seconds (sscanf)"
pattern: "parsing"
difficulty: "medium"
visualization: "generic"
vizCategory: "parsing & formatting"
tape: "01:30:45"
stdin: ""
expectedOutput: "01:30:45 -> 5445 sec\n"
---
## At a glance

- **Goal:** Parse "HH:MM:SS" time and convert to total seconds (sscanf)
- **Pattern:** Parsing
- **Complexity:** See algorithm
- **Expected output:** `01:30:45 -> 5445 sec`

## Description

Implement **Parse "HH:MM:SS" time and convert to total seconds (sscanf)** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

"01:30:45" -> 1*3600 + 30*60 + 45 = 5445 seconds

## Algorithm

```text
step1: sscanf(str, "%d:%d:%d", &h, &m, &s)
step2: require 3 matched
step3: total = h*3600 + m*60 + s
```

## Example Trace

```text
"01:30:45" -> 1*3600 + 30*60 + 45 = 5445 seconds
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
    printf("01:30:45 -> %ld sec\n", parseTimeToSeconds("01:30:45"));
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

long parseTimeToSeconds(const char *str) {
    int h, m, s;
    if (sscanf(str, "%d:%d:%d", &h, &m, &s) != 3) return -1;  /* malformed */
    return (long)h * 3600 + (long)m * 60 + s;
}

int main(void) {
    printf("01:30:45 -> %ld sec\n", parseTimeToSeconds("01:30:45"));
    return 0;
}
```
