---
id: "q108-sort-array-of-string-pointers"
title: "Sort an Array of String Pointers"
pattern: "array of pointers"
difficulty: "medium"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "sorted: apple banana cherry date\n"
---
## At a glance

- **Goal:** Sort an Array of String Pointers
- **Pattern:** Array Of Pointers
- **Expected output:** `sorted: apple banana cherry date`

## Description

Sort `char *words[]` lexicographically by swapping pointer values (not copying strings).

## Algorithm

```text
step1: Nested loops over indices i and j
step2: If strcmp(words[i], words[j]) > 0, swap the pointer slots
```

## Example Trace

```text
delta, apple, cherry, banana → apple banana cherry delta
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
    char *words[] = {"delta", "apple", "cherry", "banana"};
    sortWords(words, 4);
    printf("sorted:");
    for (int i = 0; i < 4; i++) printf(" %s", words[i]);
    printf("\n");
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
void sortWords(char *words[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = i + 1; j < n; j++)
            if (strcmp(words[i], words[j]) > 0) {
                char *t = words[i];
                words[i] = words[j];
                words[j] = t;
            }
}

int main(void) {
    char *words[] = {"delta", "apple", "cherry", "banana"};
    sortWords(words, 4);
    printf("sorted:");
    for (int i = 0; i < 4; i++) printf(" %s", words[i]);
    printf("\n");
    return 0;
}
```
