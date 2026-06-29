---
id: "q57-printlist-58-freelist"
title: "printList & 58. freeList"
pattern: "linked list"
difficulty: "medium"
visualization: "none"
stdin: ""
expectedOutput: |
  1 -> 2 -> 3 -> NULL
---

## Description

printList & 58. freeList

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
    for(int i=3;
    i>=1;
    i--){
    Node*n=createNode(i);
    n->next=h;
    h=n;
    } printList(h);
    freeList(h);
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

void printList(const Node *head) {
    for (const Node *cur = head; cur != NULL; cur = cur->next)
        printf("%d -> ", cur->id);
    printf("NULL\n");
}

void freeList(Node *head) {
    while (head) { Node *next = head->next; free(head); head = next; }
}

int main(void) {
    Node*h=NULL; for(int i=3;i>=1;i--){Node*n=createNode(i);n->next=h;h=n;} printList(h); freeList(h);
    return 0;
}
```
