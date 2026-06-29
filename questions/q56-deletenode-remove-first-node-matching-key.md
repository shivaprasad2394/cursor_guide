---
id: "q56-deletenode-remove-first-node-matching-key"
title: "deleteNode - remove first node matching 'key'"
pattern: "linked list"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: |
  30 -> 10 -> NULL
---

## Description

deleteNode - remove first node matching 'key'

## Algorithm

```text
step1: Special case: if head itself matches, update *head and free old head
step2: Else walk with prev and cur pointers until cur->id == key
step3: Bypass: prev->next = cur->next, then free(cur)
```

## Example Trace

```text
head -> [10] -> [20] -> [30], delete 20
  prev=[10], cur=[20]: match!
  [10]->next = [30], free [20]
  Result: head -> [10] -> [30] -> NULL
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
    for(int i=1;
    i<=3;
    i++){
    Node*n=createNode(i*10);
    n->next=h;
    h=n;
    } /* h: 30 20 10 */ deleteNode(&h,20);
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

void deleteNode(Node **head, int key) {
    if (*head == NULL) return;
    if ((*head)->id == key) {
        Node *dead = *head;
        *head = (*head)->next;
        free(dead);
        return;
    }
    Node *prev = *head, *cur = (*head)->next;
    while (cur != NULL && cur->id != key) { prev = cur; cur = cur->next; }
    if (cur == NULL) return;
    prev->next = cur->next;
    free(cur);
}

int main(void) {
    Node*h=NULL; for(int i=1;i<=3;i++){Node*n=createNode(i*10);n->next=h;h=n;} /* h: 30 20 10 */ deleteNode(&h,20); for(Node*c=h;c;c=c->next)printf("%d -> ",c->id); printf("NULL\n"); while(h){Node*t=h->next;free(h);h=t;}
    return 0;
}
```
