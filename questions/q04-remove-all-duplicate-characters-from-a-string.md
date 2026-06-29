---
id: "q04-remove-all-duplicate-characters-from-a-string"
title: "Remove All Duplicate Characters from a String"
pattern: "frequency table (boolean variant)"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space (256 is constant)"
expectedOutput: "removeDup(programming)=progamin\n"
---

## Description

Keep only the FIRST occurrence of each character, remove all repeats.

## Algorithm

```text
step1: Create a boolean seen[256] array, all false
step2: Use a write-index 'w' starting at 0
step3: For each char in the string:
       - if NOT seen: copy to str[w++], mark seen[ch] = 1
       - if already seen: skip it
step4: Null-terminate: str[w] = '\0'
```

## Example Trace

```text
"programming" -> "progamin"

str = "banana"
  'b': not seen, keep -> "b", w=1
  'a': not seen, keep -> "ba", w=2
  'n': not seen, keep -> "ban", w=3
  'a': SEEN, skip
  'n': SEEN, skip
  'a': SEEN, skip
  Result: "ban"
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
    char s[]="programming";
    removeDupChars(s);
    printf("removeDup(programming)=%s\n", s);
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

void removeDupChars(char *str) {
    int seen[256] = {0};
    int w = 0;                         /* write index */
    for (int r = 0; str[r]; r++) {
        unsigned char ch = (unsigned char)str[r];
        if (!seen[ch]) {
            seen[ch] = 1;
            str[w++] = str[r];
        }
    }
    str[w] = '\0';
}

int main(void) {
    char s[]="programming"; removeDupChars(s); printf("removeDup(programming)=%s\n", s);
    return 0;
}
```
