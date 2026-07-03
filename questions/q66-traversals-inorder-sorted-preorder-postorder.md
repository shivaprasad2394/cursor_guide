---
id: "q66-traversals-inorder-sorted-preorder-postorder"
title: "Traversals: inorder (sorted!), preorder, postorder"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
tape: "inorder: "
stdin: ""
expectedOutput: "inorder: 20 30 40 50 70 \npreorder: 50 30 20 40 70 \npostorder: 20 40 30 70 50\n"
---
## At a glance

- **Goal:** Traversals: inorder (sorted!), preorder, postorder
- **Pattern:** Binary search tree
- **Complexity:** See algorithm
- **Expected output:** `inorder: 20 30 40 50 70 `

## Description

Implement **Traversals: inorder (sorted!), preorder, postorder** using the pattern above. Write the helper function(s); `main()` is provided.

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
    printf("inorder: ");
    inorder(r);
    printf("\npreorder: ");
    preorder(r);
    printf("\npostorder: ");
    postorder(r);
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

void inorder  (const BstNode *r) { if(r){ inorder(r->left);  printf("%d ",r->id); inorder(r->right); }}

void preorder (const BstNode *r) { if(r){ printf("%d ",r->id); preorder(r->left);  preorder(r->right);}}

void postorder(const BstNode *r) { if(r){ postorder(r->left); postorder(r->right); printf("%d ",r->id);}}

int main(void) {
    BstNode*r=NULL; int k[]={50,30,70,20,40}; for(int i=0;i<5;i++) r=bstInsert(r,k[i]); printf("inorder: "); inorder(r); printf("\npreorder: "); preorder(r); printf("\npostorder: "); postorder(r); printf("\n");
    return 0;
}
```
