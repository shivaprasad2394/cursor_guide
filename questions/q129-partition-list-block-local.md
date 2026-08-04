---
id: "q129-partition-list-block-local"
title: "Partition List with Block-Local Type (LeetCode 86 adaptation)"
pattern: "linked list (two-chain partition / tail handles)"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
vizCategory: "linked list"
vizOperation: "partition"
listType: "sll"
listNodes: "1,4,3,2,5,2"
listPartitionValue: "3"
stdin: ""
complexity: "O(L) time, O(1) auxiliary space"
expectedOutput: "Before: 1 -> 4 -> 3 -> 2 -> 5 -> 2 -> NULL\nAfter partition on 3: 1 -> 2 -> 2 -> 4 -> 3 -> 5 -> NULL\n"
---
## At a glance

- **Goal:** Partition a list so all values `< x` come before values `>= x`, preserving relative order within each part.
- **Input:** Head pointer, partition value `x`, and caller-owned automatic nodes.
- **Output:** New head after stable partition (relative order preserved).
- **Ownership:** Nodes are local objects — only links change; nothing is freed.
- **Pattern:** Two chains built via `struct LocalNode **` tail handles; type is block-local.
- **Complexity:** O(L) time and O(1) auxiliary space.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (LeetCode 86)** | Partition around value `x`; stable relative order; typical solutions use a file-scope `ListNode`. |
| **C-specific adaptation** | Define `struct LocalNode` **inside** `main` (block-local). Partition logic must live in that same block because helpers outside cannot name `LocalNode`. Use `struct LocalNode **` tail-link handles. |

## Problem statement

Given the head of a singly linked list and a value `x`, rearrange nodes so all nodes with value strictly less than `x` appear before nodes with value greater than or equal to `x`. Preserve the original relative order within each partition. Nodes are caller-owned automatic-storage objects.

Because `struct LocalNode` is block-local, implement the partition inline inside `main` (or in a macro expanded there) — do not call a separate helper that takes `struct LocalNode *`.

## Pointer API and ownership

The partition uses two dummy heads on the stack and two `struct LocalNode **` tail pointers (`before_tail`, `after_tail`). Each tail handle always points to the `next` field of the last node in that chain, so appending is O(1).

Automatic nodes remain alive for the duration of `main`. Clearing `next` on the last node of each built chain before splicing prevents accidental cycles.

## Algorithm

```text
step1: before_head = NULL, before_tail = &before_head.
step2: after_head = NULL, after_tail = &after_head.
step3: For each node cur in the original list:
step4:     If cur->value < x, append to before chain via *before_tail = cur; before_tail = &cur->next.
step5:     Else append to after chain via *after_tail = cur; after_tail = &cur->next.
step6: Set *before_tail = after_head; *after_tail = NULL.
step7: Return before_head (or after_head if before is empty).
```

## Worked trace

```text
List: 1 -> 4 -> 3 -> 2 -> 5 -> 2, x = 3

1 < 3  → before: 1
4 >= 3 → after:  4
3 >= 3 → after:  4 -> 3
2 < 3  → before: 1 -> 2
5 >= 3 → after:  4 -> 3 -> 5
2 < 3  → before: 1 -> 2 -> 2

Splice: before_tail->next = after_head → 1 -> 2 -> 2 -> 4 -> 3 -> 5 -> NULL
```

## Edge cases

- **All `< x`:** After chain empty; list unchanged in order.
- **All `>= x`:** Before chain empty; head becomes first after node.
- **Empty list:** Both chains empty; head stays `NULL`.
- **`x` equals every value:** Before empty; entire list in after chain.
- **Single node:** Lands in exactly one chain.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    struct LocalNode {
        int value;
        struct LocalNode *next;
    };

    struct LocalNode n1 = {1, NULL};
    struct LocalNode n4 = {4, NULL};
    struct LocalNode n3 = {3, NULL};
    struct LocalNode n2a = {2, NULL};
    struct LocalNode n5 = {5, NULL};
    struct LocalNode n2b = {2, NULL};
    struct LocalNode *head = NULL;

    n1.next = &n4;
    n4.next = &n3;
    n3.next = &n2a;
    n2a.next = &n5;
    n5.next = &n2b;
    head = &n1;

    printf("Before: ");
    for (struct LocalNode *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    const int x = 3;

    /* TODO: partition using struct LocalNode ** before_tail / after_tail handles. */
    (void)x;

    printf("After partition on 3: ");
    for (struct LocalNode *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    return EXIT_SUCCESS;
}
```

## Solution

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    struct LocalNode {
        int value;
        struct LocalNode *next;
    };

    struct LocalNode n1 = {1, NULL};
    struct LocalNode n4 = {4, NULL};
    struct LocalNode n3 = {3, NULL};
    struct LocalNode n2a = {2, NULL};
    struct LocalNode n5 = {5, NULL};
    struct LocalNode n2b = {2, NULL};
    struct LocalNode *head = NULL;

    n1.next = &n4;
    n4.next = &n3;
    n3.next = &n2a;
    n2a.next = &n5;
    n5.next = &n2b;
    head = &n1;

    printf("Before: ");
    for (struct LocalNode *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    const int x = 3;

    struct LocalNode *before_head = NULL;
    struct LocalNode **before_tail = &before_head;
    struct LocalNode *after_head = NULL;
    struct LocalNode **after_tail = &after_head;

    for (struct LocalNode *cur = head; cur != NULL; ) {
        struct LocalNode *next = cur->next;
        if (cur->value < x) {
            *before_tail = cur;
            before_tail = &cur->next;
        } else {
            *after_tail = cur;
            after_tail = &cur->next;
        }
        cur = next;
    }

    *before_tail = after_head;
    *after_tail = NULL;
    head = before_head;

    printf("After partition on 3: ");
    for (struct LocalNode *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    return EXIT_SUCCESS;
}
```
