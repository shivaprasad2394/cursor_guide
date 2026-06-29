---
id: "q07-first-and-second-non-repeating-character"
title: "First and Second Non-Repeating Character"
pattern: "frequency table (two-pass)"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  findNonRepeating(aabccbde):
  First non-repeating: 'd'
  Second non-repeating: 'e'
---

## Description

Find the first two characters that appear exactly once in the string. Must preserve the ORDER they appear in the string (not the freq table).

## Algorithm

```text
step1: Count frequency of each char using freq[256]
step2: Walk the STRING (not freq table!) from left to right
step3: First char with freq==1 is the "first non-repeating"
step4: Second char with freq==1 is the "second non-repeating"
```

## Example Trace

```text
str = "aabccbde"
  freq: a=2, b=2, c=2, d=1, e=1
  Walk string: a(2),a(2),b(2),c(2),c(2),b(2),d(1)->FIRST, e(1)->SECOND
  Result: First='d', Second='e'
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
    printf("findNonRepeating(aabccbde):\n");
    findNonRepeating("aabccbde");
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

void findNonRepeating(const char *str) {
    int freq[256] = {0};
    for (int i = 0; str[i]; i++)
        freq[(unsigned char)str[i]]++;

    int found = 0;
    for (int i = 0; str[i] && found < 2; i++) {
        if (freq[(unsigned char)str[i]] == 1) {
            found++;
            printf("%s non-repeating: '%c'\n",
                   found == 1 ? "First" : "Second", str[i]);
        }
    }
    if (found < 2) printf("Fewer than 2 unique chars\n");
}

int main(void) {
    printf("findNonRepeating(aabccbde):\n"); findNonRepeating("aabccbde");
    return 0;
}
```
