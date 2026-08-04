---
id: "q125-remove-first-n-nodes-doubly-linked-list"
title: "Remove the First N Nodes from a Doubly Linked List"
pattern: "doubly linked list (head advancement)"
difficulty: "easy"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
vizCategory: "linked list"
vizOperation: "remove-first"
listType: "dll"
listNodes: "10,20,30,40,50"
listRemoveCount: "3"
stdin: ""
complexity: "O(min(N, L)) time, O(1) auxiliary space"
expectedOutput: "Before forward: 10 <-> 20 <-> 30 <-> 40 <-> 50 <-> NULL\nBefore backward: 50 <-> 40 <-> 30 <-> 20 <-> 10 <-> NULL\nAfter removing first 3 forward: 40 <-> 50 <-> NULL\nAfter removing first 3 backward: 50 <-> 40 <-> NULL\nNew head prev is NULL: yes\nLinks valid: yes\n"
---
## At a glance

- **Goal:** Detach the first `N` available caller-owned nodes from a doubly linked list.
- **Input:** The current head pointer and a non-negative removal count `N`.
- **Output:** The new head pointer, or `NULL` if no nodes remain.
- **Ownership:** The function borrows automatic-storage nodes; it changes links but never frees them.
- **Pattern:** Advance `head`, repair the new head's `prev` link, then clear the detached node's links.
- **Complexity:** O(min(N, L)) time and O(1) auxiliary space, where `L` is the list length.

## Problem statement

Given the head of a doubly linked list and a non-negative integer `N`, detach the first `N` nodes. The nodes are local objects owned by the caller, so the function must not free them. If `N` is at least the list length, make the list empty.

```text
void removeFirstN(Node **head, size_t n);
```

## Pointer API and ownership

The caller writes `removeFirstN(&head, n)`, passing the address of its head variable. Inside the function, `*head` is the current first node and assignments to `*head` immediately update the caller. The function only borrows the nodes; the named local objects in `main` own their own storage.

A single-pointer version could return a new head and require `head = removeFirstN(head, n)`. This question uses `Node **` to contrast that return-new-head style with the preceding SLL question. When a node remains, its `prev` field must be `NULL`. The example walks both directions and validates every adjacent `prev`/`next` pair, so a broken backward link is visible.

`n10` through `n50` have automatic storage duration and remain alive until `main` returns. `appendNode` links their addresses without allocating. Removed nodes have both links cleared, are never passed to `free`, and cannot safely escape `main`.

## Algorithm

```text
step1: While head is not NULL and N is greater than 0:
step2:     Save the current *head in removed.
step3:     Advance *head to removed->next.
step4:     If *head is not NULL, set (*head)->prev to NULL.
step5:     Clear removed->prev and removed->next, then decrement N.
step6: Return; the caller's head already names the first kept node or NULL.
```

Save the next pointer by advancing `*head` before clearing the detached node's links. The local node remains alive, but clearing both links prevents it from accidentally retaining membership in the list.

## Worked trace

```text
List: NULL <- 10 <-> 20 <-> 30 <-> 40 <-> 50 -> NULL, N = 3

Iteration 1: removed=10, head=20, set 20.prev=NULL, clear 10's links
Iteration 2: removed=20, head=30, set 30.prev=NULL, clear 20's links
Iteration 3: removed=30, head=40, set 40.prev=NULL, clear 30's links

Forward from head: 40 <-> 50 <-> NULL
Backward from tail: 50 <-> 40 <-> NULL
All five local node objects remain alive until `main` returns; none is freed.
```

## Edge cases

- **`N = 0`:** Keep the original head and links.
- **Empty list:** Keep `head == NULL`; there is nothing to detach.
- **`N < length`:** Detach exactly `N` nodes and make the first remaining node the head with `prev == NULL`.
- **`N == length`:** Detach every node and set the caller's head to `NULL`.
- **`N > length`:** Stop when the list is exhausted; every original node remains a valid local object.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

void appendNode(Node **head, Node **tail, Node *node) {
    node->prev = *tail;
    node->next = NULL;
    if (*tail != NULL) {
        (*tail)->next = node;
    } else {
        *head = node;
    }
    *tail = node;
}

void printForward(const Node *head) {
    for (const Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d <-> ", cur->value);
    }
    printf("NULL\n");
}

