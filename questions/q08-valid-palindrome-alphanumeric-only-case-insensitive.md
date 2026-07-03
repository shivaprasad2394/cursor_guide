---
id: "q08-valid-palindrome-alphanumeric-only-case-insensitive"
title: "Valid Palindrome (alphanumeric only, case-insensitive)"
pattern: "two-pointer (opposite ends) + skip"
difficulty: "easy"
visualization: "two-pointer"
tape: "A man, a plan, a canal: Panama"
trace:
  - {"left": 0, "right": 29, "note": "A \u2194 a"}
  - {"left": 1, "right": 28, "note": "  \u2194 m"}
  - {"left": 2, "right": 27, "note": "m \u2194 a"}
  - {"left": 3, "right": 26, "note": "a \u2194 n"}
  - {"left": 4, "right": 25, "note": "n \u2194 a"}
  - {"left": 5, "right": 24, "note": ", \u2194 P"}
  - {"left": 6, "right": 23, "note": "  \u2194  "}
  - {"left": 7, "right": 22, "note": "a \u2194 :"}
  - {"left": 8, "right": 21, "note": "  \u2194 l"}
  - {"left": 9, "right": 20, "note": "p \u2194 a"}
  - {"left": 10, "right": 19, "note": "l \u2194 n"}
  - {"left": 11, "right": 18, "note": "a \u2194 a"}
  - {"left": 12, "right": 17, "note": "n \u2194 c"}
  - {"left": 13, "right": 16, "note": ", \u2194  "}
  - {"left": 14, "right": 15, "note": "  \u2194 a"}
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "validPalindrome(\"A man, a plan, a canal: Panama\")=1\n"
---
## At a glance

- **Goal:** Valid Palindrome (alphanumeric only, case-insensitive)
- **Pattern:** Two-pointer (opposite ends) + skip
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `validPalindrome("A man, a plan, a canal: Panama")=1`

## Description

Check if a string is a palindrome, considering only alphanumeric characters and ignoring case.

**Walkthrough hint:**

"A man, a plan, a canal: Panama" -> TRUE

## Algorithm

```text
step1: Place left=0 and right=len-1 pointers
step2: Skip non-alphanumeric from left (while !isalnum, left++)
step3: Skip non-alphanumeric from right (while !isalnum, right--)
step4: Compare tolower(left) vs tolower(right)
       - if different: NOT a palindrome, return 0
       - if same: move both pointers inward (left++, right--)
step5: Repeat until left >= right
```

## Example Trace

```text
"A man, a plan, a canal: Panama" -> TRUE

str = "A man, a plan, a canal: Panama"
  left=0('A'), right=29('a'): tolower match -> move in
  left=2('m'), right=27('m'): match -> move in
  ... all match ...
  Result: TRUE (palindrome)
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
    printf("validPalindrome(\"A man, a plan, a canal: Panama\")=%d\n", isValidPalindrome("A man, a plan, a canal: Panama"));
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

int isValidPalindrome(const char *s) {
    int left = 0, right = (int)strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left]))  left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right]))
            return 0;
        left++; right--;
    }
    return 1;
}

int main(void) {
    printf("validPalindrome(\"A man, a plan, a canal: Panama\")=%d\n", isValidPalindrome("A man, a plan, a canal: Panama"));
    return 0;
}
```
