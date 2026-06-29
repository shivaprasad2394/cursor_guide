---
id: "q64-bstsearch"
title: "bstSearch"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "search 40: found\nsearch 99: not found\n"
---

## Description

bstSearch

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
    50,30,70,20,40};
    for(int i=0;
    i<5;
    i++) r=bstInsert(r,k[i]);
    printf("search 40: %s\n", bstSearch(r,40)?"found":"not found");
    printf("search 99: %s\n", bstSearch(r,99)?"found":"not found");
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

BstNode *bstSearch(BstNode *root, int key) {
    if (root == NULL || root->id == key) return root;
    if (key < root->id) return bstSearch(root->left,  key);
    else                return bstSearch(root->right, key);
}

int main(void) {
    BstNode*r=NULL; int k[]={50,30,70,20,40}; for(int i=0;i<5;i++) r=bstInsert(r,k[i]); printf("search 40: %s\n", bstSearch(r,40)?"found":"not found"); printf("search 99: %s\n", bstSearch(r,99)?"found":"not found");
    return 0;
}
```
