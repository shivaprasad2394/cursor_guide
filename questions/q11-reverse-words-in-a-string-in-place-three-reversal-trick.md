---
id: "q11-reverse-words-in-a-string-in-place-three-reversal-trick"
title: "Reverse Words in a String (in-place, three-reversal trick)"
pattern: "reversal trick (three reverses)"
difficulty: "easy"
visualization: "generic"
vizCategory: "strings"
tape: "the sky is blue"
stdin: ""
complexity: "O(n) time, O(1) space (in-place!)"
expectedOutput: "reverseWords=blue is sky the\n"
---
## At a glance

- **Goal:** Reverse Words in a String (in-place, three-reversal trick)
- **Pattern:** Reversal trick (three reverses)
- **Complexity:** O(n) time, O(1) space (in-place!)
- **Expected output:** `reverseWords=blue is sky the`

## Description

Implement **Reverse Words in a String (in-place, three-reversal trick)** using the pattern above. Write the helper function(s); `main()` is provided.

## Algorithm

```text
step1: Reverse the ENTIRE string
         "the sky is blue" -> "eulb si yks eht"
  step2: Reverse EACH WORD individually (between spaces)
         "eulb" -> "blue"
         "si"   -> "is"
         "yks"  -> "sky"
         "eht"  -> "the"
  Result: "blue is sky the"

Why it works:
  Reversing the whole string puts words in the right order but each
  word is backwards. Reversing each word fixes the letters.
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
    char s[]="the sky is blue";
    reverseWords(s);
    printf("reverseWords=%s\n", s);
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

static void rev(char *s, int i, int j) {
    while (i < j) { char t = s[i]; s[i] = s[j]; s[j] = t; i++; j--; }
}

void reverseWords(char *s) {
    int n = (int)strlen(s);
    rev(s, 0, n - 1);                  /* step 1: reverse whole string */

    int start = 0;
    for (int i = 0; i <= n; i++) {     /* step 2: reverse each word */
        if (s[i] == ' ' || s[i] == '\0') {
            rev(s, start, i - 1);
            start = i + 1;
        }
    }
}

int main(void) {
    char s[]="the sky is blue"; reverseWords(s); printf("reverseWords=%s\n", s);
    return 0;
}
```
