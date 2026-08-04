---
id: "q54-insertathead-o-1-insertion-at-the-beginning"
title: "insertAtHead - O(1) insertion at the beginning"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
vizOperation: "insert-head-local"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
expectedOutput: "5 -> 10 -> NULL\n"
---
## At a glance

- **Goal:** insertAtHead - O(1) insertion at the beginning
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `5 -> 10 -> NULL`

## Description

Implement **insertAtHead - O(1) insertion at the beginning** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

`void insertAtHead(Node **head, Node *node)` receives both the address of the caller's head variable and the address of a caller-owned node. The function reads the old head through `*head` and replaces it through `*head = node`, so the caller uses `insertAtHead(&h, &five)`.

A plain `Node *head` would only copy the current node address into a local parameter. Assigning that local copy would not update `h`; a single-pointer version would instead need to return the new head and require `h = insertAtHead(h, 5)`.

`ten` and `five` have automatic storage duration: they remain alive until `main` returns. Linking their addresses is safe within that lifetime, but they must never be passed to `free`, and no pointer to them may escape `main`. The insertion helper borrows these nodes; it does not allocate or take ownership.

**Walkthrough hint:**

head -> [10] -> [20] -> NULL

## Algorithm

```text
step1: Receive the address of a live caller-owned node
step2: Point that node's next to current head: node->next = *head
step3: Update head to point to that node: *head = node

Why Node **head (double pointer)?
  Because we need to MODIFY the caller's head pointer.
  If we used Node *head, changes would be local to this function.
```

## Example Trace

```text
head -> [10] -> [20] -> NULL
  Node five = {5, NULL}; insertAtHead(&head, &five)
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
    Node ten = {10, NULL};
    Node five = {5, NULL};
    insertAtHead(&h, &ten);
    insertAtHead(&h, &five);
    for (Node*c=h; c; c=c->next) printf("%d -> ",c->id);
    printf("NULL\n");
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
void insertAtHead(Node **head, Node *node) {
    node->next = *head;
    *head = node;
}

int main(void) {
    Node*h=NULL;
    Node ten = {10, NULL};
    Node five = {5, NULL};
    insertAtHead(&h, &ten);
    insertAtHead(&h, &five);
    for (Node*c=h;c;c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    return 0;
}
```
