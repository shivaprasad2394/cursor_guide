---
id: "q83-parse-a-key-value-configuration-line-sscanf-with"
title: "Parse a \"key=value\" configuration line (sscanf with %[ ])"
pattern: "parsing"
difficulty: "medium"
visualization: "generic"
vizCategory: "parsing & formatting"
tape: "timeout=30"
stdin: ""
expectedOutput: "key=timeout value=30\n"
---
## At a glance

- **Goal:** Parse a "key=value" configuration line (sscanf with %[ ])
- **Pattern:** Parsing
- **Complexity:** See algorithm
- **Expected output:** `key=timeout value=30`

## Description

Split a line like "timeout=30" into key string and value string.

**Walkthrough hint:**

line = "timeout=30"

## Algorithm

```text
step1: use a scanset %[^=] to read everything up to '=' into key
  step2: skip the '=' literally
  step3: %s (or %[^\n]) reads the value
  step4: check sscanf returned 2 (both fields parsed)

The %[^=] means "match any char that is NOT '='". The width limits
(%63[^=]) prevent buffer overflow -- ALWAYS bound scanset/string widths.
```

## Example Trace

```text
line = "timeout=30"
  key="timeout", value="30", returns 2
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
    char k[64],val[64];
    if(parseKeyValue("timeout=30",k,sizeof k,val,sizeof val)==2) printf("key=%s value=%s\n",k,val);
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

int parseKeyValue(const char *line, char *key, size_t keySz,
                  char *value, size_t valSz) {
    /* Build a format string with widths derived from the buffer sizes.
     * For a fixed example we hardcode safe widths; in real code you would
     * snprintf the format string itself. Here keySz/valSz are assumed >= 64. */
    (void)keySz; (void)valSz;
    int matched = sscanf(line, "%63[^=]=%63s", key, value);
    return matched;                       /* caller checks == 2 */
}

int main(void) {
    char k[64],val[64]; if(parseKeyValue("timeout=30",k,sizeof k,val,sizeof val)==2) printf("key=%s value=%s\n",k,val);
    return 0;
}
```
