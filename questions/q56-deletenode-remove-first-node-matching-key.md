---
id: "q56-deletenode-remove-first-node-matching-key"
title: "deleteNode - remove first node matching 'key'"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
listNodes: "30,20,10"
listHighlight: "20"
stdin: ""
expectedOutput: "30 -> 10 -> NULL\n"
---
## At a glance

- **Goal:** deleteNode - remove first node matching 'key'
- **Pattern:** Linked list
- **Complexity:** See algorithm
- **Expected output:** `30 -> 10 -> NULL`

## Description

Implement **deleteNode - remove first node matching 'key'** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

`Node *deleteNode(Node **head, int key)` can unlink any matching node, including the head. The caller passes `&h`; inside the function, `*head` is the caller's current head and writing through the current link changes the real chain. The function returns the detached node, or `NULL` if no key matches.

With only `Node *head`, bypassing a non-head node would work, but replacing the caller's head would not. Such an API would have to return a new head and be called with an assignment.

This version links the addresses of `n30`, `n20`, and `n10`, which have automatic storage duration in `main`. `deleteNode` borrows and detaches them; it must not call `free`. The returned `removed` pointer remains valid until `main` returns, and the function clears `removed->next` so it is visibly outside the list. Returning one of these addresses from `main` or retaining it past `main` would be invalid.

**Walkthrough hint:**

head -> [30] -> [20] -> [10], delete 20

## Algorithm

```text
step1: Start with a Node **link that points at the caller's head slot.
step2: Advance link to the address of each next field until (*link)->id matches.
step3: Save *link, replace that link with removed->next, and detach removed.
step4: Return the borrowed removed node; do not free automatic-storage nodes.
```

## Example Trace

```text
head -> [30] -> [20] -> [10], delete 20
  link=&[30].next, *link=[20]: match!
  [30]->next = [10], detach [20]
  Result: head -> [30] -> [10] -> NULL
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
    Node n10 = {10, NULL};
    Node n20 = {20, &n10};
    Node n30 = {30, &n20};
    Node *h = &n30;
    Node *removed = deleteNode(&h, 20);
    (void)removed;
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
Node *deleteNode(Node **head, int key) {
    Node **link = head;
    while (*link != NULL && (*link)->id != key) {
        link = &(*link)->next;
    }
    if (*link == NULL) return NULL;
    Node *removed = *link;
    *link = removed->next;
    removed->next = NULL;
    return removed;
}

int main(void) {
    Node n10 = {10, NULL};
    Node n20 = {20, &n10};
    Node n30 = {30, &n20};
    Node *h = &n30;
    Node *removed = deleteNode(&h, 20);
    (void)removed;
    for (Node*c=h;c;c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    return 0;
}
```
