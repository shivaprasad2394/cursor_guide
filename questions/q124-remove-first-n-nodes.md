---
id: "q124-remove-first-n-nodes"
title: "Remove the First N Nodes from a Singly Linked List"
pattern: "linked list (head advancement)"
difficulty: "easy"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
vizCategory: "linked list"
vizOperation: "remove-first"
listType: "sll"
listNodes: "10,20,30,40,50"
listRemoveCount: "3"
stdin: ""
complexity: "O(min(N, L)) time, O(1) auxiliary space"
expectedOutput: "Before: 10 -> 20 -> 30 -> 40 -> 50 -> NULL\nAfter removing first 3: 40 -> 50 -> NULL\n"
---
## At a glance

- **Goal:** Remove and free the first `N` nodes of a singly linked list.
- **Input:** The current head pointer and a non-negative removal count `N`.
- **Output:** The new head pointer after up to `N` nodes have been removed.
- **Pattern:** Advance the head while freeing the old head.
- **Complexity:** O(min(N, L)) time and O(1) auxiliary space, where `L` is the list length.
- **Expected output:** `After removing first 3: 40 -> 50 -> NULL`

## Problem statement

Given the head of a singly linked list and a non-negative integer `N`, remove the first `N` nodes. Every removed node must be freed. If `N` is greater than or equal to the list length, remove the whole list and return `NULL`.

The function returns the new head:

```text
Node *removeFirstN(Node *head, size_t n);
```

## Pointer API and ownership

Returning `Node *` makes head ownership explicit: the caller passes the current ownership root by value and must assign the returned pointer back with `head = removeFirstN(head, n)`. The function owns and frees each removed node; the caller owns the returned remainder. Its local `head` can advance safely, but that local assignment alone cannot change the caller's variable.

A `Node **` API would instead be called as `removeFirstN(&head, n)` and update the caller directly. This question uses the return-new-head pattern because it is compact and makes the ownership transfer visible in the assignment.

`append` dynamically allocates every node with `malloc`. Removed nodes are owned by `removeFirstN` and freed there exactly once; the caller then frees the returned remainder with `freeList`. No pointer into a freed prefix is used afterward.

## Algorithm

```text
step1: While head is not NULL and N is greater than 0:
step2:     Save the current head in removed.
step3:     Advance head to head->next before freeing anything.
step4:     Free removed and decrement N.
step5: Return head, which now points to the first node kept (or NULL).
```

Saving and advancing first is essential because reading `removed->next` after `free(removed)` would be undefined behavior.

## Worked trace

```text
List: 10 -> 20 -> 30 -> 40 -> 50 -> NULL, N = 3

Iteration 1: removed = 10, head advances to 20, free 10, N becomes 2
Iteration 2: removed = 20, head advances to 30, free 20, N becomes 1
Iteration 3: removed = 30, head advances to 40, free 30, N becomes 0

Result: 40 -> 50 -> NULL
The caller later frees the remaining nodes 40 and 50.
```

## Edge cases

- **`N = 0`:** The loop does not run; return the original head without freeing any node.
- **Empty list:** `head` is already `NULL`; return `NULL`.
- **`N < length`:** Free exactly `N` nodes and return the first remaining node.
- **`N == length`:** Free every node and return `NULL`.
- **`N > length`:** Stop when `head` becomes `NULL`; every original node is freed exactly once.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

void freeList(Node *head) {
    while (head != NULL) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}

int append(Node **head, int value) {
    Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return 0;
    }
    node->value = value;
    node->next = NULL;

    Node **link = head;
    while (*link != NULL) {
        link = &(*link)->next;
    }
    *link = node;
    return 1;
}

void printList(const Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

Node *removeFirstN(Node *head, size_t n) {
    /* TODO: advance head and free exactly the nodes you remove. */
    (void)n;
    return head;
}

int main(void) {
    const int values[] = {10, 20, 30, 40, 50};
    Node *head = NULL;

    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i) {
        if (!append(&head, values[i])) {
            fprintf(stderr, "allocation failed\n");
            freeList(head);
            return EXIT_FAILURE;
        }
    }

    printf("Before: ");
    printList(head);
    head = removeFirstN(head, 3);
    printf("After removing first 3: ");
    printList(head);

    freeList(head);
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
    struct Node *next;
} Node;

void freeList(Node *head) {
    while (head != NULL) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}

int append(Node **head, int value) {
    Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return 0;
    }
    node->value = value;
    node->next = NULL;

    Node **link = head;
    while (*link != NULL) {
        link = &(*link)->next;
    }
    *link = node;
    return 1;
}

void printList(const Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

Node *removeFirstN(Node *head, size_t n) {
    while (head != NULL && n > 0) {
        Node *removed = head;
        head = head->next;
        free(removed);
        --n;
    }
    return head;
}

int main(void) {
    const int values[] = {10, 20, 30, 40, 50};
    Node *head = NULL;

    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i) {
        if (!append(&head, values[i])) {
            fprintf(stderr, "allocation failed\n");
            freeList(head);
            return EXIT_FAILURE;
        }
    }

    printf("Before: ");
    printList(head);
    head = removeFirstN(head, 3);
    printf("After removing first 3: ");
    printList(head);

    freeList(head);
    return EXIT_SUCCESS;
}
```
