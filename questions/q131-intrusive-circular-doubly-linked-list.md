---
id: "q131-intrusive-circular-doubly-linked-list"
title: "Intrusive Circular Doubly Linked List (systems C variant)"
pattern: "intrusive list (embedded node + container_of)"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
vizCategory: "linked list"
vizOperation: "intrusive-circular"
listType: "dll"
listNodes: "10,20,30"
stdin: ""
complexity: "O(L) time per walk, O(1) insert/remove at anchor"
expectedOutput: "visit: 10 20 30\nafter remove 20: 10 30\ncircular links valid: yes\n"
---
## At a glance

- **Goal:** Walk and mutate a **circular doubly linked list** whose nodes are **embedded** in caller-owned container structs.
- **Input:** Address of an anchor node's `next`/`prev` links; no standalone list-node allocation.
- **Output:** Visitor callback receives each container; remove/detach by address.
- **Ownership:** Containers are automatic-storage objects; the list stores only links between embedded nodes.
- **Pattern:** Linux-kernel-style intrusive list — `container_of`, anchor sentinel, circular links.
- **Complexity:** O(L) for a full walk; O(1) insert/remove at a known node.

## Original problem vs C-specific constraint

| | |
|---|---|
| **Original (LeetCode / HackerRank)** | Not a platform problem — this is a **systems C interview pattern** (Linux `list_head`, BSD `TAILQ`, embedded anchors). |
| **C-specific focus** | Automatic **container** objects with embedded `ListNode`; mutate through `struct ListNode **` / anchor; **`container_of`** macro; **visitor callback**; **no node allocation**. |

## Problem statement

Implement helpers for a circular doubly linked list where each `ListNode` is embedded inside a `Container` struct. The anchor node lives inside a head container and is not considered data. Insert after the anchor, walk all containers, and remove a container by its embedded node address.

```text
void list_init(struct ListNode *anchor);
void list_insert_after(struct ListNode *anchor, struct ListNode *node);
void list_for_each_container(struct ListNode *anchor, ContainerVisitorFn visit, void *ctx);
void list_remove(struct ListNode *node);
```

## Pointer API and ownership

`list_init(&head.container.node)` makes the anchor point to itself (empty circular list). `list_insert_after` splices a caller-owned embedded node after the anchor — no allocation.

`list_for_each_container` walks from `anchor->next` until it returns to the anchor, converting each `ListNode *` to `Container *` via `container_of`.

`list_remove` unlinks a node and calls `list_init` on it so it becomes a singleton circle — the container object remains alive.

## Algorithm

```text
list_init:
step1: anchor->next = anchor; anchor->prev = anchor.

list_insert_after:
step1: node->next = anchor->next; node->prev = anchor.
step2: anchor->next->prev = node; anchor->next = node.

list_for_each_container:
step1: For cur = anchor->next; cur != anchor; cur = cur->next:
step2:     visit(container_of(cur, Container, node), ctx).

list_remove:
step1: node->prev->next = node->next; node->next->prev = node->prev.
step2: list_init(node).
```

## Worked trace

```text
Containers c10, c20, c30 (automatic), anchor in head

list_init(anchor): anchor <-> anchor (empty)
insert c10, c20, c30 after anchor → anchor <-> c10 <-> c20 <-> c30 <-> anchor

visit prints: 10 20 30
list_remove(c20.node): anchor <-> c10 <-> c30 <-> anchor
circular links valid: yes
```

## Edge cases

- **Empty list:** Anchor points to itself; walk runs zero iterations.
- **Single element:** anchor <-> c10 <-> anchor.
- **Remove head data node:** Circular links repaired; removed container becomes singleton.
- **Remove anchor itself:** Forbidden — anchor is not a data node.
- **Double remove:** Undefined — caller must not remove twice.

## Starter Code

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    struct ListNode *prev;
    struct ListNode *next;
};

