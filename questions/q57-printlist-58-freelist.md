---
id: "q57-printlist-58-freelist"
title: "printList & 58. freeList"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
expectedOutput: "1 -> 2 -> 3 -> NULL\n"
---
## At a glance

- **Goal:** printList & 58. freeList
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `1 -> 2 -> 3 -> NULL`

## Description

Implement **printList & 58. freeList** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

Both helpers intentionally take single pointers. `printList(const Node *head)` borrows the list read-only; advancing its local pointer cannot alter the caller's `h`. `freeList(Node *head)` consumes and frees the nodes by advancing its own local copy. The caller uses `printList(h)` and `freeList(h)`.

`createNode` gives every node dynamic storage duration. After `freeList(h)`, all three owned heap nodes have been freed exactly once, while the caller's variable still contains a stale address and must not be dereferenced. A `Node **` cleanup API could additionally set the caller's pointer to `NULL`, but this question demonstrates the common single-pointer ownership contract; `main` does not use `h` after transferring the list to `freeList`.

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
    for (int i=3; i>=1; i--) {
        Node*n=createNode(i);
        if (n == NULL) {
            freeList(h);
            return 1;
        }
        n->next=h;
        h=n;
    }
    printList(h);
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
    Node*h=NULL;
    for (int i=3;i>=1;i--){
        Node*n=createNode(i);
        if (n == NULL) {
            freeList(h);
            return 1;
        }
        n->next=h;
        h=n;
    }
    printList(h);
    freeList(h);
    return 0;
}
```
