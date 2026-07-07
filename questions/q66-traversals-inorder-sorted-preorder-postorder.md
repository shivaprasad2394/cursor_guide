---
id: "q66-traversals-inorder-sorted-preorder-postorder"
title: "Traversals: inorder (sorted!), preorder, postorder"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(n) time per traversal"
tape: "inorder: "
stdin: ""
expectedOutput: "inorder: 20 30 40 50 70 \npreorder: 50 30 20 40 70 \npostorder: 20 40 30 70 50\n"
---
## At a glance

- **Goal:** Traversals: inorder (sorted!), preorder, postorder
- **Pattern:** Binary search tree
- **Complexity:** O(n) time per traversal, O(h) recursion stack
- **Expected output:** `inorder: 20 30 40 50 70 `

## Description

A **depth-first traversal** visits every node once by recursively exploring subtrees. The only difference is **when you print the root**:

| Order | Visit pattern | On a BST |
|-------|---------------|----------|
| **Inorder** | left → root → right | keys in **sorted ascending order** |
| **Preorder** | root → left → right | root-first; useful for copying/serializing |
| **Postorder** | left → right → root | children before parent; used when **freeing** a tree |

The classic interview line: **inorder on a BST prints sorted keys** — because every left subtree is smaller and every right subtree is larger.

`main()` builds a tree from `{50, 30, 70, 20, 40}` and prints all three traversals.

## Algorithm

```text
inorder(r):
  if r == NULL return
  inorder(r->left)
  print r->id
  inorder(r->right)

preorder(r):
  if r == NULL return
  print r->id
  preorder(r->left)
  preorder(r->right)

postorder(r):
  if r == NULL return
  postorder(r->left)
  postorder(r->right)
  print r->id
```

## Example Trace

```text
        [50]
       /    \
    [30]    [70]
    /  \
 [20] [40]

inorder:   20  30  40  50  70   ← sorted!
preorder:  50  30  20  40  70   ← root before its subtrees
postorder: 20  40  30  70  50   ← children before root
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
        50,30,70,20,40
    };
    for (int i=0; i<5; i++) r=bstInsert(r,k[i]);
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
    if (id <  root->id) root->left  = bstInsert(root->left,  id);
    else if (id >  root->id) root->right = bstInsert(root->right, id);
    return root;
}

void inorder  (const BstNode *r) { if (r){ inorder(r->left);  printf("%d ",r->id); inorder(r->right); }}

void preorder (const BstNode *r) { if (r){ printf("%d ",r->id); preorder(r->left);  preorder(r->right);}}

void postorder(const BstNode *r) { if (r){ postorder(r->left); postorder(r->right); printf("%d ",r->id);}}

int main(void) {
    BstNode*r=NULL;
    int k[]={
        50,30,70,20,40
    };
    for (int i=0;i<5;i++) r=bstInsert(r,k[i]);
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
