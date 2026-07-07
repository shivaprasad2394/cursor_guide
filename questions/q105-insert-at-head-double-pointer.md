---
id: "q105-insert-at-head-double-pointer"
title: "Prepend Node with Node **head and Node *local"
pattern: "pointer-to-pointer"
difficulty: "medium"
visualization: "linked-list"
vizCategory: "pointers"
stdin: ""
expectedOutput: "list: 30 -> 20 -> 10 -> NULL\n"
---
## At a glance

- **Goal:** Prepend an existing node using `Node **head` and `Node *local`
- **Pattern:** Pointer-to-pointer
- **Expected output:** `list: 30 -> 20 -> 10 -> NULL`

## Description

Build nodes separately, then link them with `void prependNode(Node **head, Node *local)`. Pass the **node pointer** (not an integer id) — `local` is already allocated; your job is only to splice it onto the list head.

## Algorithm

```text
step1: Caller creates nodes with makeNode() (provided)
step2: prependNode(&head, local): local->next = *head
step3: *head = local
```

## Example Trace

```text
n10, n20, n30 allocated separately
prepend(&head, n10) → 10
prepend(&head, n20) → 20 -> 10
prepend(&head, n30) → 30 -> 20 -> 10 -> NULL
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

/* TODO: void prependNode(Node **head, Node *local) */

int main(void) {
    Node *head = NULL;
    Node *n10 = makeNode(10);
    Node *n20 = makeNode(20);
    Node *n30 = makeNode(30);
    prependNode(&head, n10);
    prependNode(&head, n20);
    prependNode(&head, n30);
    printf("list:");
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

void prependNode(Node **head, Node *local) {
    local->next = *head;
    *head = local;
}

int main(void) {
    Node *head = NULL;
    Node *n10 = makeNode(10);
    Node *n20 = makeNode(20);
    Node *n30 = makeNode(30);
    prependNode(&head, n10);
    prependNode(&head, n20);
    prependNode(&head, n30);
    printf("list:");
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
