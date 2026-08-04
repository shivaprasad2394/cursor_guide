---
id: "q100-remove-nth-node-from-end"
title: "Remove Nth Node From End of List"
pattern: "linked list (two-pointer / dummy head)"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node **"
nodeStorage: "automatic (caller-owned)"
vizCategory: "linked list"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "1 -> 2 -> 3 -> 5 -> NULL\n"
---
## At a glance

- **Goal:** Remove Nth Node From End of List
- **Pattern:** Linked list (two-pointer / dummy head)
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `1 -> 2 -> 3 -> 5 -> NULL`

## Description

Remove the nth node from the end of a singly linked list in one pass (fast/slow gap trick).

## Pointer API and ownership

`Node *removeNthFromEnd(Node **head, int n)` may detach the first node when `n` equals the list length, so it receives the address of the caller's head. The caller writes `Node *removed = removeNthFromEnd(&h, 2)`. The function stores `dummy.next` through `*head` and returns the detached node.

A `Node *` return-new-head form is also valid, but this question alternates to the direct mutation contract. The dummy node keeps head and interior deletion on one path while `Node **` ensures the resulting head reaches the caller.

The five nodes are local objects in `main`, linked by their addresses. The function borrows and unlinks them; it clears `removed->next` but never calls `free`. `removed` remains valid only until `main` returns. This is the automatic-storage counterpart to heap deletion: unlinking and deallocation are separate operations.

**Walkthrough hint:**

1→2→3→4→5, n=2 → remove 4 → 1→2→3→5

## Algorithm

```text
step1: Dummy node before head; slow = fast = dummy
step2: Advance fast n+1 steps
step3: Move both until fast reaches end
step4: Save and unlink slow->next, then clear the detached node's next link
step5: Store dummy.next in *head so the caller sees a changed head
step6: Return the borrowed detached node; do not free automatic storage
```

## Example Trace

```text
list 1→2→3→4→5, n=2
  gap of 2: slow stops before node 4 → remove 4
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
    Node n5 = {5, NULL};
    Node n4 = {4, &n5};
    Node n3 = {3, &n4};
    Node n2 = {2, &n3};
    Node n1 = {1, &n2};
    Node *h = &n1;
    Node *removed = removeNthFromEnd(&h, 2);
    (void)removed;
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
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
Node *removeNthFromEnd(Node **head, int n) {
    if (head == NULL || n <= 0) return NULL;
    Node dummy = {0, *head}, *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) {
        if (fast == NULL) return NULL;
        fast = fast->next;
    }
    while (fast) { slow = slow->next; fast = fast->next; }
    Node *removed = slow->next;
    slow->next = removed->next;
    removed->next = NULL;
    *head = dummy.next;
    return removed;
}

int main(void) {
    Node n5 = {5, NULL};
    Node n4 = {4, &n5};
    Node n3 = {3, &n4};
    Node n2 = {2, &n3};
    Node n1 = {1, &n2};
    Node *h = &n1;
    Node *removed = removeNthFromEnd(&h, 2);
    (void)removed;
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\n");
    return 0;
}
```
