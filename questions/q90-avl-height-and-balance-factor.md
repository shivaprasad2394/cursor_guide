---
id: "q90-avl-height-and-balance-factor"
title: "AVL — node height and balance factor"
pattern: "avl tree"
difficulty: "hard"
visualization: "none"
stdin: ""
complexity: "O(1) per node, O(n) to refresh whole tree"
expectedOutput: "height(30)=3 bf(30)=0 bf(20)=1 bf(10)=0\n"
---

## Description

An AVL tree stores **height** in each node. **Balance factor** = height(left) − height(right). A node is balanced when BF is −1, 0, or +1.

Given a small tree (30 root, left 20, left-left 10), compute heights and balance factors.

## Algorithm

```text
step1: height(NULL) = 0
step2: height(node) = 1 + max(height(left), height(right))
step3: balanceFactor(node) = height(left) - height(right)
step4: Walk nodes, print height at root and BF at each node you care about
```

## Example Trace

```text
Tree:     30
         /
       20
       /
     10

height(10)=1, height(20)=2, height(30)=3
bf(10)=0, bf(20)=+1, bf(30)=0
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

    printf("height(30)=%d bf(30)=%d bf(20)=%d bf(10)=%d\n",
           nodeHeight(&n30), balanceFactor(&n30),
           balanceFactor(&n20), balanceFactor(&n10));
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

int balanceFactor(AvlNode *n) {
    if (!n) return 0;
    return nodeHeight(n->left) - nodeHeight(n->right);
}

int main(void) {
    AvlNode n10 = {10, 1, NULL, NULL};
    AvlNode n20 = {20, 2, &n10, NULL};
    AvlNode n30 = {30, 3, &n20, NULL};

    printf("height(30)=%d bf(30)=%d bf(20)=%d bf(10)=%d\n",
           nodeHeight(&n30), balanceFactor(&n30),
           balanceFactor(&n20), balanceFactor(&n10));
    return 0;
}
```
