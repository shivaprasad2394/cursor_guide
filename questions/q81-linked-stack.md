---
id: "q81-linked-stack"
title: "Linked Stack"
pattern: "queues"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(1) push and pop."
expectedOutput: "pop=200\npop=100\n"
---

## Description

A LIFO (last-in-first-out) stack built from a linked list. Both push and pop happen at the **head**, so both are O(1).

## Algorithm

```text
struct: top pointer, size
push(x): make node; node->next=top; top=node; size++
pop()  : if empty fail; x=top->id; old=top; top=top->next;
         free(old); size--; return x
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct SNode{int id;struct SNode*next;}SNode;
typedef struct{SNode*top;int size;}Stack;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Stack s={
    NULL,0};
    sPush(&s,100);
    sPush(&s,200);
    int v;
    sPop(&s,&v);
    printf("pop=%d\n",v);
    sPop(&s,&v);
    printf("pop=%d\n",v);
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

typedef struct SNode{int id;struct SNode*next;}SNode;
typedef struct{SNode*top;int size;}Stack;

int sPush(Stack *s, int id) {
    SNode *n = (SNode *)malloc(sizeof(*n));
    if (!n) return -1;
    n->id = id; n->next = s->top;
    s->top = n; s->size++; return 0;
}

int sPop(Stack *s, int *out) {
    if (!s->top) return -1;
    SNode *dead = s->top;
    *out = dead->id;
    s->top = dead->next;
    free(dead); s->size--; return 0;
}

int main(void) {
    Stack s={NULL,0}; sPush(&s,100); sPush(&s,200); int v; sPop(&s,&v); printf("pop=%d\n",v); sPop(&s,&v); printf("pop=%d\n",v);
    return 0;
}
```
