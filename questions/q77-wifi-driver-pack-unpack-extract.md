---
id: "q77-wifi-driver-pack-unpack-extract"
title: "WiFi Driver \u2014 Pack / Unpack / Extract"
pattern: "buffers"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "PART A - EXTRACT 802.11 Frame Control = 0x0108\n  Protocol Version: 0\n  Type            : 2\n  Subtype         : 0\n  ToDS            : 1\n  FromDS          : 0\n\nPART B - PACK then UNPACK MAC header\n  packed 24 bytes: 08012C00001122334455AABBCCDDEEFF66778899AABB1000\n  unpacked FC=0x0108 dur=0x002C seq=0x0010\n  addr1 (RA) = 00:11:22:33:44:55\n  addr2 (TA) = AA:BB:CC:DD:EE:FF\n  addr3 (BSSID) = 66:77:88:99:AA:BB\n  round-trip MATCHED\n\nPART C - PACK then UNPACK TLV information elements\n  packed 12 TLV bytes\n  TLV type=0 len=4 value=\"Home\"\n  TLV type=1 len=4 value=\"\u0002\u0004\u000b\u0016\"\n"
---
## At a glance

- **Goal:** WiFi Driver — Pack / Unpack / Extract
- **Pattern:** Buffers
- **Complexity:** See algorithm
- **Expected output:** `PART A - EXTRACT 802.11 Frame Control = 0x0108`

## Description

Drivers constantly convert between *C structs* (easy to work with) and *raw bytes on the wire* (what the hardware sends/receives). Three core skills, shown on real 802.11 WiFi structures.

## Starter Code

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#define FC_GET(fc, shift, bits)  (((fc) >> (shift)) & ((1u << (bits)) - 1u))
typedef struct {
    uint16_t frame_control;
    uint16_t duration;
    uint8_t  addr1[6];
    uint8_t  addr2[6];
    uint8_t  addr3[6];
    uint16_t seq_ctrl;
} MacHeader;
#define MAC_HDR_LEN 24

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    /* ---- PART A: extract bitfields from a Frame Control word ---- */
    /* 0x0108 = data frame (type 2), ToDS=1: typical uplink data frame */
    extract_frame_control(0x0108);

    /* ---- PART B: pack a MAC header, then unpack it back ---- */
    printf("\nPART B - PACK then UNPACK MAC header\n");
    MacHeader tx = {
        .frame_control = 0x0108,
        .duration      = 0x002C,
        .addr1 = {0x00,0x11,0x22,0x33,0x44,0x55},
        .addr2 = {0xAA,0xBB,0xCC,0xDD,0xEE,0xFF},
        .addr3 = {0x66,0x77,0x88,0x99,0xAA,0xBB},
        .seq_ctrl = 0x0010
    };
    uint8_t wire[MAC_HDR_LEN];
    pack_mac_header(&tx, wire);
    printf("  packed %d bytes: ", MAC_HDR_LEN);
    for (int i = 0; i < MAC_HDR_LEN; i++) printf("%02X", wire[i]);
    printf("\n");

    MacHeader rx;
    unpack_mac_header(wire, &rx);
    printf("  unpacked FC=0x%04X dur=0x%04X seq=0x%04X\n",
           rx.frame_control, rx.duration, rx.seq_ctrl);
    printf("  addr1 (RA) = "); print_mac(rx.addr1); printf("\n");
    printf("  addr2 (TA) = "); print_mac(rx.addr2); printf("\n");
    printf("  addr3 (BSSID) = "); print_mac(rx.addr3); printf("\n");
    printf("  round-trip %s\n",
           memcmp(&tx, &rx, sizeof tx) == 0 ? "MATCHED" : "FAILED");

    /* ---- PART C: pack TLV information elements, then unpack ---- */
    printf("\nPART C - PACK then UNPACK TLV information elements\n");
    uint8_t ie[64];
    int off = 0;
    off += pack_tlv(ie + off, 0, (const uint8_t*)"Home",  4);  /* SSID */
    off += pack_tlv(ie + off, 1, (const uint8_t*)"\x02\x04\x0b\x16", 4); /* rates */
    printf("  packed %d TLV bytes\n", off);
    unpack_tlvs(ie, off);

    return 0;
}
```

## Solution

```c
/* WIFI DRIVER: PACK / UNPACK / EXTRACT
 *
 * THREE skills every driver needs, shown on real WiFi-style structures:
 *
 *   PACK    = take fields from C variables and write them into a byte buffer
 *             in a fixed wire layout (serialize, host -> bytes).
 *   UNPACK  = read a byte buffer back into C variables (deserialize, bytes -> host).
 *   EXTRACT = pull a sub-field of bits out of a packed word (bit masking/shift).
 *
 * Endianness matters: 802.11 is LITTLE-ENDIAN on the wire. We pack bytes
 * explicitly (buf[0]=low byte) so the code is portable regardless of the CPU.
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>

/* ----- helpers: explicit little-endian put/get (portable) ----- */
static void put_u16_le(uint8_t *b, uint16_t v) { b[0]=(uint8_t)v; b[1]=(uint8_t)(v>>8); }
static uint16_t get_u16_le(const uint8_t *b)    { return (uint16_t)(b[0] | (b[1]<<8)); }

