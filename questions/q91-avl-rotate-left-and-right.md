---
id: "q91-avl-rotate-left-and-right"
title: "AVL \u2014 single rotations (left and right)"
pattern: "avl tree"
difficulty: "hard"
visualization: "tree"
treeKeys: "30,20,10"
stdin: ""
complexity: "O(1) per rotation"
expectedOutput: "after rotateRight root=20 left=10 right=30\\\\\\\\n"
---
## At a glance

- **Goal:** AVL — single rotations (left and right)
- **Pattern:** AVL tree
- **Complexity:** O(1) per rotation

## Description

Perform **single rotations** to rebalance an AVL subtree. **Right rotation** fixes left-heavy (LL); **left rotation** fixes right-heavy (RR).

**Walkthrough hint:**

LL: rotate right at unbalanced node

## Algorithm

```text
rotateRight(y):   // LL fix at y
  x = y->left
  y->left = x->right
  x->right = y
  update heights of y, then x
  return x (new subtree root)

rotateLeft(x):    // RR fix — mirror of above
  y = x->right
  x->right = y->left
  y->left = x
  update heights
  return y
```

## Example Trace

```text
Before (LL):  30          rotateRight(30)     After:
             /                                  20
           20                                  /  \
         10                                  10   30
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct AvlNode {
    int id;
    int height;
    struct AvlNode *left;
    struct AvlNode *right;
} AvlNode;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    AvlNode n10 = {10, 1, NULL, NULL};
    AvlNode n20 = {20, 2, &n10, NULL};
    AvlNode n30 = {30, 3, &n20, NULL};

    AvlNode *root = rotateRight(&n30);
    printf("after rotateRight root=%d left=%d right=%d\n",
           root->id,
           root->left ? root->left->id : -1,
           root->right ? root->right->id : -1);
    return 0;
}
```

## Solution

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct AvlNode {
    int id;
    int height;
    struct AvlNode *left;
    struct AvlNode *right;
} AvlNode;

int nodeHeight(AvlNode *n) {
    return n ? n->height : 0;
}

void updateHeight(AvlNode *n) {
    if (!n) return;
    int hl = nodeHeight(n->left);
    int hr = nodeHeight(n->right);
    n->height = 1 + (hl > hr ? hl : hr);
}

AvlNode *rotateRight(AvlNode *y) {
    AvlNode *x = y->left;
    AvlNode *t2 = x->right;
    x->right = y;
    y->left = t2;
    updateHeight(y);
    updateHeight(x);
    return x;
}

AvlNode *rotateLeft(AvlNode *x) {
    AvlNode *y = x->right;
    AvlNode *t2 = y->left;
    y->left = x;
    x->right = t2;
    updateHeight(x);
    updateHeight(y);
    return y;
}

int main(void) {
    AvlNode n10 = {10, 1, NULL, NULL};
    AvlNode n20 = {20, 2, &n10, NULL};
    AvlNode n30 = {30, 3, &n20, NULL};

    AvlNode *root = rotateRight(&n30);
    printf("after rotateRight root=%d left=%d right=%d\n",
           root->id,
           root->left ? root->left->id : -1,
           root->right ? root->right->id : -1);
    return 0;
}
```
