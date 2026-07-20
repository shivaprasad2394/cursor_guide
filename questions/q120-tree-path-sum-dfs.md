---
id: "q120-tree-path-sum-dfs"
title: "Path Sum on Binary Tree (DFS)"
pattern: "depth-first search"
difficulty: "medium"
visualization: "tree-path"
vizCategory: "dsa"
stdin: ""
expectedOutput: "hasPathSum(22)=1\n"
vizTarget: 22
---
## At a glance

- **Goal:** Path Sum on Binary Tree (DFS)
- **Pattern:** Depth-First Search
- **Expected output:** `hasPathSum(22)=1`

## Before you start

Read [DFS primer](dsa-guide.html#dfs). A tree is just nodes with `left` and `right` pointers — DFS means recurse into children.

Full guide: [DSA Primer](dsa-guide.html#dfs)

## How to think

Pass down **remaining sum**. At each node subtract `val`. At a **leaf**, check if remaining is 0. Recurse left OR right — either path working means yes.

## Diagram

```text
        5
       / \
      4   8
     /   / \
   11  13  4
  / \       \
 7   2       1
Path 5→4→11→2 = 22
```

## C walkthrough

```text
step1: `if (!root) return 0` — empty tree fails
step2: Leaf check: no children → `return val == target`
step3: Recurse: `hasPathSum(left, target-val) || hasPathSum(right, target-val)`
```

## Description

Return whether a root-to-leaf path sums to target. Classic recursive DFS on a binary tree.

## Algorithm

```text
step1: if node NULL → false
step2: if leaf and val == remaining → true
step3: recurse left/right with remaining - val
```

## Example Trace

```text
path 5→4→11→2 = 22 exists
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct Node { int val; struct Node *left, *right; } Node;
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Node *root = n(5,
        n(4, n(11, n(7, NULL, NULL), n(2, NULL, NULL)), NULL),
        n(8, n(13, NULL, NULL), n(4, NULL, n(1, NULL, NULL))));
    printf("hasPathSum(22)=%d\n", hasPathSum(root, 22));
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
typedef struct Node { int val; struct Node *left, *right; } Node;
Node *n(int v, Node *l, Node *r) {
    Node *x = (Node *)malloc(sizeof *x);
    x->val = v; x->left = l; x->right = r;
    return x;
}

int hasPathSum(Node *root, int target) {
    if (!root) return 0;
    if (!root->left && !root->right) return root->val == target;
    return hasPathSum(root->left, target - root->val)
        || hasPathSum(root->right, target - root->val);
}

int main(void) {
    Node *root = n(5,
        n(4, n(11, n(7, NULL, NULL), n(2, NULL, NULL)), NULL),
        n(8, n(13, NULL, NULL), n(4, NULL, n(1, NULL, NULL))));
    printf("hasPathSum(22)=%d\n", hasPathSum(root, 22));
    return 0;
}
```
