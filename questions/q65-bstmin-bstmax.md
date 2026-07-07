---
id: "q65-bstmin-bstmax"
title: "bstMin / bstMax"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(h) time, O(1) extra space"
tape: "min=%d max=%d\\n"
stdin: ""
expectedOutput: "min=20 max=80\n"
---
## At a glance

- **Goal:** bstMin / bstMax
- **Pattern:** Binary search tree
- **Complexity:** O(h) time, O(1) extra space — O(log n) balanced, O(n) skewed
- **Expected output:** `min=20 max=80`

## Description

In a valid BST, keys are sorted along paths:

- **`bstMin`** — keep going **left** until there is no left child. That leftmost node holds the smallest key.
- **`bstMax`** — keep going **right** until there is no right child. That rightmost node holds the largest key.

No recursion needed — a simple `while` loop walks one spine of the tree.

These helpers show up often inside **`bstDelete`** (find the in-order successor in the right subtree) and in range-query code.

`main()` inserts `{50, 30, 70, 20, 80}` and prints min and max.

## Algorithm

```text
bstMin(root):
  step1: If root == NULL → return NULL
  step2: While root->left != NULL → root = root->left
  step3: return root

bstMax(root):
  step1: If root == NULL → return NULL
  step2: While root->right != NULL → root = root->right
  step3: return root
```

## Example Trace

```text
        [50]
       /    \
    [30]    [70]
    /
 [20]              [80] hangs off 70's right

bstMin: 50 → 30 → 20 (no left)  → min = 20
bstMax: 50 → 70 → 80 (no right) → max = 80
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
        50,30,70,20,80
    };
    for (int i=0; i<5; i++) r=bstInsert(r,k[i]);
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
    if (id <  root->id) root->left  = bstInsert(root->left,  id);
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
    BstNode*r=NULL;
    int k[]={
        50,30,70,20,80
    };
    for (int i=0;i<5;i++) r=bstInsert(r,k[i]);
    printf("min=%d max=%d\n", bstMin(r)->id, bstMax(r)->id);
    return 0;
}
```
