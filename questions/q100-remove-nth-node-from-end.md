---
id: "q100-remove-nth-node-from-end"
title: "Remove Nth Node From End of List"
pattern: "linked list (two-pointer / dummy head)"
difficulty: "medium"
visualization: "linked-list"
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

**Walkthrough hint:**

1→2→3→4→5, n=2 → remove 4 → 1→2→3→5

## Algorithm

```text
step1: Dummy node before head; slow = fast = dummy
step2: Advance fast n+1 steps
step3: Move both until fast reaches end
step4: slow->next = slow->next->next (skip target node)
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
    Node *h = NULL;
    for (int i = 5; i >= 1; i--) {
        Node *n=malloc(sizeof*n);
        if (n == NULL) return 1;
        n->id=i;
        n->next=h;
        h=n;
    }
    h = removeNthFromEnd(h, 2);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\n");
    while (h) {
        Node *t = h->next;
        free(h);
        h = t;
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
Node *removeNthFromEnd(Node *head, int n) {
    if (n <= 0) return head;
    Node dummy = {0, head}, *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) {
        if (fast == NULL) return head;
        fast = fast->next;
    }
    while (fast) { slow = slow->next; fast = fast->next; }
    Node *del = slow->next;
    slow->next = del->next;
    free(del);
    return dummy.next;
}

int main(void) {
    Node *h = NULL;
    for (int i = 5; i >= 1; i--) {
        Node *n=malloc(sizeof*n);
        if (n == NULL) return 1;
        n->id=i;
        n->next=h;
        h=n;
    }
    h = removeNthFromEnd(h, 2);
    for (Node *c = h; c; c = c->next) printf("%d -> ", c->id);
    printf("NULL\n");
    while (h) {
        Node *t = h->next;
        free(h);
        h = t;
    }
    return 0;
}
```
