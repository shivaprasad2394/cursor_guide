---
id: "q127-insert-node-at-position"
title: "Insert a Node at a Specific Position (HackerRank adaptation)"
pattern: "linked list (link traversal by address)"
difficulty: "easy"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
vizCategory: "linked list"
vizOperation: "insert-position"
listType: "sll"
listNodes: "10,20,30"
listInsertPosition: "1"
listInsertValue: "15"
stdin: ""
complexity: "O(P) time, O(1) auxiliary space"
expectedOutput: "Before: 10 -> 20 -> 30 -> NULL\nAfter insert 15 at position 1: 10 -> 15 -> 20 -> 30 -> NULL\n"
---
## At a glance

- **Goal:** Insert a caller-owned node at a zero-based position in a singly linked list.
- **Input:** Address of the head pointer, a ready-made node, and target position.
- **Output:** `0` on success, `-1` if the position is out of range.
- **Ownership:** The insertion function must not allocate or free — it only rewires links.
- **Pattern:** Walk `struct Node **` link handles until the position slot is reached.
- **Complexity:** O(P) time and O(1) auxiliary space, where `P` is the insert position.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (HackerRank “Insert a node at a specific position in a linked list”)** | Insert data at position; platform may allocate nodes inside the helper. |
| **C-specific adaptation** | Caller supplies an automatic-storage node; the function takes `struct Node **` and performs **no** `malloc`/`free` inside the insertion function. |

## Problem statement

Given the address of a singly linked list head pointer, a caller-owned node, and a zero-based position, insert the node at that position. Position `0` means before the current head. Return `0` on success or `-1` if the position is greater than the list length.

```text
int insertNodeAtPosition(struct Node **head, struct Node *node, int position);
```

## Pointer API and ownership

The caller writes `insertNodeAtPosition(&head, &n15, 1)`. Inside the function, `link` starts at `head` (address of the caller's head variable). Each `link = &(*link)->next` moves to the address of the next pointer slot — the classic "pointer to the pointer that points where I want to insert."

The node being inserted is a local object in `main` (automatic storage). The function borrows it by address and links it in; it never owns or frees it.

## Algorithm

```text
step1: If position is less than 0, return -1.
step2: Set link = head.
step3: Repeat position times:
step4:     If *link is NULL, return -1 (position out of range).
step5:     Advance link to &(*link)->next.
step6: Set node->next = *link.
step7: Set *link = node.
step8: Return 0.
```

## Worked trace

```text
List: 10 -> 20 -> 30 -> NULL, insert node 15 at position 1

link starts at &head → *link points to node 10
position 1: advance link to &10.next → *link points to node 20
node 15.next = 20; *link = &15 → 10 -> 15 -> 20 -> 30 -> NULL
```

## Edge cases

- **Insert at position 0 on empty list:** `*head = node`, `node->next = NULL`.
- **Insert at position 0 on non-empty list:** New node becomes head; old head becomes `node->next`.
- **Insert at tail (position == length):** Walk until `link == &last->next`; splice in.
- **Position > length:** Return `-1` without changing links.
- **Position < 0:** Return `-1`.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

void printList(const struct Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

int insertNodeAtPosition(struct Node **head, struct Node *node, int position) {
    /* TODO: splice caller-owned node at position using struct Node ** link walk. */
    (void)head;
    (void)node;
    (void)position;
    return -1;
}

int main(void) {
    struct Node n10 = {10, NULL};
    struct Node n20 = {20, NULL};
    struct Node n30 = {30, NULL};
    struct Node n15 = {15, NULL};
    struct Node *head = NULL;

    n10.next = &n20;
    n20.next = &n30;
    head = &n10;

    printf("Before: ");
    printList(head);

    if (insertNodeAtPosition(&head, &n15, 1) != 0) {
        fprintf(stderr, "insert failed\n");
        return EXIT_FAILURE;
    }

    printf("After insert 15 at position 1: ");
    printList(head);

    return EXIT_SUCCESS;
}
```

## Solution

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

void printList(const struct Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

int insertNodeAtPosition(struct Node **head, struct Node *node, int position) {
    if (position < 0 || head == NULL || node == NULL) {
        return -1;
    }

    struct Node **link = head;
    for (int i = 0; i < position; ++i) {
        if (*link == NULL) {
            return -1;
        }
        link = &(*link)->next;
    }

    node->next = *link;
    *link = node;
    return 0;
}

int main(void) {
    struct Node n10 = {10, NULL};
    struct Node n20 = {20, NULL};
    struct Node n30 = {30, NULL};
    struct Node n15 = {15, NULL};
    struct Node *head = NULL;

    n10.next = &n20;
    n20.next = &n30;
    head = &n10;

    printf("Before: ");
    printList(head);

    if (insertNodeAtPosition(&head, &n15, 1) != 0) {
        fprintf(stderr, "insert failed\n");
        return EXIT_FAILURE;
    }

    printf("After insert 15 at position 1: ");
    printList(head);

    return EXIT_SUCCESS;
}
```
