---
id: "q105-insert-at-head-double-pointer"
title: "Insert at Head with Node **head"
pattern: "pointer-to-pointer"
difficulty: "medium"
visualization: "linked-list"
vizCategory: "pointers"
stdin: ""
expectedOutput: "list: 30 -> 20 -> 10 -> NULL\n"
---
## At a glance

- **Goal:** Insert at Head with Node **head
- **Pattern:** Pointer-To-Pointer
- **Expected output:** `list: 30 -> 20 -> 10 -> NULL`

## Description

Implement `insertAtHead(Node **head, int id)` so the caller's head pointer updates when the list was empty or already had nodes.

## Algorithm

```text
step1: Allocate a new node
step2: new->next = *head
step3: *head = new   (write through the double pointer)
```

## Example Trace

```text
Insert 10, 20, 30 at head → 30 -> 20 -> 10 -> NULL
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
    Node *head = NULL;
    insertAtHead(&head, 10);
    insertAtHead(&head, 20);
    insertAtHead(&head, 30);
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
void insertAtHead(Node **head, int id) {
    Node *n = (Node *)malloc(sizeof *n);
    n->id = id;
    n->next = *head;
    *head = n;
}

int main(void) {
    Node *head = NULL;
    insertAtHead(&head, 10);
    insertAtHead(&head, 20);
    insertAtHead(&head, 30);
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
