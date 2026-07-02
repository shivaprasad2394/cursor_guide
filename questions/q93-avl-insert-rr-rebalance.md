---
id: "q93-avl-insert-rr-rebalance"
title: "AVL insert with RR rebalance"
pattern: "avl tree"
difficulty: "hard"
visualization: "tree"
treeKeys: "10,20,30"
stdin: ""
complexity: "O(log n) per insert"
expectedOutput: "insert 10,20,30 -> root=20 height=2\\\\n"
---
## At a glance

- **Goal:** AVL insert with RR rebalance
- **Pattern:** AVL tree
- **Complexity:** O(log n) per insert

## Description

Same as LL insert, but keys **10, 20, 30** trigger **RR** → **rotate left** at root. After rebalance, root is **20**.

**Walkthrough hint:**

After insert 30: root becomes 20

## Algorithm

```text
step1: BST insert 10, then 20, then 30
step2: At node 10 after inserting 30: bf = -2, RR case
step3: rotateLeft(10) -> new root 20 with children 10 and 30
```

## Example Trace

```text
insert 10:  [10]
insert 20:  [10]\\[20]       bf(10)=-1 OK
insert 30:  [10]\\[20]\\[30] bf(10)=-2, RR -> rotateLeft
Result:       [20]
             /    \\
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
    int keys[] = {10, 20, 30};
    for (int i = 0; i < 3; i++) {
        root = avlInsert(root, keys[i]);
    }
    printf("insert 10,20,30 -> root=%d height=%d\n", root->id, root->height);
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
    int keys[] = {10, 20, 30};
    for (int i = 0; i < 3; i++) {
        root = avlInsert(root, keys[i]);
    }
    printf("insert 10,20,30 -> root=%d height=%d\n", root->id, root->height);
    return 0;
}
```
