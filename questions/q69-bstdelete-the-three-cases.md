---
id: "q69-bstdelete-the-three-cases"
title: "bstDelete - the three cases"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "after delete 50, inorder: 20 30 40 60 70 80\n"
---

## Description

bstDelete - the three cases

## Example Trace

```text
Delete 10 from:      [10]
                            /      \
                         [5]       [15]
                                  /
                               [12]
  Case 3: two children. Successor = bstMin(right) = 12
  Copy: root->id = 12. Delete 12 from right subtree (Case 1: leaf)
  Result:     [12]
            /      \
         [5]       [15]
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
    50,30,70,20,40,60,80};
    for(int i=0;
    i<7;
    i++) r=bstInsert(r,k[i]);
    r=bstDelete(r,50);
    printf("after delete 50, inorder: ");
    inorder(r);
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
BstNode *bstMin(BstNode *root) {
    if (root == NULL) return NULL;
    while (root->left) root = root->left;
    return root;
}
void inorder  (const BstNode *r) { if(r){ inorder(r->left);  printf("%d ",r->id); inorder(r->right); }}

BstNode *bstDelete(BstNode *root, int id) {
    if (root == NULL) return NULL;
    if      (id <  root->id) root->left  = bstDelete(root->left,  id);
    else if (id >  root->id) root->right = bstDelete(root->right, id);
    else {
        if (root->left == NULL) { BstNode *r = root->right; free(root); return r; }
        if (root->right == NULL){ BstNode *l = root->left;  free(root); return l; }
        BstNode *succ = bstMin(root->right);
        root->id      = succ->id;
        root->right   = bstDelete(root->right, succ->id);
    }
    return root;
}

int main(void) {
    BstNode*r=NULL; int k[]={50,30,70,20,40,60,80}; for(int i=0;i<7;i++) r=bstInsert(r,k[i]); r=bstDelete(r,50); printf("after delete 50, inorder: "); inorder(r); printf("\n");
    return 0;
}
```
