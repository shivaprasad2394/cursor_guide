---
id: "q122-merge-intervals-greedy"
title: "Merge Intervals (Greedy)"
pattern: "greedy"
difficulty: "medium"
visualization: "intervals"
vizCategory: "dsa"
stdin: ""
intervals: "1-3,2-6,8-10,15-18"
intervalMode: "merge"
expectedOutput: "merged: [1,6] [8,10] [15,18]\n"
---
## At a glance

- **Goal:** Merge Intervals (Greedy)
- **Pattern:** Greedy
- **Expected output:** `merged: [1,6] [8,10] [15,18]`

## Before you start

Read [Greedy primer](dsa-guide.html#greedy). Sort by start (sorted in main). Merge overlapping intervals into one.

Full guide: [DSA Primer](dsa-guide.html#greedy)

## How to think

If next interval starts inside current merged interval, extend the end. Otherwise start a new merged interval.

## Diagram

```text
[1,3]+[2,6] → [1,6]  then separate [8,10] [15,18]
```

## C walkthrough

```text
step1: Copy first interval to output
step2: If overlap: `out.end = max(out.end, in.end)`
step3: Else append new interval to output
```

## Description

Merge all overlapping intervals. Sort by start, then greedily extend the current interval or push a new one.

## Algorithm

```text
step1: sort intervals by start (given sorted in main)
step2: merged[0] = first interval
step3: if next.start <= cur.end → cur.end = max(cur.end, next.end); else append
```

## Example Trace

```text
[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
typedef struct { int s, e; } Interval;
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    Interval in[] = {{1,3},{2,6},{8,10},{15,18}};
    Interval out[4];
    int m = mergeIntervals(in, 4, out);
    printf("merged:");
    for (int i = 0; i < m; i++) printf(" [%d,%d]", out[i].s, out[i].e);
    printf("\n");
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
typedef struct { int s, e; } Interval;
int mergeIntervals(Interval in[], int n, Interval out[]) {
    if (n == 0) return 0;
    out[0] = in[0];
    int m = 1;
    for (int i = 1; i < n; i++) {
        if (in[i].s <= out[m - 1].e) {
            if (in[i].e > out[m - 1].e) out[m - 1].e = in[i].e;
        } else {
            out[m++] = in[i];
        }
    }
    return m;
}

int main(void) {
    Interval in[] = {{1,3},{2,6},{8,10},{15,18}};
    Interval out[4];
    int m = mergeIntervals(in, 4, out);
    printf("merged:");
    for (int i = 0; i < m; i++) printf(" [%d,%d]", out[i].s, out[i].e);
    printf("\n");
    return 0;
}
```