void printBackward(const Node *tail) {
    for (const Node *cur = tail; cur != NULL; cur = cur->prev) {
        printf("%d <-> ", cur->value);
    }
    printf("NULL\n");
}

Node *findTail(Node *head) {
    Node *tail = head;
    while (tail != NULL && tail->next != NULL) {
        tail = tail->next;
    }
    return tail;
}

int linksAreValid(const Node *head) {
    const Node *previous = NULL;
    for (const Node *cur = head; cur != NULL; cur = cur->next) {
        if (cur->prev != previous) {
            return 0;
        }
        previous = cur;
    }
    return 1;
}

void removeFirstN(Node **head, size_t n) {
    /* TODO: advance *head, repair links, and detach caller-owned nodes. */
    (void)n;
}

int main(void) {
    Node n10 = {10, NULL, NULL};
    Node n20 = {20, NULL, NULL};
    Node n30 = {30, NULL, NULL};
    Node n40 = {40, NULL, NULL};
    Node n50 = {50, NULL, NULL};
    Node *nodes[] = {&n10, &n20, &n30, &n40, &n50};
    Node *head = NULL;
    Node *tail = NULL;

    for (size_t i = 0; i < sizeof nodes / sizeof nodes[0]; ++i) {
        appendNode(&head, &tail, nodes[i]);
    }

    printf("Before forward: ");
    printForward(head);
    printf("Before backward: ");
    printBackward(tail);

    removeFirstN(&head, 3);
    tail = findTail(head);
    printf("After removing first 3 forward: ");
    printForward(head);
    printf("After removing first 3 backward: ");
    printBackward(tail);
    printf("New head prev is NULL: %s\n",
           head == NULL || head->prev == NULL ? "yes" : "no");
    printf("Links valid: %s\n", linksAreValid(head) ? "yes" : "no");

    return EXIT_SUCCESS;
}
```

## Solution

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

void appendNode(Node **head, Node **tail, Node *node) {
    node->prev = *tail;
    node->next = NULL;
    if (*tail != NULL) {
        (*tail)->next = node;
    } else {
        *head = node;
    }
    *tail = node;
}

void printForward(const Node *head) {
    for (const Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d <-> ", cur->value);
    }
    printf("NULL\n");
}

void printBackward(const Node *tail) {
    for (const Node *cur = tail; cur != NULL; cur = cur->prev) {
        printf("%d <-> ", cur->value);
    }
    printf("NULL\n");
}

Node *findTail(Node *head) {
    Node *tail = head;
    while (tail != NULL && tail->next != NULL) {
        tail = tail->next;
    }
    return tail;
}

int linksAreValid(const Node *head) {
    const Node *previous = NULL;
    for (const Node *cur = head; cur != NULL; cur = cur->next) {
        if (cur->prev != previous) {
            return 0;
        }
        previous = cur;
    }
    return 1;
}

void removeFirstN(Node **head, size_t n) {
    if (head == NULL) {
        return;
    }
    while (*head != NULL && n > 0) {
        Node *removed = *head;
        *head = removed->next;
        if (*head != NULL) {
            (*head)->prev = NULL;
        }
        removed->prev = NULL;
        removed->next = NULL;
        --n;
    }
}

int main(void) {
    Node n10 = {10, NULL, NULL};
    Node n20 = {20, NULL, NULL};
    Node n30 = {30, NULL, NULL};
    Node n40 = {40, NULL, NULL};
    Node n50 = {50, NULL, NULL};
    Node *nodes[] = {&n10, &n20, &n30, &n40, &n50};
    Node *head = NULL;
    Node *tail = NULL;

    for (size_t i = 0; i < sizeof nodes / sizeof nodes[0]; ++i) {
        appendNode(&head, &tail, nodes[i]);
    }

    printf("Before forward: ");
    printForward(head);
    printf("Before backward: ");
    printBackward(tail);

    removeFirstN(&head, 3);
    tail = findTail(head);
    printf("After removing first 3 forward: ");
    printForward(head);
    printf("After removing first 3 backward: ");
    printBackward(tail);
    printf("New head prev is NULL: %s\n",
           head == NULL || head->prev == NULL ? "yes" : "no");
    printf("Links valid: %s\n", linksAreValid(head) ? "yes" : "no");

    return EXIT_SUCCESS;
}
```
