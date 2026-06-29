---
id: "q86-dma-style-buffer-copy-descriptor-scatter-gather"
title: "DMA-style buffer copy (descriptor + scatter-gather)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: |
  single transfer -> "DMA_PAYLOAD_DATA" (17 bytes)
  scatter-gather -> "GET /index HTTP/1.1" (19 bytes in 3 descriptors)
---

## Description

DMA-style buffer copy (descriptor + scatter-gather)

## Algorithm

```text
WHAT THIS MODELS:
  Real DMA (Direct Memory Access) lets a hardware engine copy a block of
  memory from a source to a destination WITHOUT the CPU copying byte by
  byte. The CPU just programs a "descriptor" (src address, dst address,
  length) and starts the engine. Here we SIMULATE that engine in software
  so it runs on a normal PC, but the structure mirrors a real driver.

THE DESCRIPTOR (what the CPU hands the DMA engine):
  src : where to read from
  dst : where to write to
  len : how many bytes
  done: status flag the "engine" sets when finished

Algorithm (one transfer):
  step1: CPU fills a descriptor (src, dst, len), done = 0
  step2: CPU "starts" the engine (dma_run)
  step3: engine copies len bytes src->dst (memcpy stands in for hardware)
  step4: engine sets done = 1
  step5: CPU polls done, then uses the data

SCATTER-GATHER (the real-world extension):
  One logical transfer can be split across several descriptors chained
  together - e.g. a packet whose header and payload live in different
  buffers. We show a 3-descriptor chain gathering into one output.
```

## Example Trace

```text
gather "GET ", "/index ", "HTTP/1.1" into one contiguous buffer.
```

## Starter Code

```c
#include <stdio.h>
#include <string.h>
#include <stdint.h>
typedef struct {
    const void *src;
    void       *dst;
    size_t      len;
    volatile int done;     /* set by the engine when the copy completes */
} DmaDescriptor;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    /* ---- single block transfer ---- */
    char source[] = "DMA_PAYLOAD_DATA";
    char dest[32] = {0};
    DmaDescriptor d = { source, dest, strlen(source) + 1, 0 };
    dma_run(&d);                        /* start engine */
    while (!d.done) { /* CPU would poll or wait for an IRQ here */ }
    printf("single transfer -> \"%s\" (%zu bytes)\n", dest, d.len);

    /* ---- scatter-gather: 3 descriptors gather into one buffer ---- */
    const char *parts[] = { "GET ", "/index ", "HTTP/1.1" };
    char gathered[64];
    size_t off = 0;
    for (int i = 0; i < 3; i++) {
        DmaDescriptor sg = { parts[i], gathered + off, strlen(parts[i]), 0 };
        dma_run(&sg);
        while (!sg.done) { }
        off += sg.len;                  /* advance the gather cursor */
    }
    gathered[off] = '\0';
    printf("scatter-gather -> \"%s\" (%zu bytes in 3 descriptors)\n",
           gathered, off);
    return 0;
}
```

## Solution

```c
/* DMA-style buffer copy practice (descriptor-driven block transfer)
 *
 * WHAT THIS MODELS:
 *   Real DMA (Direct Memory Access) lets a hardware engine copy a block of
 *   memory from a source to a destination WITHOUT the CPU copying byte by
 *   byte. The CPU just programs a "descriptor" (src address, dst address,
 *   length) and starts the engine. Here we SIMULATE that engine in software
 *   so it runs on a normal PC, but the structure mirrors a real driver.
 *
 * THE DESCRIPTOR (what the CPU hands the DMA engine):
 *   src : where to read from
 *   dst : where to write to
 *   len : how many bytes
 *   done: status flag the "engine" sets when finished
 *
 * Algorithm (one transfer):
 *   step1: CPU fills a descriptor (src, dst, len), done = 0
 *   step2: CPU "starts" the engine (dma_run)
 *   step3: engine copies len bytes src->dst (memcpy stands in for hardware)
 *   step4: engine sets done = 1
 *   step5: CPU polls done, then uses the data
 *
 * SCATTER-GATHER (the real-world extension):
 *   One logical transfer can be split across several descriptors chained
 *   together - e.g. a packet whose header and payload live in different
 *   buffers. We show a 3-descriptor chain gathering into one output.
 *
 * Example: gather "GET ", "/index ", "HTTP/1.1" into one contiguous buffer.
 */
#include <stdio.h>
#include <string.h>
#include <stdint.h>

typedef struct {
    const void *src;
    void       *dst;
    size_t      len;
    volatile int done;     /* set by the engine when the copy completes */
} DmaDescriptor;

/* Simulated DMA engine: performs the block copy the hardware would do. */
static void dma_run(DmaDescriptor *d) {
    memcpy(d->dst, d->src, d->len);    /* stands in for the hardware transfer */
    d->done = 1;                       /* signal completion */
}

int main(void) {
    /* ---- single block transfer ---- */
    char source[] = "DMA_PAYLOAD_DATA";
    char dest[32] = {0};
    DmaDescriptor d = { source, dest, strlen(source) + 1, 0 };
    dma_run(&d);                        /* start engine */
    while (!d.done) { /* CPU would poll or wait for an IRQ here */ }
    printf("single transfer -> \"%s\" (%zu bytes)\n", dest, d.len);

    /* ---- scatter-gather: 3 descriptors gather into one buffer ---- */
    const char *parts[] = { "GET ", "/index ", "HTTP/1.1" };
    char gathered[64];
    size_t off = 0;
    for (int i = 0; i < 3; i++) {
        DmaDescriptor sg = { parts[i], gathered + off, strlen(parts[i]), 0 };
        dma_run(&sg);
        while (!sg.done) { }
        off += sg.len;                  /* advance the gather cursor */
    }
    gathered[off] = '\0';
    printf("scatter-gather -> \"%s\" (%zu bytes in 3 descriptors)\n",
           gathered, off);
    return 0;
}
```
