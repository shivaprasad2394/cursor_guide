---
id: "q61-hascycle-floyd-s-tortoise-and-hare"
title: "hasCycle - Floyd's Tortoise and Hare"
pattern: "linked list"
difficulty: "medium"
visualization: "linked-list"
pointerStyle: "Node ** (borrowed-handle companion)"
nodeStorage: "automatic (caller-owned)"
listNodes: "1,2,3,4,5"
listHighlight: "2"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "hasCycle(linear)=0\n"
---
## At a glance

- **Goal:** hasCycle - Floyd's Tortoise and Hare
- **Pattern:** Linked list
- **Complexity:** O(n) time, O(1) space
- **Expected output:** `hasCycle(linear)=0`

## Description

Implement **hasCycle - Floyd's Tortoise and Hare** using the pattern above. Write the helper function(s); `main()` is provided.

## Pointer API and ownership

Cycle detection itself is read-only, so `int hasCycle(const Node *head)` keeps the semantically correct single-pointer API. Passing `Node **` to `hasCycle` would misleadingly promise that a predicate may replace the caller's head.

To continue the alternating API lesson without corrupting that design, this question pairs the detector with `void clearBorrowedHead(Node **head)`. The caller invokes `clearBorrowedHead(&h)`, and the companion writes `NULL` into the caller's borrowed list handle. It does not destroy nodes or imply ownership.

The chain consists of `n1`, `n2`, and `n3`, which have automatic storage duration until `main` returns. Their addresses are safe to traverse during that scope but must never be freed or retained afterward. Clearing `h` ends this borrowed view while the local node objects remain alive until normal scope exit.

## Algorithm

```text
step1: slow and fast both start at head
step2: slow moves 1 step, fast moves 2 steps
step3: If cycle exists: fast will eventually lap slow (they meet)
       If no cycle: fast hits NULL
step4: clearBorrowedHead(&head) sets the caller's borrowed handle to NULL.
       The automatic-storage nodes are not freed.
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
    printf("hasCycle(linear)=%d\n", hasCycle(h));
    clearBorrowedHead(&h);
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

int hasCycle(const Node *head) {
    const Node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }
    return 0;
}

void clearBorrowedHead(Node **head) {
    if (head != NULL) *head = NULL;
}

int main(void) {
    Node n3 = {3, NULL};
    Node n2 = {2, &n3};
    Node n1 = {1, &n2};
    Node *h = &n1;
    printf("hasCycle(linear)=%d\n", hasCycle(h));
    clearBorrowedHead(&h);
    return 0;
}
```
