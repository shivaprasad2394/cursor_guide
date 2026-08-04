---
id: "q60-findmiddle-slow-fast-pointer"
title: "findMiddle - slow & fast pointer"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node *"
nodeStorage: "dynamic (malloc)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "middle=3\n"
---
## At a glance

- **Goal:** findMiddle - slow & fast pointer
- **Pattern:** Linked list
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `middle=3`

## Description

Implement **findMiddle - slow & fast pointer** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

`Node *findMiddle(Node *head)` borrows a starting address, walks with local `slow` and `fast` pointers, and returns a borrowed pointer to a node already owned by the caller. The caller uses `Node *m = findMiddle(h)` and must not free `m` separately; it remains part of `h`.

The algorithm does not replace the head or any link, so `Node **` would falsely imply that the function may update the caller's pointer. For a read-only traversal, one pointer is the honest API (and the parameter could also be `const Node *` if the return type were correspondingly const).

The test chain is dynamically allocated with `malloc`. `m` is only a borrowed interior pointer; freeing it separately would split the ownership graph and cause a later double free. Instead, `main` frees every node exactly once by walking from the owning head `h`.

**Walkthrough hint:**

[1] -> [2] -> [3] -> [4] -> [5]

## Algorithm

```text
step1: slow = head, fast = head
step2: Move slow by 1, fast by 2 each iteration
step3: When fast reaches end (NULL or last node), slow is at the middle
```

## Example Trace

```text
[1] -> [2] -> [3] -> [4] -> [5]
  slow=[1],fast=[1]: slow=[2],fast=[3]
  slow=[2],fast=[3]: slow=[3],fast=[5]
  fast->next == NULL, STOP. Middle = [3]
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
    for (int i=5; i>=1; i--) {
        Node*n=malloc(sizeof*n);
        if (n == NULL) {
            while (h) { Node *t=h->next; free(h); h=t; }
            return 1;
        }
        n->id=i;
        n->next=h;
        h=n;
    }
    Node*m=findMiddle(h);
    printf("middle=%d\n", m->id);
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

Node *findMiddle(Node *head) {
    if (head == NULL) return NULL;
    Node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

int main(void) {
    Node*h=NULL;
    for (int i=5;i>=1;i--){
        Node*n=malloc(sizeof*n);
        if (n == NULL) {
            while (h) { Node *t=h->next; free(h); h=t; }
            return 1;
        }
        n->id=i;
        n->next=h;
        h=n;
    }
    Node*m=findMiddle(h);
    printf("middle=%d\n", m->id);
    while (h){
        Node*t=h->next;
        free(h);
        h=t;
    }
    return 0;
}
```
