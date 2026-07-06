---
id: "q90-avl-height-and-balance-factor"
title: "AVL \u2014 node height and balance factor"
pattern: "avl tree"
difficulty: "hard"
visualization: "avl-tree"
treeKeys: "30,20,10"
stdin: ""
complexity: "O(1) per node, O(n) to refresh whole tree"
expectedOutput: "height(30)=3 bf(30)=0 bf(20)=1 bf(10)=0\n"
---
## At a glance

- **Goal:** AVL — node height and balance factor
- **Pattern:** AVL tree
- **Complexity:** O(1) per node, O(n) to refresh whole tree
- **Expected output:** `height(30)=3 bf(30)=0 bf(20)=1 bf(10)=0`

## Description

A **BST** only guarantees ordering; an **AVL tree** adds a height balance rule so the tree stays **O(log n)** tall.

Each node stores an extra **`height`** field (1 for a leaf). From that:

**Balance factor (BF)** = `height(left) − height(right)`

| BF | Meaning |
|----|---------|
| **0** | Subtrees equal height |
| **+1** | Left one level taller — still OK |
| **−1** | Right one level taller — still OK |
| **±2 or worse** | Unbalanced — needs a rotation (later questions) |

`nodeHeight(NULL)` returns **0** so leaves behave correctly.

`main()` builds a small left-skewed tree on the stack (`30 → 20 → 10`) and prints each node's height and balance factor.

## Algorithm

```text
nodeHeight(n):
  step1: If n == NULL → return 0
  step2: Else return n->height   (stored field, not computed on the fly here)

balanceFactor(n):
  step1: If n == NULL → return 0
  step2: return nodeHeight(n->left) - nodeHeight(n->right)

Walk the three nodes and print height(30) and BF at 30, 20, 10
```

## Example Trace

```text
Tree:     30          heights        balance factors
         /            h(10)=1        bf(10)=0
       20             h(20)=2        bf(20)=+1  ← left taller, OK
       /              h(30)=3        bf(30)=0
     10

Output: height(30)=3 bf(30)=0 bf(20)=1 bf(10)=0
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
