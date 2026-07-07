---
id: "q64-bstsearch"
title: "bstSearch"
pattern: "binary search tree"
difficulty: "hard"
visualization: "generic"
vizCategory: "binary search tree"
complexity: "O(h) time — O(log n) balanced, O(n) skewed"
tape: "search 40: %s\\n"
stdin: ""
expectedOutput: "search 40: found\nsearch 99: not found\n"
---
## At a glance

- **Goal:** bstSearch
- **Pattern:** Binary search tree
- **Complexity:** O(h) time, O(h) recursion stack — O(log n) balanced, O(n) skewed
- **Expected output:** `search 40: found`

## Description

**Search** for a key in a BST — the mirror image of insert. At each node, compare the key to `root->id`:

- **Equal** → found; return this node.
- **Smaller** → search the left subtree only.
- **Larger** → search the right subtree only.
- **`NULL`** → key is not in the tree.

Because the tree is ordered, you never need to scan both subtrees. That is why BST search is fast when the tree is balanced.

`main()` builds a tree from `{50, 30, 70, 20, 40}`, then searches for **40** (present) and **99** (absent).

## Algorithm

```text
step1: If root == NULL        → not found; return NULL
step2: If key == root->id     → found; return root
step3: If key <  root->id     → return bstSearch(root->left,  key)
step4: Else                   → return bstSearch(root->right, key)
```

**Return value:** non-`NULL` pointer means found; `NULL` means missing. `main()` uses `bstSearch(r, 40) ? "found" : "not found"`.

## Example Trace

```text
Tree after inserting 50, 30, 70, 20, 40:

        [50]
       /    \
    [30]    [70]
    /  \
 [20] [40]

Search 40: 40 < 50 → left to [30] → 40 > 30 → right to [40] → match → found
Search 99: 99 > 50 → right to [70] → 99 > 70 → right to NULL → not found
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
    printf("search 40: %s\n", bstSearch(r,40)?"found":"not found");
    printf("search 99: %s\n", bstSearch(r,99)?"found":"not found");
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

BstNode *bstSearch(BstNode *root, int key) {
    if (root == NULL || root->id == key) return root;
    if (key < root->id) return bstSearch(root->left,  key);
    else                return bstSearch(root->right, key);
}

int main(void) {
    BstNode*r=NULL;
    int k[]={
        50,30,70,20,40
    };
    for (int i=0;i<5;i++) r=bstInsert(r,k[i]);
    printf("search 40: %s\n", bstSearch(r,40)?"found":"not found");
    printf("search 99: %s\n", bstSearch(r,99)?"found":"not found");
    return 0;
}
```
