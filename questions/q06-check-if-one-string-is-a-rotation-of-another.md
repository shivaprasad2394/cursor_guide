---
id: "q06-check-if-one-string-is-a-rotation-of-another"
title: "Check If One String Is a Rotation of Another"
pattern: "string concatenation trick"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time (assuming strstr is O(n)), O(n) space"
expectedOutput: "isRotation(waterbottle,erbottlewat)=1\n"
---
## At a glance

- **Goal:** Check If One String Is a Rotation of Another
- **Pattern:** String concatenation trick
- **Complexity:** O(n) time (assuming strstr is O(n)), O(n) space
- **Expected output:** `isRotation(waterbottle,erbottlewat)=1`

## Description

A rotation shifts chars from one end to the other.

**Walkthrough hint:**

"waterbottle" rotated -> "erbottlewat"

## Algorithm

```text
step1: If lengths differ, return 0 (can't be rotation)
step2: Concatenate s1 with itself: s1+s1
       Key insight: if s2 is a rotation of s1, s2 ALWAYS appears
       as a substring inside s1+s1
step3: Use strstr() to check if s2 is inside the concatenation
```

## Example Trace

```text
"waterbottle" rotated -> "erbottlewat"

s1="waterbottle", s2="erbottlewat"
  concat = "waterbottlewaterbottle"
  Does "erbottlewat" appear in it? -> YES (at position 3)
  Result: IS a rotation
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
    printf("isRotation(waterbottle,erbottlewat)=%d\n", isRotation("waterbottle","erbottlewat"));
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

int isRotation(const char *s1, const char *s2) {
    int len = (int)strlen(s1);
    if (len != (int)strlen(s2)) return 0;
    if (len == 0) return 1;
    char *concat = (char *)malloc((size_t)(2 * len + 1));
    if (concat == NULL) return -1;     /* allocation failed */
    sprintf(concat, "%s%s", s1, s1);
    int found = (strstr(concat, s2) != NULL);
    free(concat);
    return found;
}

int main(void) {
    printf("isRotation(waterbottle,erbottlewat)=%d\n", isRotation("waterbottle","erbottlewat"));
    return 0;
}
```
