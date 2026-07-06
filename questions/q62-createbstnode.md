---
id: "q62-createbstnode"
title: "createBstNode"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(1) time, O(1) space"
tape: "createBstNode(5): id=%d\\n"
stdin: ""
expectedOutput: "createBstNode(5): id=5\n"
---
## At a glance

- **Goal:** createBstNode
- **Pattern:** Binary search tree
- **Complexity:** O(1) time, O(1) space
- **Expected output:** `createBstNode(5): id=5`

## Description

Write a small factory for BST nodes. Every other BST operation (`bstInsert`, `bstSearch`, …) assumes nodes look like this: an **`id`** (the key) plus **`left`** and **`right`** child pointers, both starting as `NULL`.

Your job: allocate one node, set its fields, and return the pointer. `main()` calls `createBstNode(5)`, prints the id, and frees the node.

**BST node shape:**

```text
BstNode { id, left → NULL, right → NULL }
```

## Algorithm

```text
step1: n = malloc(sizeof(BstNode)); if n == NULL return NULL
step2: n->id = id
step3: n->left = n->right = NULL
step4: return n
```

## Example Trace

```text
createBstNode(5)
  malloc → node at 0x1000
  id=5, left=NULL, right=NULL
  print: createBstNode(5): id=5
```

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
