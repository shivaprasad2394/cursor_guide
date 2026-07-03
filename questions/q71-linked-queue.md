---
id: "q71-linked-queue"
title: "Linked Queue"
pattern: "queues"
difficulty: "medium"
visualization: "generic"
vizCategory: "queues & stacks"
tape: "dequeue=%d\\n"
stdin: ""
complexity: "O(1) enqueue, dequeue, and peek."
expectedOutput: "dequeue=10\npeek=20\n"
---
## At a glance

- **Goal:** Linked Queue
- **Pattern:** Queues
- **Complexity:** O(1) enqueue, dequeue, and peek.
- **Expected output:** `dequeue=10`

## Description

A FIFO (first-in-first-out) queue built from a linked list. Enqueue adds at the **rear**, dequeue removes from the **front** — both O(1) because we keep pointers to both ends.

## Algorithm

```text
struct: front pointer, rear pointer, size
enqueue(x): make node; if empty, front=rear=node;
            else rear->next=node, rear=node; size++
dequeue() : if empty, fail; take front->id; front=front->next;
            if front becomes NULL, set rear=NULL too; free old; size--
peek()    : return front->id without removing
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct QNode{int id;struct QNode*next;}QNode;
typedef struct{QNode*front,*rear;int size;}Queue;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Queue*q=qCreate();
    qEnqueue(q,10);
    qEnqueue(q,20);
    qEnqueue(q,30);
    int v;
    qDequeue(q,&v);
    printf("dequeue=%d\n",v);
    qPeek(q,&v);
    printf("peek=%d\n",v);
    qDestroy(q);
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

typedef struct QNode{int id;struct QNode*next;}QNode;
typedef struct{QNode*front,*rear;int size;}Queue;

Queue *qCreate(void) {
    Queue *q = (Queue *)malloc(sizeof(*q));
    if (!q) return NULL;
    q->front = q->rear = NULL; q->size = 0;
    return q;
}

int qEnqueue(Queue *q, int id) {
    QNode *n = (QNode *)malloc(sizeof(*n));
    if (!n) return -1;
    n->id = id; n->next = NULL;
    if (q->rear == NULL) q->front = q->rear = n;
    else { q->rear->next = n; q->rear = n; }
    q->size++; return 0;
}

int qDequeue(Queue *q, int *out) {
    if (!q || !q->front) return -1;
    QNode *dead = q->front;
    *out = dead->id;
    q->front = dead->next;
    if (!q->front) q->rear = NULL;  /* TRAP: must reset rear when empty! */
    free(dead); q->size--; return 0;
}

int qPeek(const Queue *q, int *out) {
    if (!q || !q->front) return -1;
    *out = q->front->id; return 0;
}

void qDestroy(Queue *q) {
    if (!q) return;
    while (q->front) { QNode *d = q->front; q->front = d->next; free(d); }
    free(q);
}

int main(void) {
    Queue*q=qCreate(); qEnqueue(q,10); qEnqueue(q,20); qEnqueue(q,30); int v; qDequeue(q,&v); printf("dequeue=%d\n",v); qPeek(q,&v); printf("peek=%d\n",v); qDestroy(q);
    return 0;
}
```
