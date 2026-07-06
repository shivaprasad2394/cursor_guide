---
id: "q69-bstdelete-the-three-cases"
title: "bstDelete - the three cases"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(h) find + O(h) relink — O(log n) balanced"
tape: "after delete 50, inorder: "
stdin: ""
expectedOutput: "after delete 50, inorder: 20 30 40 60 70 80\n"
---
## At a glance

- **Goal:** bstDelete - the three cases
- **Pattern:** Binary search tree
- **Complexity:** O(h) to find node + O(h) to fix links — O(log n) balanced, O(n) worst
- **Expected output:** `after delete 50, inorder: 20 30 40 60 70 80`

## Description

Remove a key from a BST and keep the ordering rule intact. First **find** the node (same comparisons as search). Then handle **three cases**:

| Case | Node to delete | Action |
|------|----------------|--------|
| **1** | No left child | Return right child as new subtree root (may be `NULL`) |
| **2** | No right child | Return left child as new subtree root |
| **3** | Two children | Copy **successor** key into this node, then delete the successor from the right subtree |

For case 3, the **in-order successor** is the smallest key in the right subtree — `bstMin(root->right)`. Copy its id up, then recursively delete that duplicate key from the right side (which becomes case 1 or 2).

Use the same **return-root pattern** as insert: `root = bstDelete(root, id)`.

`main()` inserts `{50, 30, 70, 20, 40, 60, 80}`, deletes **50** (the root, two children), and prints inorder to prove the tree is still valid.

## Algorithm

```text
step1: If root == NULL → return NULL
step2: If id < root->id  → root->left  = bstDelete(root->left,  id); return root
step3: If id > root->id  → root->right = bstDelete(root->right, id); return root
step4: Else id == root->id (found — delete this node):
  Case 1 — no left child:  save r = root->right; free(root); return r
  Case 2 — no right child: save l = root->left;  free(root); return l
  Case 3 — two children:
    succ = bstMin(root->right)
    root->id = succ->id
    root->right = bstDelete(root->right, succ->id)
    return root
```

## Example Trace

```text
Before delete 50:

        [50]
       /    \
    [30]    [70]
    /  \    /  \
 [20][40][60][80]

Case 3 at root: successor = bstMin([70]) = 60
  copy: root id becomes 60
  delete 60 from right subtree (leaf → Case 1)

After delete 50, inorder: 20 30 40 60 70 80  ← still sorted
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
