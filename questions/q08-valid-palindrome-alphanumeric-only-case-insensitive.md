---
id: "q08-valid-palindrome-alphanumeric-only-case-insensitive"
title: "Valid Palindrome (alphanumeric only, case-insensitive)"
pattern: "two-pointer (opposite ends) + skip"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "validPalindrome(\"A man, a plan, a canal: Panama\")=1\n"
---

## Description

Check if a string is a palindrome, considering only alphanumeric characters and ignoring case.

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
