---
id: "q92-avl-insert-ll-rebalance"
title: "AVL insert with LL rebalance"
pattern: "avl tree"
difficulty: "hard"
visualization: "tree"
treeKeys: "30,20,10"
stdin: ""
complexity: "O(log n) per insert"
expectedOutput: "insert 30,20,10 -> root=20 height=2\\\\\\\\n"
---
## At a glance

- **Goal:** AVL insert with LL rebalance
- **Pattern:** AVL tree
- **Complexity:** O(log n) per insert

## Description

Insert keys into an AVL tree; after each insert, update heights and rotate when |BF| > 1. Insert **30, 20, 10** triggers an **LL** case → **rotate right** at root.

**Walkthrough hint:**

After insert 10: root becomes 20

## Algorithm

```text
step1: Standard BST insert by key
step2: On unwind, updateHeight(node)
step3: bf = balanceFactor(node)
step4: If bf > 1 and key < node->left->id  -> LL -> rotateRight(node)
step5: If bf < -1 and key > node->right->id -> RR -> rotateLeft(node)
step6: (LR/RL: rotate child first, then parent — full avlInsert handles all four)
step7: Return new subtree root
```

## Example Trace

```text
insert 30:  [30]
insert 20:  [30]/[20]        bf(30)=+1 OK
insert 10:  [30]/[20]/[10]  bf(30)=+2, LL -> rotateRight
Result:       [20]
             /    \
           10     30
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
    AvlNode *root = NULL;
    int keys[] = {30, 20, 10};
    for (int i = 0; i < 3; i++) {
        root = avlInsert(root, keys[i]);
    }
    printf("insert 30,20,10 -> root=%d height=%d\n", root->id, root->height);
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

AvlNode *createAvlNode(int id) {
    AvlNode *n = (AvlNode *)malloc(sizeof(*n));
    if (!n) return NULL;
    n->id = id;
    n->height = 1;
    n->left = n->right = NULL;
    return n;
}

int nodeHeight(AvlNode *n) {
    return n ? n->height : 0;
}

int balanceFactor(AvlNode *n) {
    return n ? nodeHeight(n->left) - nodeHeight(n->right) : 0;
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

AvlNode *avlInsert(AvlNode *node, int id) {
    if (!node) return createAvlNode(id);

    if (id < node->id) {
        node->left = avlInsert(node->left, id);
    } else if (id > node->id) {
        node->right = avlInsert(node->right, id);
    } else {
        return node;
    }

    updateHeight(node);
    int bf = balanceFactor(node);

    if (bf > 1 && id < node->left->id) {
        return rotateRight(node);
    }
    if (bf < -1 && id > node->right->id) {
        return rotateLeft(node);
    }
    if (bf > 1 && id > node->left->id) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    if (bf < -1 && id < node->right->id) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }
    return node;
}

int main(void) {
    AvlNode *root = NULL;
    int keys[] = {30, 20, 10};
    for (int i = 0; i < 3; i++) {
        root = avlInsert(root, keys[i]);
    }
    printf("insert 30,20,10 -> root=%d height=%d\n", root->id, root->height);
    return 0;
}
```
