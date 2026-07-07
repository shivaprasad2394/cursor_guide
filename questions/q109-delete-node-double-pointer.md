---
id: "q109-delete-node-double-pointer"
title: "Delete Node by Address with Node **head"
pattern: "pointer-to-pointer"
difficulty: "medium"
visualization: "linked-list"
vizCategory: "pointers"
stdin: ""
expectedOutput: "after delete n20: 10 -> 30 -> NULL\n"
---
## At a glance

- **Goal:** Delete a node by pointer using `Node **head` and `Node *target`
- **Pattern:** Pointer-to-pointer
- **Expected output:** `after delete n20: 10 -> 30 -> NULL`

## Description

Given a list and a **pointer to the node to remove** (`target`), implement `void deleteNode(Node **head, Node *target)`. Walk with `Node **cur` until `*cur == target` — no key/value search.

## Algorithm

```text
step1: cur = head (address of head pointer)
step2: while *cur != NULL:
step3:   if *cur == target: *cur = target->next; free(target); return
step4:   cur = &((*cur)->next)
```

## Example Trace

```text
head -> n10(10) -> n20(20) -> n30(30)
deleteNode(&head, n20)
head -> n10(10) -> n30(30)
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

typedef struct Node { int id; struct Node *next; } Node;

Node *makeNode(int id) {
    Node *local = (Node *)malloc(sizeof *local);
    local->id = id;
    local->next = NULL;
    return local;
}

/* TODO: void deleteNode(Node **head, Node *target) */

int main(void) {
    Node *head = NULL;
    Node *n10 = makeNode(10);
    Node *n20 = makeNode(20);
    Node *n30 = makeNode(30);
    n10->next = n20;
    n20->next = n30;
    head = n10;
    deleteNode(&head, n20);
    printf("after delete n20:");
    for (Node *c = head; c; c = c->next) printf(" %d ->", c->id);
    printf(" NULL\n");
    while (head) {
        Node *t = head->next;
        free(head);
        head = t;
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

Node *makeNode(int id) {
    Node *local = (Node *)malloc(sizeof *local);
    local->id = id;
    local->next = NULL;
    return local;
}

void deleteNode(Node **head, Node *target) {
    Node **cur = head;
    while (*cur) {
        if (*cur == target) {
            *cur = target->next;
            free(target);
            return;
        }
        cur = &((*cur)->next);
    }
}

int main(void) {
    Node *head = NULL;
    Node *n10 = makeNode(10);
    Node *n20 = makeNode(20);
    Node *n30 = makeNode(30);
    n10->next = n20;
    n20->next = n30;
    head = n10;
    deleteNode(&head, n20);
    printf("after delete n20:");
    for (Node *c = head; c; c = c->next) printf(" %d ->", c->id);
    printf(" NULL\n");
    while (head) {
        Node *t = head->next;
        free(head);
        head = t;
    }
    return 0;
}
```
