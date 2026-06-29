---
id: "q77-ring-buffer-queue"
title: "Ring Buffer Queue"
pattern: "queues"
difficulty: "medium"
visualization: "none"
stdin: ""
complexity: "O(1) enqueue and dequeue; O(capacity) fixed memory."
expectedOutput: |
  ring dequeue=1
  ring peek=2
---

## Description

A FIFO queue backed by a fixed-size array reused in a circle. Indices wrap with modulo, so no memory is allocated per element after creation — ideal for embedded/real-time use.

## Algorithm

```text
struct: data[capacity], front, rear, size
enqueue(x): if full (size==capacity) fail;
            rear=(rear+1)%capacity; data[rear]=x; size++
dequeue() : if empty (size==0) fail;
            x=data[front]; front=(front+1)%capacity; size--; return x
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct{int*data;int capacity,front,rear,size;}RingQ;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    RingQ*q=rqCreate(4);
    rqEnqueue(q,1);
    rqEnqueue(q,2);
    rqEnqueue(q,3);
    int v;
    rqDequeue(q,&v);
    printf("ring dequeue=%d\n",v);
    rqPeek(q,&v);
    printf("ring peek=%d\n",v);
    rqDestroy(q);
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

typedef struct{int*data;int capacity,front,rear,size;}RingQ;

RingQ *rqCreate(int capacity) {
    RingQ *q = (RingQ *)malloc(sizeof(*q));
    if (!q) return NULL;
    q->data = (int *)malloc((size_t)capacity * sizeof(int));
    if (!q->data) { free(q); return NULL; }
    q->capacity = capacity; q->front = 0; q->rear = -1; q->size = 0;
    return q;
}

int rqEnqueue(RingQ *q, int v) {
    if (q->size == q->capacity) return -1;
    q->rear = (q->rear + 1) % q->capacity;
    q->data[q->rear] = v; q->size++; return 0;
}

int rqDequeue(RingQ *q, int *out) {
    if (q->size == 0) return -1;
    *out = q->data[q->front];
    q->front = (q->front + 1) % q->capacity;
    q->size--; return 0;
}

int rqPeek(const RingQ *q, int *out) {
    if (q->size == 0) return -1;
    *out = q->data[q->front]; return 0;
}

void rqDestroy(RingQ *q) { if(q){free(q->data); free(q);} }

int main(void) {
    RingQ*q=rqCreate(4); rqEnqueue(q,1); rqEnqueue(q,2); rqEnqueue(q,3); int v; rqDequeue(q,&v); printf("ring dequeue=%d\n",v); rqPeek(q,&v); printf("ring peek=%d\n",v); rqDestroy(q);
    return 0;
}
```
