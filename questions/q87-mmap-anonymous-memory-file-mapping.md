---
id: "q87-mmap-anonymous-memory-file-mapping"
title: "mmap (anonymous memory + file mapping)"
pattern: "memory, dma, mmap"
difficulty: "hard"
visualization: "none"
stdin: ""
expectedOutput: |
  anonymous map -> "anonymous mmap memory works like an array"
  file map (before) -> "hello mmap file"
  file map (after)  -> "Hello mmap file"
---

## Description

mmap (anonymous memory + file mapping)

## Algorithm

```text
WHAT mmap DOES:
  mmap() asks the kernel to map a region into your process's virtual
  address space. After that you access it with ordinary pointers - no
  read()/write() calls. Two common uses shown here:
    A) ANONYMOUS mapping  - raw memory (like malloc, but page-granular;
       the basis of allocators and shared-memory IPC).
    B) FILE mapping       - the file's bytes appear as an array in memory;
       the kernel pages data in/out on demand (zero-copy file I/O).

KEY APIS:
  mmap(addr, length, prot, flags, fd, offset)
    prot  : PROT_READ | PROT_WRITE | PROT_EXEC
    flags : MAP_SHARED (writes go back to file/other procs)
            MAP_PRIVATE (copy-on-write, changes stay local)
            MAP_ANONYMOUS (no file; just memory)
  msync()  : flush a file mapping's dirty pages back to disk
  munmap() : unmap when done

Algorithm (file mapping):
  step1: open() the file, get a fd
  step2: size it (here we write some bytes first)
  step3: mmap() it into memory with PROT_READ|PROT_WRITE, MAP_SHARED
  step4: read/modify it through the returned pointer like a normal array
  step5: msync() to flush, munmap() to release, close() the fd
```

## Example Trace

```text
map a small file, flip its first char to uppercase via a pointer.
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <ctype.h>

/* TODO: implement the helper function(s) your main needs */

int main(void) {
    /* ---- A) anonymous mapping: raw page-aligned memory, no file ---- */
    size_t n = 4096;                    /* one page */
    char *mem = mmap(NULL, n, PROT_READ | PROT_WRITE,
                     MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);
    if (mem == MAP_FAILED) { perror("mmap anon"); return 1; }
    strcpy(mem, "anonymous mmap memory works like an array");
    printf("anonymous map -> \"%s\"\n", mem);
    munmap(mem, n);

    /* ---- B) file mapping: file bytes appear as a memory array ---- */
    const char *path = "/tmp/mmap_demo.txt";
    int fd = open(path, O_RDWR | O_CREAT | O_TRUNC, 0600);
    if (fd < 0) { perror("open"); return 1; }
    const char *init = "hello mmap file";
    if (write(fd, init, strlen(init)) < 0) { perror("write"); close(fd); return 1; }

    size_t flen = strlen(init);
    char *fmap = mmap(NULL, flen, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (fmap == MAP_FAILED) { perror("mmap file"); close(fd); return 1; }

    printf("file map (before) -> \"%.*s\"\n", (int)flen, fmap);
    fmap[0] = (char)toupper((unsigned char)fmap[0]);   /* edit via pointer */
    msync(fmap, flen, MS_SYNC);          /* flush change back to the file */
    printf("file map (after)  -> \"%.*s\"\n", (int)flen, fmap);

    munmap(fmap, flen);
    close(fd);
    unlink(path);
    return 0;
}
```

## Solution

```c
/* mmap practice: map memory and files directly into the address space
 *
 * WHAT mmap DOES:
 *   mmap() asks the kernel to map a region into your process's virtual
 *   address space. After that you access it with ordinary pointers - no
 *   read()/write() calls. Two common uses shown here:
 *     A) ANONYMOUS mapping  - raw memory (like malloc, but page-granular;
 *        the basis of allocators and shared-memory IPC).
 *     B) FILE mapping       - the file's bytes appear as an array in memory;
 *        the kernel pages data in/out on demand (zero-copy file I/O).
 *
 * KEY APIS:
 *   mmap(addr, length, prot, flags, fd, offset)
 *     prot  : PROT_READ | PROT_WRITE | PROT_EXEC
 *     flags : MAP_SHARED (writes go back to file/other procs)
 *             MAP_PRIVATE (copy-on-write, changes stay local)
 *             MAP_ANONYMOUS (no file; just memory)
 *   msync()  : flush a file mapping's dirty pages back to disk
 *   munmap() : unmap when done
 *
 * Algorithm (file mapping):
 *   step1: open() the file, get a fd
 *   step2: size it (here we write some bytes first)
 *   step3: mmap() it into memory with PROT_READ|PROT_WRITE, MAP_SHARED
 *   step4: read/modify it through the returned pointer like a normal array
 *   step5: msync() to flush, munmap() to release, close() the fd
 *
 * Example: map a small file, flip its first char to uppercase via a pointer.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <ctype.h>

int main(void) {
    /* ---- A) anonymous mapping: raw page-aligned memory, no file ---- */
    size_t n = 4096;                    /* one page */
    char *mem = mmap(NULL, n, PROT_READ | PROT_WRITE,
                     MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);
    if (mem == MAP_FAILED) { perror("mmap anon"); return 1; }
    strcpy(mem, "anonymous mmap memory works like an array");
    printf("anonymous map -> \"%s\"\n", mem);
    munmap(mem, n);

    /* ---- B) file mapping: file bytes appear as a memory array ---- */
    const char *path = "/tmp/mmap_demo.txt";
    int fd = open(path, O_RDWR | O_CREAT | O_TRUNC, 0600);
    if (fd < 0) { perror("open"); return 1; }
    const char *init = "hello mmap file";
    if (write(fd, init, strlen(init)) < 0) { perror("write"); close(fd); return 1; }

    size_t flen = strlen(init);
    char *fmap = mmap(NULL, flen, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (fmap == MAP_FAILED) { perror("mmap file"); close(fd); return 1; }

    printf("file map (before) -> \"%.*s\"\n", (int)flen, fmap);
    fmap[0] = (char)toupper((unsigned char)fmap[0]);   /* edit via pointer */
    msync(fmap, flen, MS_SYNC);          /* flush change back to the file */
    printf("file map (after)  -> \"%.*s\"\n", (int)flen, fmap);

    munmap(fmap, flen);
    close(fd);
    unlink(path);
    return 0;
}
```
