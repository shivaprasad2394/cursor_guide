---
id: "q84-custom-snprintf-bounded-returns-would-be-length"
title: "Custom snprintf (bounded, returns would-be length)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: "my_snprintf -> \"x=42 s=hi\" (returned 9)\ntruncated -> \"1234\" (would-be 6, TRUNCATED)\n"
---

## Description

Custom snprintf (bounded, returns would-be length)

## Algorithm

```text
step1: walk the format string
step2: on '%', read the conversion and emit the argument's text
step3: a helper 'put' writes one char only if room remains, but ALWAYS
       increments the would-be length counter
step4: null-terminate within the buffer; return the total count
```

## Example Trace

```text
my_snprintf(buf,8,"x=%d",42) -> buf="x=42", returns 4
```

## Starter Code

```c
#include <stdio.h>
#include <stdarg.h>
#include <stddef.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    char buf[16];
    int n = my_snprintf(buf, sizeof buf, "x=%d s=%s", 42, "hi");
    printf("my_snprintf -> \"%s\" (returned %d)\n", buf, n);

    char small[5];
    n = my_snprintf(small, sizeof small, "%d", 123456);   /* truncates */
    printf("truncated -> \"%s\" (would-be %d, %s)\n",
           small, n, (size_t)n >= sizeof small ? "TRUNCATED" : "fit");
    return 0;
}
```

## Solution

```c
/* Custom mini-snprintf: format into a bounded buffer, never overflow
 *
 * Supports a useful subset: %d, %s, %c, %% (enough to show the mechanics).
 * Contract like real snprintf:
 *   - writes at most size-1 chars + a '\0'
 *   - returns the number of chars it WOULD have written (so caller can
 *     detect truncation: returned >= size means it was cut off)
 *
 * Algorithm:
 *   step1: walk the format string
 *   step2: on '%', read the conversion and emit the argument's text
 *   step3: a helper 'put' writes one char only if room remains, but ALWAYS
 *          increments the would-be length counter
 *   step4: null-terminate within the buffer; return the total count
 *
 * Example: my_snprintf(buf,8,"x=%d",42) -> buf="x=42", returns 4
 */
#include <stdio.h>
#include <stdarg.h>
#include <stddef.h>

static void put(char *buf, size_t size, size_t *len, char ch) {
    if (*len + 1 < size)               /* leave room for '\0' */
        buf[*len] = ch;
    (*len)++;                          /* count even if not written */
}

static void put_int(char *buf, size_t size, size_t *len, int v) {
    char tmp[16];
    int n = 0;
    unsigned int u;
    if (v < 0) { put(buf, size, len, '-'); u = (unsigned int)(-(long)v); }
    else u = (unsigned int)v;
    if (u == 0) tmp[n++] = '0';
    while (u) { tmp[n++] = (char)('0' + u % 10); u /= 10; }
    while (n--) put(buf, size, len, tmp[n]);   /* digits are reversed */
}

int my_snprintf(char *buf, size_t size, const char *fmt, ...) {
    va_list ap; va_start(ap, fmt);
    size_t len = 0;
    for (const char *p = fmt; *p; p++) {
        if (*p != '%') { put(buf, size, &len, *p); continue; }
        p++;                            /* skip '%' */
        switch (*p) {
            case 'd': put_int(buf, size, &len, va_arg(ap, int)); break;
            case 's': { const char *s = va_arg(ap, const char *);
                        while (*s) put(buf, size, &len, *s++); } break;
            case 'c': put(buf, size, &len, (char)va_arg(ap, int)); break;
            case '%': put(buf, size, &len, '%'); break;
            default:  put(buf, size, &len, '%'); put(buf, size, &len, *p); break;
        }
    }
    if (size > 0) buf[(len < size) ? len : size - 1] = '\0';
    va_end(ap);
    return (int)len;                    /* would-be length */
}

int main(void) {
    char buf[16];
    int n = my_snprintf(buf, sizeof buf, "x=%d s=%s", 42, "hi");
    printf("my_snprintf -> \"%s\" (returned %d)\n", buf, n);

    char small[5];
    n = my_snprintf(small, sizeof small, "%d", 123456);   /* truncates */
    printf("truncated -> \"%s\" (would-be %d, %s)\n",
           small, n, (size_t)n >= sizeof small ? "TRUNCATED" : "fit");
    return 0;
}
```
