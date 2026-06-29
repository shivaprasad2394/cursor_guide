---
id: "q02-check-for-anagram"
title: "Check for Anagram"
pattern: "frequency table"
difficulty: "easy"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space (256 is constant)"
expectedOutput: "isAnagram(listen,silent)=1\nisAnagram(hello,world)=0\n"
---

## Description

Two strings are anagrams if one can be formed by rearranging the letters of the other. Example: "listen" and "silent".

## Algorithm

```text
step1: If lengths differ, return 0 (cannot be anagram)
step2: Create a frequency array of 256 slots (one per ASCII char)
step3: Walk both strings simultaneously:
       - freq[str1[i]]++ (count chars in first string)
       - freq[str2[i]]-- (un-count chars using second string)
step4: If all freq[] entries are 0, strings are anagrams
```

## Example Trace

```text
str1="listen", str2="silent"
  After counting: freq['l']=0, freq['i']=0, freq['s']=0, ...
  All zero -> anagram!

str1="hello", str2="world"
  freq['h']=1, freq['w']=-1, ... -> NOT all zero -> not anagram
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
    printf("isAnagram(listen,silent)=%d\n", isAnagram("listen","silent"));
    printf("isAnagram(hello,world)=%d\n", isAnagram("hello","world"));
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

int isAnagram(const char *str1, const char *str2) {
    if (strlen(str1) != strlen(str2)) return 0;
    int freq[256] = {0};
    for (int i = 0; str1[i]; i++) {
        freq[(unsigned char)str1[i]]++;   /* cast: avoid negative index if char is signed */
        freq[(unsigned char)str2[i]]--;
    }
    for (int i = 0; i < 256; i++) {
        if (freq[i] != 0) return 0;       /* mismatch found */
    }
    return 1;
}

int main(void) {
    printf("isAnagram(listen,silent)=%d\n", isAnagram("listen","silent")); printf("isAnagram(hello,world)=%d\n", isAnagram("hello","world"));
    return 0;
}
```
