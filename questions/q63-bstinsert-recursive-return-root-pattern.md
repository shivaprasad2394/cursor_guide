---
id: "q63-bstinsert-recursive-return-root-pattern"
title: "bstInsert - recursive, return-root pattern"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
stdin: ""
complexity: "O(h) where h = height. Balanced: O(log n). Worst: O(n)."
expectedOutput: "inserted 5 keys; root=50 left=30 right=70\n"
---
## At a glance

- **Goal:** bstInsert - recursive, return-root pattern
- **Pattern:** Binary search tree
- **Complexity:** O(h) where h = height. Balanced: O(log n). Worst: O(n).
- **Expected output:** `inserted 5 keys; root=50 left=30 right=70`

## Description

Insert a key into a **binary search tree (BST)** while keeping the ordering rule:

> every node in the **left** subtree has a **smaller** id; every node in the **right** subtree has a **larger** id.

Walk down from the root comparing the new key: go **left** if smaller, **right** if larger. When you hit `NULL`, that empty spot is where the new node belongs.

This question uses the **return-root pattern**: `bstInsert` always returns the (possibly new) root, so the caller writes `root = bstInsert(root, key)`. That cleanly handles the first insert into an empty tree (`root` was `NULL`, now it points at the new node) without a separate `if (root == NULL)` in `main`.

`main()` inserts `{50, 30, 70, 20, 40}` and prints the root and its immediate children.

**Walkthrough hint:** inserting 5 into a tree whose root is 10 (left child 3, right child 15) sends you left, then right, then into an empty slot.

## Algorithm

```text
step1: If root == NULL → insertion point. return createBstNode(id)
step2: If id < root->id  → root->left  = bstInsert(root->left,  id)
step3: If id > root->id  → root->right = bstInsert(root->right, id)
step4: If id == root->id → duplicate key; leave tree unchanged
step5: return root   ← caller always gets back the root pointer
```

**Why return the root?** On the first insert, step 1 replaces `NULL` with a brand-new node. The caller must assign that pointer back: `r = bstInsert(r, 50)`.

## Example Trace

```text
Insert 5 into:        [10]
                     /    \
                   [3]    [15]

  5 < 10  → go left to [3]
  5 > 3   → go right to NULL  → create [5], link as [3]->right
  Result: [10] with left subtree [3] → [5]
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
    printf("inserted 5 keys; root=%d left=%d right=%d\n", r->id, r->left->id, r->right->id);
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
    if (id <  root->id) root->left  = bstInsert(root->left,  id);
    else if (id >  root->id) root->right = bstInsert(root->right, id);
    return root;
}

int main(void) {
    BstNode*r=NULL;
    int k[]={
        50,30,70,20,40
    };
    for (int i=0;i<5;i++) r=bstInsert(r,k[i]);
    printf("inserted 5 keys; root=%d left=%d right=%d\n", r->id, r->left->id, r->right->id);
    /* leak ok for demo */
    return 0;
}
```
