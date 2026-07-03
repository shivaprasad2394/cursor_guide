---
id: "q62-createbstnode"
title: "createBstNode"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
tape: "createBstNode(5): id=%d\\n"
stdin: ""
expectedOutput: "createBstNode(5): id=5\n"
---
## At a glance

- **Goal:** createBstNode
- **Pattern:** Binary search tree
- **Complexity:** See algorithm
- **Expected output:** `createBstNode(5): id=5`

## Description

Implement **createBstNode** using the pattern above. Write the helper function(s); `main()` is provided.

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct BstNode { int id; struct BstNode *left,*right; } BstNode;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    BstNode*n=createBstNode(5);
    printf("createBstNode(5): id=%d\n", n->id);
    free(n);
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

typedef struct BstNode { int id; struct BstNode *left,*right; } BstNode;

BstNode *createBstNode(int id) {
    BstNode *n = (BstNode *)malloc(sizeof(*n));
    if (n == NULL) return NULL;
    n->id = id; n->left = n->right = NULL;
    return n;
}

int main(void) {
    BstNode*n=createBstNode(5); printf("createBstNode(5): id=%d\n", n->id); free(n);
    return 0;
}
```
