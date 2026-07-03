---
id: "q87-build-a-csv-row-safely-by-appending-with-snprintf"
title: "Build a CSV row safely by appending with snprintf"
pattern: "parsing"
difficulty: "medium"
visualization: "generic"
vizCategory: "parsing & formatting"
tape: "id"
stdin: ""
expectedOutput: "csv=id,name,age\n"
---
## At a glance

- **Goal:** Build a CSV row safely by appending with snprintf
- **Pattern:** Parsing
- **Complexity:** See algorithm
- **Expected output:** `csv=id,name,age`

## Description

Concatenate several fields into one CSV line, tracking remaining space so we never overflow. This is the safe pattern for incremental string build.

**Walkthrough hint:**

fields {"id","name","age"} -> "id,name,age"

## Algorithm

```text
step1: keep an offset into the buffer (chars written so far)
step2: each snprintf writes at (buf + offset) with (size - offset) space
step3: advance offset by the return value
step4: if offset >= size, stop (buffer full)
```

## Example Trace

```text
fields {"id","name","age"} -> "id,name,age"
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
    char csv[64];
    const char*f[]={
    "id","name","age"};
    buildCSVRow(csv,sizeof csv,f,3);
    printf("csv=%s\n",csv);
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

int buildCSVRow(char *buf, size_t size, const char *fields[], int count) {
    size_t offset = 0;
    for (int i = 0; i < count; i++) {
        const char *sep = (i == 0) ? "" : ",";   /* comma before all but first */
        int n = snprintf(buf + offset, size - offset, "%s%s", sep, fields[i]);
        if (n < 0) return -1;                     /* encoding error */
        if ((size_t)n >= size - offset) return 1; /* would overflow -> stop */
        offset += (size_t)n;
    }
    return 0;                                     /* success */
}

int main(void) {
    char csv[64]; const char*f[]={"id","name","age"}; buildCSVRow(csv,sizeof csv,f,3); printf("csv=%s\n",csv);
    return 0;
}
```