/* ============================================================
 * PART A: 802.11 Frame Control field - EXTRACT bitfields
 * ------------------------------------------------------------
 * The 16-bit Frame Control word packs many sub-fields:
 *   bits 0-1  : Protocol Version
 *   bits 2-3  : Type        (0=mgmt, 1=ctrl, 2=data)
 *   bits 4-7  : Subtype
 *   bit  8    : ToDS
 *   bit  9    : FromDS
 *   ... (more flags above)
 * EXTRACT = (word >> shift) & mask
 * ============================================================ */
#define FC_GET(fc, shift, bits)  (((fc) >> (shift)) & ((1u << (bits)) - 1u))

static void extract_frame_control(uint16_t fc) {
    printf("PART A - EXTRACT 802.11 Frame Control = 0x%04X\n", fc);
    printf("  Protocol Version: %u\n", FC_GET(fc, 0, 2));
    printf("  Type            : %u\n", FC_GET(fc, 2, 2));
    printf("  Subtype         : %u\n", FC_GET(fc, 4, 4));
    printf("  ToDS            : %u\n", FC_GET(fc, 8, 1));
    printf("  FromDS          : %u\n", FC_GET(fc, 9, 1));
}

/* ============================================================
 * PART B: 802.11 MAC header - PACK and UNPACK
 * ------------------------------------------------------------
 * Simplified MAC header layout (24 bytes):
 *   off 0 : frame_control (2 bytes, LE)
 *   off 2 : duration      (2 bytes, LE)
 *   off 4 : addr1 (6 bytes)  - receiver MAC
 *   off 10: addr2 (6 bytes)  - transmitter MAC
 *   off 16: addr3 (6 bytes)  - BSSID
 *   off 22: seq_ctrl (2 bytes, LE)
 * ============================================================ */
typedef struct {
    uint16_t frame_control;
    uint16_t duration;
    uint8_t  addr1[6];
    uint8_t  addr2[6];
    uint8_t  addr3[6];
    uint16_t seq_ctrl;
} MacHeader;

#define MAC_HDR_LEN 24

static void pack_mac_header(const MacHeader *h, uint8_t *buf) {
    put_u16_le(buf + 0,  h->frame_control);
    put_u16_le(buf + 2,  h->duration);
    memcpy(buf + 4,  h->addr1, 6);
    memcpy(buf + 10, h->addr2, 6);
    memcpy(buf + 16, h->addr3, 6);
    put_u16_le(buf + 22, h->seq_ctrl);
}

