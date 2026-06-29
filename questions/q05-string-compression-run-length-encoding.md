---
id: "q05-string-compression-run-length-encoding"
title: "String Compression (Run-Length Encoding)"
pattern: "count runs"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(n) space for output"
expectedOutput: |
  compress=a2b1c5a3
---

## Description

Replace consecutive identical chars with char + count.

## Algorithm

```text
step1: Walk the string from left to right
step2: At each position, count how many consecutive identical chars follow
step3: Write the character and its count to the output buffer
step4: Jump past the group (i += count) and repeat
```

## Example Trace

```text
"aabcccccaaa" -> "a2b1c5a3"

str = "aabcccccaaa"
  i=0: ch='a', count=2 -> write "a2", i jumps to 2
  i=2: ch='b', count=1 -> write "b1", i jumps to 3
  i=3: ch='c', count=5 -> write "c5", i jumps to 8
  i=8: ch='a', count=3 -> write "a3", i jumps to 11
  Result: "a2b1c5a3"
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
    char out[64];
    compressString("aabcccccaaa",out,sizeof out);
    printf("compress=%s\n",out);
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

void compressString(const char *str, char *out, int outCap) {
    int len = (int)strlen(str);
    int w = 0;
    for (int i = 0; i < len; ) {
        char ch = str[i];
        int count = 1;
        while (i + count < len && str[i + count] == ch) count++;
        int written = snprintf(out + w, (size_t)(outCap - w), "%c%d", ch, count);
        if (written < 0 || w + written >= outCap) break;   /* safety */
        w += written;
        i += count;
    }
    out[w] = '\0';
}

int main(void) {
    char out[64]; compressString("aabcccccaaa",out,sizeof out); printf("compress=%s\n",out);
    return 0;
}
```
