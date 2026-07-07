---
id: "q109-delete-node-double-pointer"
title: "Delete Node with Node **cursor"
pattern: "pointer-to-pointer"
difficulty: "medium"
visualization: "linked-list"
vizCategory: "pointers"
stdin: ""
expectedOutput: "after delete 20: 10 -> 30 -> NULL\n"
---
## At a glance

- **Goal:** Delete Node with Node **cursor
- **Pattern:** Pointer-To-Pointer
- **Expected output:** `after delete 20: 10 -> 30 -> NULL`

## Description

Delete the first node with a given key using `Node **cur` so you can update the previous `next` pointer (including head).

## Algorithm

```text
step1: while *cur != NULL
step2:   if (*cur)->id == key: save node, *cur = node->next, free node, return
step3:   cur = &((*cur)->next)   (address of next field — double pointer walk)
```

## Example Trace

```text
10->20->30, delete 20 → 10->30
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct Node { int id; struct Node *next; } Node;
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Node *head = NULL, **tail = &head;
    for (int id = 10; id <= 30; id += 10) {
        *tail = (Node *)malloc(sizeof **tail);
        (*tail)->id = id;
        (*tail)->next = NULL;
        tail = &((*tail)->next);
    }
    deleteByKey(&head, 20);
    printf("after delete 20:");
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
void deleteByKey(Node **cur, int key) {
    while (*cur) {
        if ((*cur)->id == key) {
            Node *gone = *cur;
            *cur = gone->next;
            free(gone);
            return;
        }
        cur = &((*cur)->next);
    }
}

int main(void) {
    Node *head = NULL, **tail = &head;
    for (int id = 10; id <= 30; id += 10) {
        *tail = (Node *)malloc(sizeof **tail);
        (*tail)->id = id;
        (*tail)->next = NULL;
        tail = &((*tail)->next);
    }
    deleteByKey(&head, 20);
    printf("after delete 20:");
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
