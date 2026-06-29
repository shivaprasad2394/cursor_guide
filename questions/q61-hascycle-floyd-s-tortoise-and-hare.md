---
id: "q61-hascycle-floyd-s-tortoise-and-hare"
title: "hasCycle - Floyd's Tortoise and Hare"
pattern: "linked list"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(n) time, O(1) space"
expectedOutput: "hasCycle(linear)=0\n"
---

## Description

hasCycle - Floyd's Tortoise and Hare

## Algorithm

```text
step1: slow and fast both start at head
step2: slow moves 1 step, fast moves 2 steps
step3: If cycle exists: fast will eventually lap slow (they meet)
       If no cycle: fast hits NULL
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
    } printf("hasCycle(linear)=%d\n", hasCycle(h));
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

int hasCycle(const Node *head) {
    const Node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }
    return 0;
}

int main(void) {
    Node*h=NULL; for(int i=3;i>=1;i--){Node*n=malloc(sizeof*n);n->id=i;n->next=h;h=n;} printf("hasCycle(linear)=%d\n", hasCycle(h)); while(h){Node*t=h->next;free(h);h=t;}
    return 0;
}
```
