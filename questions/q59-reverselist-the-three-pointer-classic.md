---
id: "q59-reverselist-the-three-pointer-classic"
title: "reverseList - THE three-pointer classic"
pattern: "linked list"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: |
  3 -> 2 -> 1 -> NULL
---

## Description

Reverse a singly linked list in-place.

## Algorithm

```text
step1: Initialize prev = NULL, cur = head
step2: Loop while cur != NULL:
       - Save next: next = cur->next
       - Flip the link: cur->next = prev
       - Advance prev: prev = cur
       - Advance cur: cur = next
step3: When cur is NULL, prev points to the new head. Return prev.
```

## Example Trace

```text
head -> [1] -> [2] -> [3] -> NULL
  prev=NULL, cur=[1]: next=[2], [1]->next=NULL,   prev=[1], cur=[2]
  prev=[1],  cur=[2]: next=[3], [2]->next=[1],    prev=[2], cur=[3]
  prev=[2],  cur=[3]: next=NULL,[3]->next=[2],    prev=[3], cur=NULL
  Return prev=[3]
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
    Node*h=NULL;
    for(int i=3;
    i>=1;
    i--){
    Node*n=malloc(sizeof*n);
    n->id=i;
    n->next=h;
    h=n;
    } h=reverseList(h);
    for(Node*c=h;
    c;
    c=c->next)printf("%d -> ",c->id);
    printf("NULL\n");
    while(h){
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

Node *reverseList(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        Node *next = cur->next;    /* save next */
        cur->next  = prev;         /* flip link */
        prev       = cur;          /* advance prev */
        cur        = next;         /* advance cur */
    }
    return prev;                   /* new head */
}

int main(void) {
    Node*h=NULL; for(int i=3;i>=1;i--){Node*n=malloc(sizeof*n);n->id=i;n->next=h;h=n;} h=reverseList(h); for(Node*c=h;c;c=c->next)printf("%d -> ",c->id); printf("NULL\n"); while(h){Node*t=h->next;free(h);h=t;}
    return 0;
}
```
