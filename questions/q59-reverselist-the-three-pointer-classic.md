---
id: "q59-reverselist-the-three-pointer-classic"
title: "reverseList - THE three-pointer classic"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "3 -> 2 -> 1 -> NULL\n"
---
## At a glance

- **Goal:** reverseList - THE three-pointer classic
- **Pattern:** Linked list
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `3 -> 2 -> 1 -> NULL`

## Description

Reverse a singly linked list in-place.

## Pointer API and ownership

`void reverseList(Node **head)` reverses links and writes the final `prev` address back into the caller's head variable through `*head`. The caller uses `reverseList(&h)`, not an assignment. The nodes are neither allocated nor freed, so ownership stays with the caller; only the route to those nodes and the head address change.

A single-pointer version can correctly return the new head, but then the caller must remember `h = reverseList(h)`. This version teaches the direct head-update contract while the three traversal variables remain ordinary `Node *` values.

`n1`, `n2`, and `n3` are local objects with automatic storage duration. Their addresses may be linked and reversed while `main` is active. They are never freed, and `h` must not escape the function because all three node lifetimes end when `main` returns.

**Walkthrough hint:**

head -> [1] -> [2] -> [3] -> NULL

## Algorithm

```text
step1: Initialize prev = NULL, cur = *head
step2: Loop while cur != NULL:
       - Save next: next = cur->next
       - Flip the link: cur->next = prev
       - Advance prev: prev = cur
       - Advance cur: cur = next
step3: When cur is NULL, prev points to the new head. Store it in *head.
```

## Example Trace

```text
head -> [1] -> [2] -> [3] -> NULL
  prev=NULL, cur=[1]: next=[2], [1]->next=NULL,   prev=[1], cur=[2]
  prev=[1],  cur=[2]: next=[3], [2]->next=[1],    prev=[2], cur=[3]
  prev=[2],  cur=[3]: next=NULL,[3]->next=[2],    prev=[3], cur=NULL
  Store *head=prev=[3]
  Result: head -> [3] -> [2] -> [1] -> NULL
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
    Node n3 = {3, NULL};
    Node n2 = {2, &n3};
    Node n1 = {1, &n2};
    Node *h = &n1;
    reverseList(&h);
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

void reverseList(Node **head) {
    Node *prev = NULL, *cur = *head;
    while (cur != NULL) {
        Node *next = cur->next;    /* save next */
        cur->next  = prev;         /* flip link */
        prev       = cur;          /* advance prev */
        cur        = next;         /* advance cur */
    }
    *head = prev;                  /* update caller's head */
}

int main(void) {
    Node n3 = {3, NULL};
    Node n2 = {2, &n3};
    Node n1 = {1, &n2};
    Node *h = &n1;
    reverseList(&h);
    for (Node*c=h;c;c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    return 0;
}
```
