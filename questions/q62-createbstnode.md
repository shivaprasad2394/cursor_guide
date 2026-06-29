---
id: "q62-createbstnode"
title: "createBstNode"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: |
  createBstNode(5): id=5
---

## Description

createBstNode

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
