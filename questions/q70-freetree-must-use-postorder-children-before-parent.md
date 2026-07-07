---
id: "q70-freetree-must-use-postorder-children-before-parent"
title: "freeTree - MUST use postorder (children before parent!)"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(n) time — must visit every node"
tape: "tree freed (postorder)\\n"
stdin: ""
expectedOutput: "tree freed (postorder)\n"
---
## At a glance

- **Goal:** freeTree - MUST use postorder (children before parent!)
- **Pattern:** Binary search tree
- **Complexity:** O(n) time — visit every node once; O(h) recursion stack
- **Expected output:** `tree freed (postorder)`

## Description

Release every node in a BST back to the heap. The rule: **never `free` a node before its children** — once you free the parent, its `left`/`right` pointers are gone and you cannot reach the subtrees.

That is exactly **postorder** traversal: free left subtree, free right subtree, then free the root.

```text
WRONG (preorder):  free(root) first → lose access to children → memory leak
RIGHT (postorder): free children first, then free root
```

`main()` builds a small tree, calls `freeTree`, and prints a confirmation line.

## Algorithm

```text
step1: If root == NULL → nothing to do; return
step2: freeTree(root->left)    ← free entire left subtree first
step3: freeTree(root->right)   ← then entire right subtree
step4: free(root)              ← finally free this node
```

## Example Trace

```text
        [50]
       /    \
    [30]    [70]

Postorder visit: 30, 70, 50
  free [30] (leaf — children already NULL)
  free [70] (leaf)
  free [50]
All nodes released; root pointer in main is now dangling — do not use it after freeTree
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
    BstNode*r=NULL;
    int k[]={
        50,30,70
    };
    for (int i=0; i<3; i++) r=bstInsert(r,k[i]);
    freeTree(r);
    printf("tree freed (postorder)\n");
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
BstNode *bstInsert(BstNode *root, int id) {
    if (root == NULL) return createBstNode(id);
    if (id <  root->id) root->left  = bstInsert(root->left,  id);
    else if (id >  root->id) root->right = bstInsert(root->right, id);
    return root;
}

void freeTree(BstNode *root) {
    if (root == NULL) return;
    freeTree(root->left);
    freeTree(root->right);
    free(root);
}

int main(void) {
    BstNode*r=NULL;
    int k[]={
        50,30,70
    };
    for (int i=0;i<3;i++) r=bstInsert(r,k[i]);
    freeTree(r);
    printf("tree freed (postorder)\n");
    return 0;
}
```
