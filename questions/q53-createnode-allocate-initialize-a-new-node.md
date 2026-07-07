---
id: "q53-createnode-allocate-initialize-a-new-node"
title: "createNode - allocate + initialize a new node"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
expectedOutput: "createNode(42): id=42 next=0x0\n"
---
## At a glance

- **Goal:** createNode - allocate + initialize a new node
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `createNode(42): id=42 next=0x0`

## Description

Implement **createNode - allocate + initialize a new node** using the pattern above. Write the helper function(s); `main()` is provided.

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
    printf("createNode(42): id=%d next=%p\n", n->id,(void*)n->next);
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
    printf("createNode(42): id=%d next=%p\n", n->id,(void*)n->next);
    free(n);
    return 0;
}
```
