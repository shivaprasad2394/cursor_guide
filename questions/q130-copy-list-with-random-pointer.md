---
id: "q130-copy-list-with-random-pointer"
title: "Copy List with Random Pointer (LeetCode 138 adaptation)"
pattern: "linked list (deep copy + rollback)"
difficulty: "hard"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
vizCategory: "linked list"
vizOperation: "copy-random"
listType: "sll"
listNodes: "7,13,11,10,1"
listRandomTargets: "null,0,4,1,5"
stdin: ""
complexity: "O(L) time, O(1) auxiliary space (interleaved copy)"
expectedOutput: "original: 7 -> 13 -> 11 -> 10 -> 1 -> NULL\n copy:    7 -> 13 -> 11 -> 10 -> 1 -> NULL\nrandom links match: yes\n"
---
## At a glance

- **Goal:** Deep-copy a singly linked list where each node has an extra `random` pointer.
- **Input:** Head of the source list and caller-supplied allocator/deallocator callbacks.
- **Output:** Head of an independent copy, or `NULL` on allocation failure (with rollback).
- **Ownership:** Copy nodes are allocated via `alloc_fn` and owned by the caller of `copyRandomList`.
- **Pattern:** Interleaved clone (A→A'→B→B'…), assign random links, then split.
- **Complexity:** O(L) time and O(1) auxiliary space beyond the new nodes.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (LeetCode 138)** | Deep copy a list with `next` and `random` pointers; platform manages memory. |
| **C-specific adaptation** | Return `struct Node *`; accept **allocator/deallocator callbacks**; on any allocation failure, **rollback** (free every node allocated so far) and return `NULL`. |

## Problem statement

Implement a deep copy of a singly linked list where each node has `value`, `next`, and `random` fields. Use caller-supplied allocation functions so the copy logic is testable with counting allocators or custom pools.

```text
typedef void *(*NodeAllocFn)(size_t size);
typedef void  (*NodeFreeFn)(void *ptr);

struct Node *copyRandomList(const struct Node *head, NodeAllocFn alloc_fn, NodeFreeFn free_fn);
```

On success, return the head of a new list. On failure, free every partially built node and return `NULL`.

## Pointer API and ownership

`copyRandomList` receives the source head as `const struct Node *` — it reads but never mutates or frees the original. The returned `struct Node *` transfers ownership of all copy nodes to the caller, who must eventually call `free_fn` on each node (or use the provided `freeCopyList` helper).

Callbacks mirror `malloc`/`free`: `alloc_fn(sizeof(struct Node))` returns a node or `NULL`; `free_fn` releases a previously allocated node.

## Algorithm

```text
step1: If head is NULL, return NULL.
step2: Pass 1 — for each original node cur, allocate copy', insert after cur: cur -> copy' -> cur->next_was.
step3: Pass 2 — for each cur, set cur->next->random from cur->random mapping (original->next is copy).
step4: Pass 3 — split interleaved list into original and copy; restore original next links.
step5: Return copy head.
step6: On any alloc failure in pass 1, walk back restoring links and free partial copies.
```

## Worked trace

```text
Original: 7(random→NULL) -> 13(random→7) -> 11(random→1) -> 10(random→11) -> 1(random→7)

Pass 1 interleave:
  7 -> 7' -> 13 -> 13' -> 11 -> 11' -> 10 -> 10' -> 1 -> 1'

Pass 2 random:
  7'.random = NULL
  13'.random = 7'  (13.random was 7, 7.next is 7')
  ...

Pass 3 split → original restored, copy = 7' -> 13' -> 11' -> 10' -> 1'
```

## Edge cases

- **Empty list:** Return `NULL` without calling alloc.
- **All random NULL:** Copy is a plain linked list.
- **random points to self:** Copy node's random points to the copy of self.
- **Allocation failure mid-pass-1:** Restore every original `next` link, free every copy node created, return `NULL`.
- **alloc_fn or free_fn NULL:** Treat as error; return `NULL`.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
    struct Node *random;
};

typedef void *(*NodeAllocFn)(size_t size);
typedef void (*NodeFreeFn)(void *ptr);

struct Node *copyRandomList(const struct Node *head, NodeAllocFn alloc_fn, NodeFreeFn free_fn) {
    /* TODO: interleaved deep copy with rollback on allocation failure. */
    (void)head;
    (void)alloc_fn;
    (void)free_fn;
    return NULL;
}

static struct Node *makeNode(int value, struct Node *next, struct Node *random) {
    struct Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return NULL;
    }
    node->value = value;
    node->next = next;
    node->random = random;
    return node;
}

static void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

static int randomLinksMatch(const struct Node *orig, const struct Node *copy) {
    for (const struct Node *oc = orig, *cc = copy; oc != NULL && cc != NULL; oc = oc->next, cc = cc->next) {
        const struct Node *oTarget = oc->random;
        const struct Node *cTarget = cc->random;
        if (oTarget == NULL && cTarget == NULL) {
            continue;
        }
        if (oTarget == NULL || cTarget == NULL || oTarget->value != cTarget->value) {
            return 0;
        }
    }
    return orig == NULL && copy == NULL;
}

