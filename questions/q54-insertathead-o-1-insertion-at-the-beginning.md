---
id: "q54-insertathead-o-1-insertion-at-the-beginning"
title: "insertAtHead - O(1) insertion at the beginning"
pattern: "linked list"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: |
  5 -> 10 -> NULL
---

## Description

insertAtHead - O(1) insertion at the beginning

## Algorithm

```text
step1: Create a new node
step2: Point new node's next to current head: newNode->next = *head
step3: Update head to point to new node: *head = newNode

Why Node **head (double pointer)?
  Because we need to MODIFY the caller's head pointer.
  If we used Node *head, changes would be local to this function.
```

## Example Trace

```text
head -> [10] -> [20] -> NULL
  insertAtHead(&head, 5)
  Result: head -> [5] -> [10] -> [20] -> NULL
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
    Node*h=NULL;
    insertAtHead(&h,10);
    insertAtHead(&h,5);
    for(Node*c=h;
    c;
    c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    while(h){
    Node*t=h->next;
    free(h);
    h=t;
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
Node *createNode(int id) {
    Node *newNode = (Node *)malloc(sizeof(*newNode));
    if (newNode == NULL) return NULL;
    newNode->id   = id;
    newNode->next = NULL;
    return newNode;
}

int insertAtHead(Node **head, int id) {
    Node *newNode = createNode(id);
    if (newNode == NULL) return -1;
    newNode->next = *head;
    *head = newNode;
    return 0;
}

int main(void) {
    Node*h=NULL; insertAtHead(&h,10); insertAtHead(&h,5); for(Node*c=h;c;c=c->next)printf("%d -> ",c->id); printf("NULL\n"); while(h){Node*t=h->next;free(h);h=t;}
    return 0;
}
```
