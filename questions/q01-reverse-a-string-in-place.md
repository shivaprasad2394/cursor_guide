---
id: "q01-reverse-a-string-in-place"
title: "Reverse a String (in-place)"
pattern: "two-pointer (opposite ends)"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  reverse("hello") = olleh
---

## Description

Reverse the characters of a string without using extra memory.

## Algorithm

```text
step1: Place 'left' pointer at index 0, 'right' pointer at last char (len-1)
step2: Swap characters at left and right positions
step3: Move left forward (left++), move right backward (right--)
step4: Repeat step2-3 until left >= right (pointers meet in middle)
```

## Example Trace

```text
str = "hello"
  left=0, right=4: swap 'h' and 'o' -> "oellh"
  left=1, right=3: swap 'e' and 'l' -> "olleh"
  left=2, right=2: pointers meet, STOP
  Result: "olleh"
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
    char s[]="hello";
    reverseString(s);
    printf("reverse(\"hello\") = %s\n", s);
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

void reverseString(char *s) {
    int left = 0;
    int right = (int)strlen(s) - 1;
    while (left < right) {
        char t = s[left];          /* save left char */
        s[left]  = s[right];       /* overwrite left with right */
        s[right] = t;              /* put saved char at right */
        left++;                    /* shrink window inward */
        right--;
    }
}

int main(void) {
    char s[]="hello"; reverseString(s); printf("reverse(\"hello\") = %s\n", s);
    return 0;
}
```
