---
id: "q128-merge-sorted-lists-with-comparator"
title: "Merge Two Sorted Lists with Comparator (LeetCode 21 adaptation)"
pattern: "linked list (dummy head + function pointer)"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
vizCategory: "linked list"
vizOperation: "merge-callback"
listType: "sll"
listNodes: "1,2,4"
listNodesB: "1,3,4"
stdin: ""
complexity: "O(n + m) time, O(1) auxiliary space"
expectedOutput: "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL\n"
---
## At a glance

- **Goal:** Merge two ascending sorted lists into one sorted list using a comparator callback.
- **Input:** Two head pointers and a `NodeCompareFn` function pointer.
- **Output:** Head of the merged list (reuses existing nodes; no new node allocations).
- **Ownership:** Caller transfers both chains; returned head owns the combined list.
- **Pattern:** Stack-allocated dummy sentinel + tail pointer + comparator instead of inline `<`.
- **Complexity:** O(n + m) time and O(1) auxiliary space.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (LeetCode 21)** | Merge two sorted lists; compare with `list1->val <= list2->val`. |
| **C-specific adaptation** | Use a **stack dummy node**, return `Node *`, and delegate ordering to a **comparator function pointer** so the merge logic is reusable for other orderings. |

## Problem statement

Merge two sorted singly linked lists into one sorted list. Ordering is determined by a caller-supplied comparator, not hard-coded `<`. Reuse every existing node; do not allocate merge nodes.

```text
typedef int (*NodeCompareFn)(const struct Node *a, const struct Node *b);

struct Node *mergeSortedLists(struct Node *a, struct Node *b, NodeCompareFn cmp);
```

Return `0` from `cmp(a, b)` when `a` should come before or with `b`; return `> 0` when `b` should come first.

## Pointer API and ownership

`mergeSortedLists(a, b, cmp)` receives two ownership roots by value and returns the merged root. After the call, `a` and `b` must not be used as separate lists — every node is reachable from the return value.

The dummy node lives on the stack (`struct Node dummy`). Only `dummy.next` becomes part of the merged list; the dummy itself is never returned.

## Algorithm

```text
step1: Allocate dummy on the stack; tail = &dummy.
step2: While both a and b are not NULL:
step3:     If cmp(a, b) <= 0, attach a, advance a; else attach b, advance b.
step4:     Move tail to tail->next.
step5: Attach whichever list remains to tail->next.
step6: Return dummy.next.
```

## Worked trace

```text
List A: 1 -> 2 -> 4, List B: 1 -> 3 -> 4, cmp = ascending by value

dummy -> (building)
cmp(1,1)<=0 → attach A's 1, a=2
cmp(2,1)>0  → attach B's 1, b=3
cmp(2,3)<=0 → attach A's 2, a=4
cmp(4,3)>0  → attach B's 3, b=4
cmp(4,4)<=0 → attach A's 4, a=NULL
drain B's 4

Result: 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> NULL
```

## Edge cases

- **Both empty:** Return `NULL` (`dummy.next` stays `NULL`).
- **One empty:** Return the other list unchanged.
- **Equal heads:** Stable tie-break — `cmp <= 0` picks from list `a` first.
- **Comparator NULL:** Undefined — caller must supply a valid function.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

typedef int (*NodeCompareFn)(const struct Node *a, const struct Node *b);

int compareByValue(const struct Node *a, const struct Node *b) {
    return a->value - b->value;
}

struct Node *mergeSortedLists(struct Node *a, struct Node *b, NodeCompareFn cmp) {
    /* TODO: stack dummy, tail pointer, and cmp-driven merge. */
    (void)a;
    (void)b;
    (void)cmp;
    return NULL;
}

static struct Node *buildList(const int *values, size_t count) {
    struct Node *head = NULL;
    for (size_t i = 0; i < count; ++i) {
        struct Node *node = malloc(sizeof *node);
        if (node == NULL) {
            while (head != NULL) {
                struct Node *next = head->next;
                free(head);
                head = next;
            }
            return NULL;
        }
        node->value = values[i];
        node->next = head;
        head = node;
    }
    return head;
}

static void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int main(void) {
    const int va[] = {4, 2, 1};
    const int vb[] = {4, 3, 1};
    struct Node *a = buildList(va, 3);
    struct Node *b = buildList(vb, 3);
    if (a == NULL || b == NULL) {
        freeList(a);
        freeList(b);
        return EXIT_FAILURE;
    }

    struct Node *merged = mergeSortedLists(a, b, compareByValue);
    for (struct Node *cur = merged; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    freeList(merged);
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

typedef int (*NodeCompareFn)(const struct Node *a, const struct Node *b);

int compareByValue(const struct Node *a, const struct Node *b) {
    return a->value - b->value;
}

struct Node *mergeSortedLists(struct Node *a, struct Node *b, NodeCompareFn cmp) {
    struct Node dummy = {0, NULL};
    struct Node *tail = &dummy;

    while (a != NULL && b != NULL) {
        if (cmp(a, b) <= 0) {
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }

    tail->next = (a != NULL) ? a : b;
    return dummy.next;
}

static struct Node *buildList(const int *values, size_t count) {
    struct Node *head = NULL;
    for (size_t i = 0; i < count; ++i) {
        struct Node *node = malloc(sizeof *node);
        if (node == NULL) {
            while (head != NULL) {
                struct Node *next = head->next;
                free(head);
                head = next;
            }
            return NULL;
        }
        node->value = values[i];
        node->next = head;
        head = node;
    }
    return head;
}

static void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int main(void) {
    const int va[] = {4, 2, 1};
    const int vb[] = {4, 3, 1};
    struct Node *a = buildList(va, 3);
    struct Node *b = buildList(vb, 3);
    if (a == NULL || b == NULL) {
        freeList(a);
        freeList(b);
        return EXIT_FAILURE;
    }

    struct Node *merged = mergeSortedLists(a, b, compareByValue);
    for (struct Node *cur = merged; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    freeList(merged);
    return EXIT_SUCCESS;
}
```
