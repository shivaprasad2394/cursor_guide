---
id: "q65-bstmin-bstmax"
title: "bstMin / bstMax"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "min=20 max=80\n"
---

## Description

bstMin / bstMax

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
    50,30,70,20,80};
    for(int i=0;
    i<5;
    i++) r=bstInsert(r,k[i]);
    printf("min=%d max=%d\n", bstMin(r)->id, bstMax(r)->id);
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

BstNode *bstMin(BstNode *root) {
    if (root == NULL) return NULL;
    while (root->left) root = root->left;
    return root;
}

BstNode *bstMax(BstNode *root) {
    if (root == NULL) return NULL;
    while (root->right) root = root->right;
    return root;
}

int main(void) {
    BstNode*r=NULL; int k[]={50,30,70,20,80}; for(int i=0;i<5;i++) r=bstInsert(r,k[i]); printf("min=%d max=%d\n", bstMin(r)->id, bstMax(r)->id);
    return 0;
}
```
