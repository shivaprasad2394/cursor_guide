---
id: "q106-pointer-to-array-vs-array-of-pointers"
title: "Pointer to Array vs Array of Pointers"
pattern: "pointer types"
difficulty: "medium"
visualization: "generic"
vizCategory: "pointers"
stdin: ""
expectedOutput: "row via (*prow)[i]: 10 20 30\nnames[1]: bob\n"
---
## At a glance

- **Goal:** Pointer to Array vs Array of Pointers
- **Pattern:** Pointer Types
- **Expected output:** `row via (*prow)[i]: 10 20 30 / names[1]: bob`

## Description

Demonstrate `( *rowPtr )[COLS]` (pointer to one row) versus `char *names[]` (array of string pointers).

## Algorithm

```text
step1: int grid[2][3] — use int (*prow)[3] = grid + 1 to point at row 1
step2: Print row through (*prow)[i]
step3: char *names[] = {"alice", "bob"}; print names[1]
```

## Example Trace

```text
Row pointer reads 10 20 30; name pointer reads bob
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
    int grid[2][3] = {{1,2,3},{10,20,30}};
    int (*prow)[3] = grid + 1;
    printf("row via (*prow)[i]:");
    printRow(prow);
    const char *names[] = {"alice", "bob", "carol"};
    printf("names[1]: %s\n", names[1]);
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
void printRow(int (*row)[3]) {
    for (int i = 0; i < 3; i++) printf(" %d", (*row)[i]);
    printf("\n");
}

int main(void) {
    int grid[2][3] = {{1,2,3},{10,20,30}};
    int (*prow)[3] = grid + 1;
    printf("row via (*prow)[i]:");
    printRow(prow);
    const char *names[] = {"alice", "bob", "carol"};
    printf("names[1]: %s\n", names[1]);
    return 0;
}
```
