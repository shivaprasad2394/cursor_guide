---
id: "q55-insertatend-o-n-insertion-at-the-tail"
title: "insertAtEnd - O(n) insertion at the tail"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
expectedOutput: "10 -> 20 -> 30 -> NULL\n"
---
## At a glance

- **Goal:** insertAtEnd - O(n) insertion at the tail
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `10 -> 20 -> 30 -> NULL`

## Description

Implement **insertAtEnd - O(n) insertion at the tail** using the pattern above. Write the helper function(s); `main()` is provided.

**Walkthrough hint:**

head -> [10] -> [20] -> NULL

## Algorithm

```text
step1: Create new node
step2: If list is empty (*head == NULL): *head = newNode, done.
step3: Else walk to the last node (temp->next == NULL)
step4: Set last->next = newNode
```

## Example Trace

```text
head -> [10] -> [20] -> NULL
  insertAtEnd(&head, 30)
  Walk to [20], set [20]->next = [30]
  Result: head -> [10] -> [20] -> [30] -> NULL
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
    insertAtEnd(&h,10);
    insertAtEnd(&h,20);
    insertAtEnd(&h,30);
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

int insertAtEnd(Node **head, int id) {
    Node *newNode = createNode(id);
    if (newNode == NULL) return -1;
    if (*head == NULL) { *head = newNode; return 0; }
    Node *temp = *head;
    while (temp->next != NULL) temp = temp->next;
    temp->next = newNode;
    return 0;
}

int main(void) {
    Node*h=NULL; insertAtEnd(&h,10); insertAtEnd(&h,20); insertAtEnd(&h,30); for(Node*c=h;c;c=c->next)printf("%d -> ",c->id); printf("NULL\n"); while(h){Node*t=h->next;free(h);h=t;}
    return 0;
}
```
