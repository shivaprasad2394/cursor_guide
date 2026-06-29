---
id: "q75-circular-ring-buffer"
title: "Circular Ring Buffer"
pattern: "buffers"
difficulty: "hard"
visualization: "none"
stdin: ""
complexity: "O(1) put and get. O(CAP) fixed memory, zero allocations after init."
expectedOutput: "put 1 -> ok\nput 2 -> ok\nput 3 -> ok\nput 4 -> ok\nput 5 -> ok\nput 6 -> FULL (rejected)\nput 7 -> FULL (rejected)\nget -> 1\nget -> 2\nput 6 -> ok (wraps to index 0)\nput 7 -> ok\ndrain: 3 4 5 6 7\n"
---

## Description

A fixed-size FIFO queue that reuses one array in a circle — when you reach the end, you wrap back to index 0. Used everywhere in embedded/streaming code (UART buffers, audio, logs).

## Starter Code

```c
#include <stdio.h>
#include <stdbool.h>
#define CAP 5
typedef struct {
    int  buf[CAP];
    int  head;     /* next write index */
    int  tail;     /* next read index  */
    int  count;    /* items currently stored */
} Ring;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Ring r; ring_init(&r);
    int v;

    /* fill past capacity to show FULL rejection */
    for (int i = 1; i <= 7; i++)
        printf("put %d -> %s\n", i, ring_put(&r, i) ? "ok" : "FULL (rejected)");

    /* read two (frees space), then wrap-around writes */
    ring_get(&r, &v); printf("get -> %d\n", v);
    ring_get(&r, &v); printf("get -> %d\n", v);
    printf("put 6 -> %s (wraps to index 0)\n", ring_put(&r, 6) ? "ok" : "FULL");
    printf("put 7 -> %s\n", ring_put(&r, 7) ? "ok" : "FULL");

    /* drain everything */
    printf("drain: ");
    while (ring_get(&r, &v)) printf("%d ", v);
    printf("\n");
    return 0;
}
```

## Solution

```c
/* CIRCULAR RING BUFFER (single-threaded FIFO over a fixed array)
 *
 * Idea: a fixed array reused in a circle. head = where we WRITE next,
 * tail = where we READ next. Both advance modulo capacity and wrap to 0.
 * We track 'count' so we can tell EMPTY (count==0) from FULL (count==cap)
 * - this avoids the "waste one slot" trick and is easy to reason about.
 *
 *   cap = 5
 *   index:  0    1    2    3    4
 *         [ A ][ B ][ C ][   ][   ]
 *           ^tail          ^head     count=3
 *   write D -> head goes 3->4 ; read A -> tail goes 0->1 (wraps at 5)
 */
#include <stdio.h>
#include <stdbool.h>

#define CAP 5

typedef struct {
    int  buf[CAP];
    int  head;     /* next write index */
    int  tail;     /* next read index  */
    int  count;    /* items currently stored */
} Ring;

static void ring_init(Ring *r) { r->head = r->tail = r->count = 0; }
static bool ring_empty(const Ring *r) { return r->count == 0; }
static bool ring_full (const Ring *r) { return r->count == CAP; }

static bool ring_put(Ring *r, int v) {
    if (ring_full(r)) return false;          /* reject when full */
    r->buf[r->head] = v;
    r->head = (r->head + 1) % CAP;           /* advance + wrap */
    r->count++;
    return true;
}

static bool ring_get(Ring *r, int *out) {
    if (ring_empty(r)) return false;         /* nothing to read */
    *out = r->buf[r->tail];
    r->tail = (r->tail + 1) % CAP;           /* advance + wrap */
    r->count--;
    return true;
}

int main(void) {
    Ring r; ring_init(&r);
    int v;

    /* fill past capacity to show FULL rejection */
    for (int i = 1; i <= 7; i++)
        printf("put %d -> %s\n", i, ring_put(&r, i) ? "ok" : "FULL (rejected)");

    /* read two (frees space), then wrap-around writes */
    ring_get(&r, &v); printf("get -> %d\n", v);
    ring_get(&r, &v); printf("get -> %d\n", v);
    printf("put 6 -> %s (wraps to index 0)\n", ring_put(&r, 6) ? "ok" : "FULL");
    printf("put 7 -> %s\n", ring_put(&r, 7) ? "ok" : "FULL");

    /* drain everything */
    printf("drain: ");
    while (ring_get(&r, &v)) printf("%d ", v);
    printf("\n");
    return 0;
}
```
