---
id: "q101-valid-parentheses"
title: "Valid Parentheses"
pattern: "stack (array-backed)"
difficulty: "easy"
visualization: "generic"
vizCategory: "queues & stacks"
stdin: ""
complexity: "O(n) time, O(n) space"
expectedOutput: "isValid(\"()\")=1\\nisValid(\"(]\")=0\\n"
---
## At a glance

- **Goal:** Valid Parentheses
- **Pattern:** Stack (array-backed)
- **Complexity:** O(n) time, O(n) space
- **Expected output:** `isValid("()")=1\nisValid("(]")=0\n`

## Description

Given a string of brackets `()[]{}`, determine if it is valid (every opener has a matching closer in order).

**Walkthrough hint:**

s = "{[]}" → valid; s = "(]" → invalid

## Algorithm

```text
step1: Stack of opening brackets
step2: For each char: if opener, push; if closer, pop must match
step3: Valid iff stack empty at end
```

## Example Trace

```text
s = "{[]}"
  push {, push [, pop [ with ], pop { with } → empty → valid
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
    printf("isValid(\"()\")=%d\n", isValid("()"));
    printf("isValid(\"(]\")=%d\n", isValid("(]"));
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
int isValid(const char *s) {
    char st[128];
    int top = 0;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') st[top++] = c;
        else {
            if (!top) return 0;
            char o = st[--top];
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                return 0;
        }
    }
    return top == 0;
}

int main(void) {
    printf("isValid(\"()\")=%d\n", isValid("()"));
    printf("isValid(\"(]\")=%d\n", isValid("(]"));
    return 0;
}
```
