---
id: "q126-remove-linked-list-elements"
title: "Remove Linked List Elements (LeetCode 203 adaptation)"
pattern: "linked list (filter / remove by value)"
difficulty: "easy"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
vizCategory: "linked list"
vizOperation: "remove-all"
listType: "sll"
listNodes: "1,2,6,3,4,5,6"
listRemoveValue: "6"
stdin: ""
complexity: "O(L) time, O(1) auxiliary space"
expectedOutput: "Before: 1 -> 2 -> 6 -> 3 -> 4 -> 5 -> 6 -> NULL\nAfter removing 6: 1 -> 2 -> 3 -> 4 -> 5 -> NULL\n"
---
## At a glance

- **Goal:** Remove every node whose value equals `val` and free those nodes.
- **Input:** Head pointer and target value `val`.
- **Output:** Head of the filtered list (may be `NULL`).
- **Ownership:** Dynamic nodes — removed nodes are freed inside the function; caller owns the returned head.
- **Pattern:** Two-pointer scan with careful head updates when the first node(s) match.
- **Complexity:** O(L) time and O(1) auxiliary space, where `L` is the list length.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (LeetCode 203)** | Remove all nodes with value `val`; return the new head. Platform examples typically use a `ListNode` typedef. |
| **C-specific adaptation** | No `typedef` — write `struct Node` and `struct Node *` explicitly. Dynamic `malloc` nodes with a `Node *` return API (not `Node **`). |

## Problem statement

Given the head of a singly linked list and an integer `val`, remove every node whose `value` field equals `val`. Free each removed node. Return the head of the remaining list, which may be `NULL`.

```text
struct Node *removeElements(struct Node *head, int val);
```

## Pointer API and ownership

The caller passes the current ownership root by value: `head = removeElements(head, val)`. The function frees every removed node and returns the new head. A local `head` parameter can be advanced without updating the caller until the return value is assigned.

Using `struct Node **` (`removeElements(&head, val)`) would update the caller in place; this question uses the return-new-head style to contrast with the following automatic-storage insertion question.

Every node is allocated with `malloc` in `append`. Removed nodes are freed exactly once inside `removeElements`. The caller frees the returned remainder with `freeList`.

## Algorithm

```text
step1: While head is not NULL and head->value equals val:
step2:     Save head, advance head to head->next, free the saved node.
step3: Set cur to head (first node known not to match, or NULL).
step4: While cur is not NULL and cur->next is not NULL:
step5:     If cur->next->value equals val, save cur->next, link cur->next = saved->next, free saved.
step6:     Else advance cur to cur->next.
step7: Return head.
```

The head loop handles a prefix of matching nodes. The inner loop keeps `cur` on the last kept node so unlinking `cur->next` stays O(1).

## Worked trace

```text
List: 1 -> 2 -> 6 -> 3 -> 4 -> 5 -> 6 -> NULL, val = 6

Head loop: no prefix of 6 at front — head stays at 1.
cur=1: cur->next=2 ≠ 6 → cur=2
cur=2: cur->next=6 = 6 → unlink 6, free it → 1 -> 2 -> 3 -> 4 -> 5 -> 6
cur=2: cur->next=3 ≠ 6 → cur=3
cur=3: cur->next=4 ≠ 6 → cur=4
cur=4: cur->next=5 ≠ 6 → cur=5
cur=5: cur->next=6 = 6 → unlink 6, free it → 1 -> 2 -> 3 -> 4 -> 5 -> NULL

Result: 1 -> 2 -> 3 -> 4 -> 5 -> NULL
```

## Edge cases

- **Empty list:** Return `NULL` immediately.
- **All nodes match:** Head loop frees every node; return `NULL`.
- **No nodes match:** Return the original head unchanged.
- **Matches only at head:** Head loop removes the prefix; inner loop handles the rest.
- **Adjacent matches:** Each match is freed in one inner-loop iteration; `cur` stays put until the next node is checked.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int append(struct Node **head, int value) {
    struct Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return 0;
    }
    node->value = value;
    node->next = NULL;

    struct Node **link = head;
    while (*link != NULL) {
        link = &(*link)->next;
    }
    *link = node;
    return 1;
}

void printList(const struct Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

struct Node *removeElements(struct Node *head, int val) {
    /* TODO: remove and free every node whose value equals val. */
    (void)val;
    return head;
}

int main(void) {
    const int values[] = {1, 2, 6, 3, 4, 5, 6};
    struct Node *head = NULL;

    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i) {
        if (!append(&head, values[i])) {
            fprintf(stderr, "allocation failed\n");
            freeList(head);
            return EXIT_FAILURE;
        }
    }

    printf("Before: ");
    printList(head);
    head = removeElements(head, 6);
    printf("After removing 6: ");
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

struct Node {
    int value;
    struct Node *next;
};

void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int append(struct Node **head, int value) {
    struct Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return 0;
    }
    node->value = value;
    node->next = NULL;

    struct Node **link = head;
    while (*link != NULL) {
        link = &(*link)->next;
    }
    *link = node;
    return 1;
}

void printList(const struct Node *head) {
    while (head != NULL) {
        printf("%d -> ", head->value);
        head = head->next;
    }
    printf("NULL\n");
}

struct Node *removeElements(struct Node *head, int val) {
    while (head != NULL && head->value == val) {
        struct Node *removed = head;
        head = head->next;
        free(removed);
    }

    for (struct Node *cur = head; cur != NULL && cur->next != NULL; ) {
        if (cur->next->value == val) {
            struct Node *removed = cur->next;
            cur->next = removed->next;
            free(removed);
        } else {
            cur = cur->next;
        }
    }

    return head;
}

int main(void) {
    const int values[] = {1, 2, 6, 3, 4, 5, 6};
    struct Node *head = NULL;

    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i) {
        if (!append(&head, values[i])) {
            fprintf(stderr, "allocation failed\n");
            freeList(head);
            return EXIT_FAILURE;
        }
    }

    printf("Before: ");
    printList(head);
    head = removeElements(head, 6);
    printf("After removing 6: ");
    printList(head);

    freeList(head);
    return EXIT_SUCCESS;
}
```
