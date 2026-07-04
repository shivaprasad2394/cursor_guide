---
id: "q98-longest-substring-without-repeating-characters"
title: "Longest Substring Without Repeating Characters"
pattern: "sliding window + frequency table"
difficulty: "medium"
visualization: "generic"
vizCategory: "strings"
stdin: ""
complexity: "O(n) time, O(1) space (ASCII)"
expectedOutput: "lengthOfLongestSubstring(\"abcabcbb\")=3\\n"
---
## At a glance

- **Goal:** Longest Substring Without Repeating Characters
- **Pattern:** Sliding window + frequency table
- **Complexity:** O(n) time, O(1) space (ASCII)
- **Expected output:** `lengthOfLongestSubstring("abcabcbb")=3\n`

## Description

Find the length of the longest substring with all unique characters (classic sliding window).

**Walkthrough hint:**

s = "abcabcbb" → "abc" has length 3

## Algorithm

```text
step1: left = 0, best = 0, freq[256] = {0}
step2: For right from 0 to end:
step3:   While s[right] already in window: shrink from left
step4:   Mark s[right] seen, update best = max(best, right-left+1)
step5: Return best
```

## Example Trace

```text
s = "abcabcbb"
  window "abc" len=3, then 'a' repeats → shrink
  best stays 3 through end
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
        printf("lengthOfLongestSubstring(\"abcabcbb\")=%d\n",
               lengthOfLongestSubstring("abcabcbb"));
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
int lengthOfLongestSubstring(const char *s) {
    int freq[256] = {0}, left = 0, best = 0;
    for (int right = 0; s[right]; right++) {
        while (freq[(unsigned char)s[right]]) {
            freq[(unsigned char)s[left]]--;
            left++;
        }
        freq[(unsigned char)s[right]] = 1;
        int len = right - left + 1;
        if (len > best) best = len;
    }
    return best;
}

int main(void) {
        printf("lengthOfLongestSubstring(\"abcabcbb\")=%d\n",
               lengthOfLongestSubstring("abcabcbb"));
    return 0;
}
```
