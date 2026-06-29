---
id: "q74-sll-insert-in-ascending-and-descending-sorted-order"
title: "SLL — Insert in Ascending and Descending (Sorted) Order"
pattern: "buffers"
difficulty: "hard"
visualization: "none"
stdin: ""
complexity: "O(n) per insert (you may walk the whole list to find the spot), O(1) extra space."
expectedOutput: |
  Ascending : 10 -> 20 -> 30 -> 40 -> 50 -> NULL
  Descending: 50 -> 40 -> 30 -> 20 -> 10 -> NULL
---

## Description

Insert values into a singly linked list so it stays *sorted* — one version keeps it ascending (smallest first), the other descending (largest first).

## Algorithm

```text
- This is the same SLL you know, but instead of always inserting at head/tail, you find the *correct position* and splice the node in.
- step1: make the new node.
- step2: handle the head case — if the list is empty, or the new value belongs before the current head, the new node becomes the head.
- step3: otherwise walk with `cur` until the *next* node should come after the new value, i.e. stop right before the first node that is `>= v` (ascending) or `<= v` (descending).
- step4: splice: `n->next = cur->next; cur->next = n;`
- The ONLY difference between ascending and descending is the comparison operator. Flip `<`/`<=` to `>`/`>=`.
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    int vals[] = {30, 10, 50, 20, 40};
    int n = (int)(sizeof(vals) / sizeof(vals[0]));

    Node *asc = NULL, *desc = NULL;
    for (int i = 0; i < n; i++) {
        asc  = insertAscending(asc,  vals[i]);
        desc = insertDescending(desc, vals[i]);
    }
    printList("Ascending : ", asc);
    printList("Descending: ", desc);

    freeList(asc);
    freeList(desc);
    return 0;
}
```

## Solution

```c
/* SLL: insert in ASCENDING and DESCENDING (sorted) order */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

static Node *makeNode(int v) {
    Node *n = malloc(sizeof *n);
    if (n) { n->data = v; n->next = NULL; }
    return n;
}

/* Insert keeping list ASCENDING (smallest first).
 * Walk until we find the first node whose data is >= v; insert before it. */
static Node *insertAscending(Node *head, int v) {
    Node *n = makeNode(v);
    if (!n) return head;
    if (!head || v <= head->data) {        /* empty or new head */
        n->next = head;
        return n;
    }
    Node *cur = head;
    while (cur->next && cur->next->data < v) /* stop before first >= v */
        cur = cur->next;
    n->next = cur->next;
    cur->next = n;
    return head;
}

/* Insert keeping list DESCENDING (largest first).
 * Same logic, comparison flipped. */
static Node *insertDescending(Node *head, int v) {
    Node *n = makeNode(v);
    if (!n) return head;
    if (!head || v >= head->data) {
        n->next = head;
        return n;
    }
    Node *cur = head;
    while (cur->next && cur->next->data > v)
        cur = cur->next;
    n->next = cur->next;
    cur->next = n;
    return head;
}

static void printList(const char *label, Node *head) {
    printf("%s", label);
    for (Node *c = head; c; c = c->next) printf("%d -> ", c->data);
    printf("NULL\n");
}

static void freeList(Node *head) {
    while (head) { Node *t = head->next; free(head); head = t; }
}

int main(void) {
    int vals[] = {30, 10, 50, 20, 40};
    int n = (int)(sizeof(vals) / sizeof(vals[0]));

    Node *asc = NULL, *desc = NULL;
    for (int i = 0; i < n; i++) {
        asc  = insertAscending(asc,  vals[i]);
        desc = insertDescending(desc, vals[i]);
    }
    printList("Ascending : ", asc);
    printList("Descending: ", desc);

    freeList(asc);
    freeList(desc);
    return 0;
}
```
