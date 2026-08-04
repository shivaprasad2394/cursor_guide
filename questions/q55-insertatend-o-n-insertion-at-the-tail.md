---
id: "q55-insertatend-o-n-insertion-at-the-tail"
title: "insertAtEnd - O(n) insertion at the tail"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
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

## Pointer API and ownership

This question uses the return-new-head form: `Node *insertAtEnd(Node *head, int id)`. The parameter is a local copy used to traverse the list, and the function returns the head the caller should own afterward. The caller must write `h = insertAtEnd(h, 30)`. That assignment handles the empty-list case, where the allocated node itself becomes the new head; for a non-empty list the same head address is returned after linking the new tail.

A `Node **` API could update an empty caller head directly, but the alternating lesson here deliberately shows the equally valid single-pointer contract. Allocation failure leaves the original list unchanged and returns its original head.

Each successful call obtains a node from `malloc` through `createNode`. Those nodes have dynamic storage duration and remain alive until explicitly freed. The final loop walks the owned chain and frees every node exactly once; unlike the preceding automatic-storage example, these nodes must not simply be abandoned.

**Walkthrough hint:**

head -> [10] -> [20] -> NULL

## Algorithm

```text
step1: Create new node
step2: If the list is empty (head == NULL), return newNode as the head.
step3: Else walk to the last node (temp->next == NULL)
step4: Set last->next = newNode
step5: Return head; the caller assigns the result back to its head variable.
```

## Example Trace

```text
head -> [10] -> [20] -> NULL
  head = insertAtEnd(head, 30)
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
    h=insertAtEnd(h,10);
    h=insertAtEnd(h,20);
    h=insertAtEnd(h,30);
    for (Node*c=h; c; c=c->next) printf("%d -> ",c->id);
    printf("NULL\n");
    while (h){
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

Node *insertAtEnd(Node *head, int id) {
    Node *newNode = createNode(id);
    if (newNode == NULL) return head;
    if (head == NULL) return newNode;
    Node *temp = head;
    while (temp->next != NULL) temp = temp->next;
    temp->next = newNode;
    return head;
}

int main(void) {
    Node*h=NULL;
    h=insertAtEnd(h,10);
    h=insertAtEnd(h,20);
    h=insertAtEnd(h,30);
    for (Node*c=h;c;c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    while (h){
        Node*t=h->next;
        free(h);
        h=t;
    }
    return 0;
}
```
