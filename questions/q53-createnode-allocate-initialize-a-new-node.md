---
id: "q53-createnode-allocate-initialize-a-new-node"
title: "createNode - allocate + initialize a new node"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
expectedOutput: "createNode(42): id=42 next=NULL\n"
---
## At a glance

- **Goal:** createNode - allocate + initialize a new node
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `createNode(42): id=42 next=NULL`

## Description

Implement **createNode - allocate + initialize a new node** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

`Node *createNode(int id)` returns the address of one newly allocated node. A single pointer is the right API because the function creates a value for the caller; it does not receive or replace an existing caller-owned head variable. The caller writes `Node *n = createNode(42)`, checks `n` for allocation failure, and owns the returned node until it passes ownership elsewhere or calls `free(n)`.

By contrast, a `Node **` parameter is useful when a function must write a new address into a pointer variable supplied by its caller. There is no such input pointer variable in this factory operation, so adding `Node **` would make the API less direct.

## Algorithm

```text
step1: Allocate memory using malloc. sizeof(*newNode) is safer than
       sizeof(Node) -- if you rename the type, allocation stays correct.
step2: Check for NULL (malloc can fail, especially on MCUs)
step3: Set id = value, next = NULL
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
    Node*n=createNode(42);
    if (n == NULL) return 1;
    printf("createNode(42): id=%d next=%s\n", n->id,
           n->next == NULL ? "NULL" : "non-NULL");
    free(n);
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

int main(void) {
    Node*n=createNode(42);
    if (n == NULL) return 1;
    printf("createNode(42): id=%d next=%s\n", n->id,
           n->next == NULL ? "NULL" : "non-NULL");
    free(n);
    return 0;
}
```
