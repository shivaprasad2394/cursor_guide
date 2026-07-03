---
id: "q76-dma-descriptor-ring-nic-hardware-driver-style"
title: "DMA Descriptor Ring (NIC / hardware-driver style)"
pattern: "buffers"
difficulty: "hard"
visualization: "generic"
vizCategory: "buffers & driver patterns"
tape: "PKT-alpha"
stdin: ""
expectedOutput: "[nic] wrote 9 bytes into slot 0, OWN->SW\n[drv] slot 0 received \"PKT-alpha\" (9 bytes)\n  [nic] wrote 9 bytes into slot 1, OWN->SW\n[drv] slot 1 received \"PKT-bravo\" (9 bytes)\n  [nic] wrote 11 bytes into slot 2, OWN->SW\n[drv] slot 2 received \"PKT-charlie\" (11 bytes)\n  [nic] wrote 9 bytes into slot 3, OWN->SW\n[drv] slot 3 received \"PKT-delta\" (9 bytes)\n  [nic] wrote 8 bytes into slot 0, OWN->SW\n[drv] slot 0 received \"PKT-echo\" (8 bytes)\nProcessed 5 packets through a 4-slot descriptor ring.\n"
---
## At a glance

- **Goal:** DMA Descriptor Ring (NIC / hardware-driver style)
- **Pattern:** Buffers
- **Complexity:** See algorithm
- **Expected output:** `[nic] wrote 9 bytes into slot 0, OWN->SW`

## Description

How a network card (NIC) and its driver exchange packets without locking, using a ring of *descriptors* in shared memory. This is the real-world structure behind every Ethernet/WiFi driver.

## Starter Code

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#define RING_SIZE 4
#define BUF_SIZE  64
enum { OWN_SW = 0, OWN_HW = 1 };
typedef struct {
    uint8_t *addr;     /* DMA buffer this descriptor points at */
    uint16_t len;      /* bytes the NIC wrote (valid when OWN=SW) */
    uint8_t  own;      /* OWN_HW or OWN_SW */
} Descriptor;

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    rx_ring_init();
    int tail = 0;   /* driver's read cursor, like a ring-buffer tail */

    const char *packets[] = {"PKT-alpha", "PKT-bravo", "PKT-charlie",
                             "PKT-delta", "PKT-echo"};
    int np = (int)(sizeof(packets)/sizeof(packets[0]));

    for (int p = 0; p < np; p++) {
        /* NIC fills the slot at the hardware's current position (we mirror tail) */
        nic_receive(tail % RING_SIZE, packets[p]);

        /* Driver polls: is the slot at 'tail' now owned by SW? */
        Descriptor *d = &ring[tail % RING_SIZE];
        if (d->own == OWN_SW) {
            char tmp[BUF_SIZE + 1];
            memcpy(tmp, d->addr, d->len);
            tmp[d->len] = '\0';
            printf("[drv] slot %d received \"%s\" (%u bytes)\n",
                   tail % RING_SIZE, tmp, d->len);
            d->own = OWN_HW;            /* RE-ARM: give slot back to NIC */
            tail++;                     /* advance; wraps via % RING_SIZE */
        }
    }
    printf("Processed %d packets through a %d-slot descriptor ring.\n", np, RING_SIZE);
    return 0;
}
```

## Solution

```c
/* DMA DESCRIPTOR RING (NIC / hardware-driver style)
 *
 * HOW TO THINK ABOUT IT (building on what you know):
 *   - An SLL links nodes with pointers; you walk node->next.
 *   - A ring buffer is a fixed array reused in a circle (head/tail wrap).
 *   - A DMA DESCRIPTOR RING is a ring buffer whose elements are not plain
 *     data, but DESCRIPTORS: small structs that tell the hardware WHERE a
 *     packet buffer lives (address + length) and WHO owns the slot right now.
 *
 * THE OWNERSHIP IDEA (the heart of it):
 *   Each descriptor has an OWN bit:
 *       OWN = HW  -> the NIC owns this slot (driver must NOT touch it)
 *       OWN = SW  -> the driver (software) owns it (safe to read/recycle)
 *   This bit is how CPU and hardware share the ring without a lock - it is a
 *   single-producer/single-consumer handoff, exactly like a ring buffer's
 *   head/tail, but the "head/tail" is encoded per-slot by the OWN bit.
 *
 * RX FLOW (receive):
 *   1. Driver sets up N descriptors, each pointing at an empty buffer, OWN=HW.
 *   2. NIC receives a packet, DMA-copies it into the buffer at 'tail',
 *      writes the length, flips OWN=SW, advances its internal index.
 *   3. Driver walks slots with OWN=SW, processes the packet, then RE-ARMS the
 *      slot (OWN=HW) so the NIC can reuse it. Index wraps modulo ring size.
 *
 * We simulate the NIC in software here so it runs on a normal PC.
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define RING_SIZE 4
#define BUF_SIZE  64

enum { OWN_SW = 0, OWN_HW = 1 };

typedef struct {
    uint8_t *addr;     /* DMA buffer this descriptor points at */
    uint16_t len;      /* bytes the NIC wrote (valid when OWN=SW) */
    uint8_t  own;      /* OWN_HW or OWN_SW */
} Descriptor;

static Descriptor ring[RING_SIZE];
static uint8_t    buffers[RING_SIZE][BUF_SIZE];

/* Driver: build the ring, hand every slot to HW */
static void rx_ring_init(void) {
    for (int i = 0; i < RING_SIZE; i++) {
        ring[i].addr = buffers[i];
        ring[i].len  = 0;
        ring[i].own  = OWN_HW;       /* armed: NIC may fill it */
    }
}

/* Simulated NIC: deliver a packet into the slot it currently owns. */
static void nic_receive(int slot, const char *packet) {
    if (ring[slot].own != OWN_HW) { printf("  [nic] slot %d not mine\n", slot); return; }
    uint16_t n = (uint16_t)strlen(packet);
    if (n > BUF_SIZE) n = BUF_SIZE;
    memcpy(ring[slot].addr, packet, n);   /* DMA copy */
    ring[slot].len = n;
    ring[slot].own = OWN_SW;              /* hand back to driver */
    printf("  [nic] wrote %u bytes into slot %d, OWN->SW\n", n, slot);
}

int main(void) {
    rx_ring_init();
    int tail = 0;   /* driver's read cursor, like a ring-buffer tail */

    const char *packets[] = {"PKT-alpha", "PKT-bravo", "PKT-charlie",
                             "PKT-delta", "PKT-echo"};
    int np = (int)(sizeof(packets)/sizeof(packets[0]));

    for (int p = 0; p < np; p++) {
        /* NIC fills the slot at the hardware's current position (we mirror tail) */
        nic_receive(tail % RING_SIZE, packets[p]);

        /* Driver polls: is the slot at 'tail' now owned by SW? */
        Descriptor *d = &ring[tail % RING_SIZE];
        if (d->own == OWN_SW) {
            char tmp[BUF_SIZE + 1];
            memcpy(tmp, d->addr, d->len);
            tmp[d->len] = '\0';
            printf("[drv] slot %d received \"%s\" (%u bytes)\n",
                   tail % RING_SIZE, tmp, d->len);
            d->own = OWN_HW;            /* RE-ARM: give slot back to NIC */
            tail++;                     /* advance; wraps via % RING_SIZE */
        }
    }
    printf("Processed %d packets through a %d-slot descriptor ring.\n", np, RING_SIZE);
    return 0;
}
```