int main(void) {
    struct Node *n1 = makeNode(1, NULL, NULL);
    struct Node *n10 = makeNode(10, n1, NULL);
    struct Node *n11 = makeNode(11, n10, n1);
    struct Node *n13 = makeNode(13, n11, NULL);
    struct Node *n7 = makeNode(7, n13, NULL);
    if (n7 == NULL) {
        freeList(n1);
        return EXIT_FAILURE;
    }
    n13->random = n7;
    n11->random = n1;
    n10->random = n11;

    printf("original: ");
    for (struct Node *cur = n7; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    struct Node *copy = copyRandomList(n7, malloc, free);
    if (copy == NULL) {
        fprintf(stderr, "copy failed\n");
        freeList(n7);
        return EXIT_FAILURE;
    }

    printf(" copy:    ");
    for (struct Node *cur = copy; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");
    printf("random links match: %s\n", randomLinksMatch(n7, copy) ? "yes" : "no");

    freeList(copy);
    freeList(n7);
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
    struct Node *random;
};

typedef void *(*NodeAllocFn)(size_t size);
typedef void (*NodeFreeFn)(void *ptr);

static void rollbackInterleavedCopies(struct Node *head, NodeFreeFn free_fn) {
    for (struct Node *orig = head; orig != NULL; ) {
        struct Node *inserted = orig->next;
        if (inserted == NULL) {
            break;
        }
        struct Node *orig_next = inserted->next;
        orig->next = orig_next;
        free_fn(inserted);
        orig = orig_next;
    }
}

struct Node *copyRandomList(const struct Node *head, NodeAllocFn alloc_fn, NodeFreeFn free_fn) {
    if (head == NULL) {
        return NULL;
    }
    if (alloc_fn == NULL || free_fn == NULL) {
        return NULL;
    }

    struct Node *copy_head = NULL;
    struct Node *copy_tail = NULL;

    for (const struct Node *cur = head; cur != NULL; cur = cur->next) {
        struct Node *copy = alloc_fn(sizeof *copy);
        if (copy == NULL) {
            rollbackInterleavedCopies((struct Node *)head, free_fn);
            return NULL;
        }
        copy->value = cur->value;
        copy->next = cur->next;
        copy->random = NULL;

        if (copy_head == NULL) {
            copy_head = copy;
            copy_tail = copy;
        } else {
            copy_tail->next = copy;
            copy_tail = copy;
        }

        ((struct Node *)cur)->next = copy;
    }

    for (struct Node *cur = (struct Node *)head; cur != NULL; cur = cur->next) {
        struct Node *copy = cur->next;
        if (cur->random != NULL) {
            copy->random = cur->random->next;
        } else {
            copy->random = NULL;
        }
    }

    struct Node *orig = (struct Node *)head;
    struct Node *copy = copy_head;
    while (orig != NULL) {
        struct Node *orig_next = copy->next;
        orig->next = orig_next;
        orig = orig_next;
        copy = copy->next;
    }

    return copy_head;
}

static struct Node *makeNode(int value, struct Node *next, struct Node *random) {
    struct Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return NULL;
    }
    node->value = value;
    node->next = next;
    node->random = random;
    return node;
}

static void freeList(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

static int randomLinksMatch(const struct Node *orig, const struct Node *copy) {
    for (const struct Node *oc = orig, *cc = copy; oc != NULL && cc != NULL; oc = oc->next, cc = cc->next) {
        const struct Node *oTarget = oc->random;
        const struct Node *cTarget = cc->random;
        if (oTarget == NULL && cTarget == NULL) {
            continue;
        }
        if (oTarget == NULL || cTarget == NULL || oTarget->value != cTarget->value) {
            return 0;
        }
    }
    return orig == NULL && copy == NULL;
}

int main(void) {
    struct Node *n1 = makeNode(1, NULL, NULL);
    struct Node *n10 = makeNode(10, n1, NULL);
    struct Node *n11 = makeNode(11, n10, n1);
    struct Node *n13 = makeNode(13, n11, NULL);
    struct Node *n7 = makeNode(7, n13, NULL);
    if (n7 == NULL) {
        freeList(n1);
        return EXIT_FAILURE;
    }
    n13->random = n7;
    n11->random = n1;
    n10->random = n11;

    printf("original: ");
    for (struct Node *cur = n7; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");

    struct Node *copy = copyRandomList(n7, malloc, free);
    if (copy == NULL) {
        fprintf(stderr, "copy failed\n");
        freeList(n7);
        return EXIT_FAILURE;
    }

    printf(" copy:    ");
    for (struct Node *cur = copy; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\n");
    printf("random links match: %s\n", randomLinksMatch(n7, copy) ? "yes" : "no");

    freeList(copy);
    freeList(n7);
    return EXIT_SUCCESS;
}
```
