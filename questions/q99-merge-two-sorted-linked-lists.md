---
id: "q99-merge-two-sorted-linked-lists"
title: "Merge Two Sorted Linked Lists"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
vizCategory: "linked list"
listNodes: "1,2,4"
listNodesB: "1,3,4"
stdin: ""
complexity: "O(n + m) time, O(1) space"
expectedOutput: "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL\n"
---
## At a glance

- **Goal:** Merge Two Sorted Linked Lists
- **Pattern:** Linked list
- **Complexity:** O(n + m) time, O(1) space
- **Expected output:** `1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL`

## Description

Merge two sorted singly linked lists into one sorted list.

## Pointer API and ownership

`Node *mergeLists(Node *a, Node *b)` receives two local traversal pointers and returns the head of the rewired result. The caller transfers both input chains to the function and writes `Node *h = mergeLists(a, b)`; after that it treats `h` as the owner and does not use `a` or `b` as independent lists.

No caller head variable needs to be modified in place, so two `Node **` parameters would add indirection without improving the contract. The returned `Node *` naturally represents the one merged ownership root. This implementation reuses every node and allocates or frees none.

The test setup allocates both input chains with `malloc`. After merging, all six allocations are reachable exactly once from `h`; the final loop frees that combined owned chain exactly once. The old `a` and `b` variables must not be treated as separate owners after the transfer.

**Walkthrough hint:**

list1: 1→2→4, list2: 1→3→4 → 1→1→2→3→4→4

## Algorithm

```text
step1: Dummy head node, tail pointer
step2: While both lists non-NULL: attach smaller node
step3: Attach remaining list
step4: Return dummy.next
```

## Example Trace

```text
Compare heads: 1 vs 1 → take first 1
Then 2 vs 1 → take 1 from list2
Continue until both exhausted
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct Node { int id; struct Node *next; } Node;
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Node *a = NULL, *b = NULL;
    int v1[] = {
        4, 2, 1
    };
    int v2[] = {
        4, 3, 1
    };
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            while (a) { Node *t = a->next; free(a); a = t; }
            return 1;
        }
        n->id = v1[i];
        n->next = a;
        a = n;
    }
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            while (a) { Node *t = a->next; free(a); a = t; }
            while (b) { Node *t = b->next; free(b); b = t; }
            return 1;
        }
        n->id = v2[i];
        n->next = b;
        b = n;
    }
    Node *h = mergeLists(a, b);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\n");
    while (h) {
        Node *t = h->next;
        free(h);
        h = t;
    }
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
typedef struct Node { int id; struct Node *next; } Node;
Node *mergeLists(Node *a, Node *b) {
    Node dummy = {0, NULL}, *tail = &dummy;
    while (a && b) {
        if (a->id <= b->id) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

int main(void) {
    Node *a = NULL, *b = NULL;
    int v1[] = {
        4, 2, 1
    };
    int v2[] = {
        4, 3, 1
    };
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            while (a) { Node *t = a->next; free(a); a = t; }
            return 1;
        }
        n->id = v1[i];
        n->next = a;
        a = n;
    }
    for (int i = 0; i < 3; i++) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            while (a) { Node *t = a->next; free(a); a = t; }
            while (b) { Node *t = b->next; free(b); b = t; }
            return 1;
        }
        n->id = v2[i];
        n->next = b;
        b = n;
    }
    Node *h = mergeLists(a, b);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\n");
    while (h) {
        Node *t = h->next;
        free(h);
        h = t;
    }
    return 0;
}
```
