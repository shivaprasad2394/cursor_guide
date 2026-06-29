---
id: "q63-bstinsert-recursive-return-root-pattern"
title: "bstInsert - recursive, return-root pattern"
pattern: "binary search tree"
difficulty: "hard"
visualization: "none"
stdin: ""
complexity: "O(h) where h = height. Balanced: O(log n). Worst: O(n)."
expectedOutput: |
  inserted 5 keys; root=50 left=30 right=70
---

## Description

Insert a value into a BST maintaining the invariant: left subtree < root < right subtree

## Algorithm

```text
step1: If root == NULL, this is the insertion point. Create & return node.
  step2: If id < root->id: recurse LEFT, assign result to root->left
  step3: If id > root->id: recurse RIGHT, assign result to root->right
  step4: If id == root->id: duplicate, do nothing
  step5: Return root (unchanged or with updated child pointer)

Why "return-root" pattern?
  The caller writes: root = bstInsert(root, 42);
  This handles the empty-tree case (root was NULL, now it's the new node)
  without needing a special check.
```

## Example Trace

```text
Insert 5 into: [10] -> left=[3], right=[15]
  5 < 10 -> recurse left with root=[3]
  5 > 3  -> recurse right with root=NULL
  root==NULL -> create [5], return it
  [3]->right = [5]
  Result: [10] -> left=[3 -> right=[5]], right=[15]
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
    50,30,70,20,40};
    for(int i=0;
    i<5;
    i++) r=bstInsert(r,k[i]);
    printf("inserted 5 keys;
    root=%d left=%d right=%d\n", r->id, r->left->id, r->right->id);
    /* leak ok for demo */
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

int main(void) {
    BstNode*r=NULL; int k[]={50,30,70,20,40}; for(int i=0;i<5;i++) r=bstInsert(r,k[i]); printf("inserted 5 keys; root=%d left=%d right=%d\n", r->id, r->left->id, r->right->id); /* leak ok for demo */
    return 0;
}
```
