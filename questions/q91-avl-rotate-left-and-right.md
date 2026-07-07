---
id: "q91-avl-rotate-left-and-right"
title: "AVL \u2014 single rotations (left and right)"
pattern: "avl tree"
difficulty: "hard"
visualization: "avl-tree"
treeKeys: "30,20,10"
stdin: ""
complexity: "O(1) per rotation"
expectedOutput: "after rotateRight root=20 left=10 right=30\\\\\\\\n"
---
## At a glance

- **Goal:** AVL — single rotations (left and right)
- **Pattern:** AVL tree
- **Complexity:** O(1) per rotation
- **Expected output:** `after rotateRight root=20 left=10 right=30`

## Description

When a subtree becomes **too left-heavy** (BF = +2 at the top of a left-left chain), a **single right rotation** fixes it. The mirror **left rotation** fixes a right-right (RR) chain.

Think of a right rotation at node **y** as promoting **y->left** to be the new subtree root:

```text
rotateRight(y):   x = y->left
                  x->right becomes y->left
                  x->right = y
                  return x
```

After rewiring, call **`updateHeight`** on the old root (**y**) first, then the new root (**x**).

`main()` builds the LL chain `30 → 20 → 10`, calls **`rotateRight(&n30)`**, and prints the new root and its children.

## Algorithm

```text
rotateRight(y):
  step1: x = y->left,  t2 = x->right
  step2: x->right = y;  y->left = t2
  step3: updateHeight(y); updateHeight(x)
  step4: return x   ← new subtree root

rotateLeft(x):     mirror — promote x->right
  step1: y = x->right, t2 = y->left
  step2: y->left = x;  x->right = t2
  step3: updateHeight(x); updateHeight(y)
  step4: return y
```

## Example Trace

```text
Before (LL, BF(30)=+2):          rotateRight(30):          After:
      30                              20                      20
     /                               /  \                    /  \
   20          ─────────►          10   30                10   30
  /
10
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
    AvlNode n10 = {
        10, 1, NULL, NULL
    }
    AvlNode n20 = {
        20, 2, &n10, NULL
    }
    AvlNode n30 = {
        30, 3, &n20, NULL
    }
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
    AvlNode n10 = {
        10, 1, NULL, NULL
    }
    AvlNode n20 = {
        20, 2, &n10, NULL
    }
    AvlNode n30 = {
        30, 3, &n20, NULL
    }
    AvlNode *root = rotateRight(&n30);
    printf("after rotateRight root=%d left=%d right=%d\n",
           root->id,
           root->left ? root->left->id : -1,
           root->right ? root->right->id : -1);
    return 0;
}
```