struct Container {
    int id;
    struct ListNode node;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

typedef void (*ContainerVisitorFn)(struct Container *item, void *ctx);

void list_init(struct ListNode *anchor) {
    anchor->next = anchor;
    anchor->prev = anchor;
}

void list_insert_after(struct ListNode *anchor, struct ListNode *node) {
    /* TODO: splice node into circular DLL after anchor. */
    (void)anchor;
    (void)node;
}

void list_for_each_container(struct ListNode *anchor, ContainerVisitorFn visit, void *ctx) {
    /* TODO: walk circular list, container_of each node, call visit. */
    (void)anchor;
    (void)visit;
    (void)ctx;
}

void list_remove(struct ListNode *node) {
    /* TODO: unlink node and list_init it. */
    (void)node;
}

static void printVisitor(struct Container *item, void *ctx) {
    (void)ctx;
    printf("%d ", item->id);
}

static int circularLinksValid(struct ListNode *anchor) {
    if (anchor->next->prev != anchor) {
        return 0;
    }
    for (struct ListNode *cur = anchor->next; cur != anchor; cur = cur->next) {
        if (cur->next->prev != cur || cur->prev->next != cur) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    struct Container head = {0};
    struct Container c10 = {.id = 10};
    struct Container c20 = {.id = 20};
    struct Container c30 = {.id = 30};

    list_init(&head.node);
    list_insert_after(&head.node, &c10.node);
    list_insert_after(&head.node, &c20.node);
    list_insert_after(&head.node, &c30.node);

    printf("visit: ");
    list_for_each_container(&head.node, printVisitor, NULL);
    printf("\n");

    list_remove(&c20.node);

    printf("after remove 20: ");
    list_for_each_container(&head.node, printVisitor, NULL);
    printf("\n");
    printf("circular links valid: %s\n", circularLinksValid(&head.node) ? "yes" : "no");

    return EXIT_SUCCESS;
}
```

## Solution

```c
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    struct ListNode *prev;
    struct ListNode *next;
};

struct Container {
    int id;
    struct ListNode node;
};

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

typedef void (*ContainerVisitorFn)(struct Container *item, void *ctx);

void list_init(struct ListNode *anchor) {
    anchor->next = anchor;
    anchor->prev = anchor;
}

void list_insert_after(struct ListNode *anchor, struct ListNode *node) {
    node->next = anchor->next;
    node->prev = anchor;
    anchor->next->prev = node;
    anchor->next = node;
}

void list_for_each_container(struct ListNode *anchor, ContainerVisitorFn visit, void *ctx) {
    for (struct ListNode *cur = anchor->next; cur != anchor; cur = cur->next) {
        struct Container *item = container_of(cur, struct Container, node);
        visit(item, ctx);
    }
}

void list_remove(struct ListNode *node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
    list_init(node);
}

static void printVisitor(struct Container *item, void *ctx) {
    (void)ctx;
    printf("%d ", item->id);
}

static int circularLinksValid(struct ListNode *anchor) {
    if (anchor->next->prev != anchor) {
        return 0;
    }
    for (struct ListNode *cur = anchor->next; cur != anchor; cur = cur->next) {
        if (cur->next->prev != cur || cur->prev->next != cur) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    struct Container head = {0};
    struct Container c10 = {.id = 10};
    struct Container c20 = {.id = 20};
    struct Container c30 = {.id = 30};

    list_init(&head.node);
    list_insert_after(&head.node, &c10.node);
    list_insert_after(&head.node, &c20.node);
    list_insert_after(&head.node, &c30.node);

    printf("visit: ");
    list_for_each_container(&head.node, printVisitor, NULL);
    printf("\n");

    list_remove(&c20.node);

    printf("after remove 20: ");
    list_for_each_container(&head.node, printVisitor, NULL);
    printf("\n");
    printf("circular links valid: %s\n", circularLinksValid(&head.node) ? "yes" : "no");

    return EXIT_SUCCESS;
}
```
