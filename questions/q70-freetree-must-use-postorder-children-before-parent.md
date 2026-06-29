---
id: "q70-freetree-must-use-postorder-children-before-parent"
title: "freeTree - MUST use postorder (children before parent!)"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: |
  tree freed (postorder)
---

## Description

freeTree - MUST use postorder (children before parent!)

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
    50,30,70};
    for(int i=0;
    i<3;
    i++) r=bstInsert(r,k[i]);
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
    if      (id <  root->id) root->left  = bstInsert(root->left,  id);
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
    BstNode*r=NULL; int k[]={50,30,70}; for(int i=0;i<3;i++) r=bstInsert(r,k[i]); freeTree(r); printf("tree freed (postorder)\n");
    return 0;
}
```