static void unpack_mac_header(const uint8_t *buf, MacHeader *h) {
    h->frame_control = get_u16_le(buf + 0);
    h->duration      = get_u16_le(buf + 2);
    memcpy(h->addr1, buf + 4,  6);
    memcpy(h->addr2, buf + 10, 6);
    memcpy(h->addr3, buf + 16, 6);
    h->seq_ctrl      = get_u16_le(buf + 22);
}

static void print_mac(const uint8_t *m) {
    printf("%02X:%02X:%02X:%02X:%02X:%02X", m[0],m[1],m[2],m[3],m[4],m[5]);
}

/* ============================================================
 * PART C: TLV (Type-Length-Value) - PACK and UNPACK
 * ------------------------------------------------------------
 * WiFi management frames carry "information elements" as TLVs:
 *   [type:1][len:1][value:len bytes] ... repeated
 * e.g. SSID element: type=0, len=4, value="Home"
 * ============================================================ */
static int pack_tlv(uint8_t *buf, uint8_t type, const uint8_t *val, uint8_t len) {
    buf[0] = type;
    buf[1] = len;
    memcpy(buf + 2, val, len);
    return 2 + len;                  /* total bytes written */
}

static void unpack_tlvs(const uint8_t *buf, int total) {
    int off = 0;
    while (off + 2 <= total) {
        uint8_t type = buf[off];
        uint8_t len  = buf[off + 1];
        if (off + 2 + len > total) break;       /* malformed guard */
        printf("  TLV type=%u len=%u value=\"", type, len);
        for (int i = 0; i < len; i++) putchar(buf[off + 2 + i]);
        printf("\"\n");
        off += 2 + len;
    }
}

int main(void) {
    /* ---- PART A: extract bitfields from a Frame Control word ---- */
    /* 0x0108 = data frame (type 2), ToDS=1: typical uplink data frame */
    extract_frame_control(0x0108);

    /* ---- PART B: pack a MAC header, then unpack it back ---- */
    printf("\nPART B - PACK then UNPACK MAC header\n");
    MacHeader tx = {
        .frame_control = 0x0108,
        .duration      = 0x002C,
        .addr1 = {0x00,0x11,0x22,0x33,0x44,0x55},
        .addr2 = {0xAA,0xBB,0xCC,0xDD,0xEE,0xFF},
        .addr3 = {0x66,0x77,0x88,0x99,0xAA,0xBB},
        .seq_ctrl = 0x0010
    };
    uint8_t wire[MAC_HDR_LEN];
    pack_mac_header(&tx, wire);
    printf("  packed %d bytes: ", MAC_HDR_LEN);
    for (int i = 0; i < MAC_HDR_LEN; i++) printf("%02X", wire[i]);
    printf("\n");

    MacHeader rx;
    unpack_mac_header(wire, &rx);
    printf("  unpacked FC=0x%04X dur=0x%04X seq=0x%04X\n",
           rx.frame_control, rx.duration, rx.seq_ctrl);
    printf("  addr1 (RA) = "); print_mac(rx.addr1); printf("\n");
    printf("  addr2 (TA) = "); print_mac(rx.addr2); printf("\n");
    printf("  addr3 (BSSID) = "); print_mac(rx.addr3); printf("\n");
    printf("  round-trip %s\n",
           memcmp(&tx, &rx, sizeof tx) == 0 ? "MATCHED" : "FAILED");

    /* ---- PART C: pack TLV information elements, then unpack ---- */
    printf("\nPART C - PACK then UNPACK TLV information elements\n");
    uint8_t ie[64];
    int off = 0;
    off += pack_tlv(ie + off, 0, (const uint8_t*)"Home",  4);  /* SSID */
    off += pack_tlv(ie + off, 1, (const uint8_t*)"\x02\x04\x0b\x16", 4); /* rates */
    printf("  packed %d TLV bytes\n", off);
    unpack_tlvs(ie, off);

    return 0;
}
```
