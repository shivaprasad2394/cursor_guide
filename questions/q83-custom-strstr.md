---
id: "q83-custom-strstr"
title: "Custom strstr"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "generic"
vizCategory: "memory, dma, mmap & reimplementing libc"
tape: "hello world"
stdin: ""
expectedOutput: "my_strstr(\"hello world\",\"wor\") -> \"world\"\nmy_strstr(\"hello world\",\"xyz\") -> (null)\n"
---
## At a glance

- **Goal:** Custom strstr
- **Pattern:** Memory, dma, mmap
- **Complexity:** See algorithm
- **Expected output:** `my_strstr("hello world","wor") -> "world"`

## Description

Implement **Custom strstr** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

haystack="hello world", needle="wor"

## Algorithm

```text
step1: empty needle -> return haystack (by convention)
step2: for each start position i in haystack:
       - walk j over needle; while chars match, advance
       - if we reached needle's end, all matched -> return &haystack[i]
step3: no start matched -> return NULL
```

## Example Trace

```text
haystack="hello world", needle="wor"
  i=0..5: mismatch early
  i=6: 'w'=='w','o'=='o','r'=='r' -> needle done -> return ptr to "world"
```

## Starter Code

```c
#include <stdio.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    const char *h = "hello world";
    char *p = my_strstr(h, "wor");
    printf("my_strstr(\"%s\",\"wor\") -> \"%s\"\n", h, p ? p : "(null)");
    p = my_strstr(h, "xyz");
    printf("my_strstr(\"%s\",\"xyz\") -> %s\n", h, p ? p : "(null)");
    return 0;
}
```

## Solution

```c
/* Custom strstr: find first occurrence of needle in haystack
 *
 * Returns pointer to the start of the match, or NULL if not found.
 * (This is the simple O(n*m) approach - clear and interview-friendly.
 *  Production uses KMP/Boyer-Moore for O(n+m).)
 *
 * Algorithm:
 *   step1: empty needle -> return haystack (by convention)
 *   step2: for each start position i in haystack:
 *          - walk j over needle; while chars match, advance
 *          - if we reached needle's end, all matched -> return &haystack[i]
 *   step3: no start matched -> return NULL
 *
 * Example: haystack="hello world", needle="wor"
 *   i=0..5: mismatch early
 *   i=6: 'w'=='w','o'=='o','r'=='r' -> needle done -> return ptr to "world"
 */
#include <stdio.h>

char *my_strstr(const char *haystack, const char *needle) {
    if (*needle == '\0') return (char *)haystack;   /* empty needle */
    for (int i = 0; haystack[i] != '\0'; i++) {
        int j = 0;
        while (needle[j] != '\0' && haystack[i + j] == needle[j])
            j++;
        if (needle[j] == '\0')                       /* matched all of needle */
            return (char *)&haystack[i];
    }
    return NULL;
}

int main(void) {
    const char *h = "hello world";
    char *p = my_strstr(h, "wor");
    printf("my_strstr(\"%s\",\"wor\") -> \"%s\"\n", h, p ? p : "(null)");
    p = my_strstr(h, "xyz");
    printf("my_strstr(\"%s\",\"xyz\") -> %s\n", h, p ? p : "(null)");
    return 0;
}
```
