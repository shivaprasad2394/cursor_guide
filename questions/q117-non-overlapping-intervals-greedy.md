---
id: "q117-non-overlapping-intervals-greedy"
title: "Non-Overlapping Intervals (Greedy)"
pattern: "greedy"
difficulty: "medium"
visualization: "intervals"
vizCategory: "dsa"
stdin: ""
intervals: "1-2,2-3,3-4,1-3"
intervalMode: "remove"
expectedOutput: "minRemove=1\n"
---
## At a glance

- **Goal:** Non-Overlapping Intervals (Greedy)
- **Pattern:** Greedy
- **Expected output:** `minRemove=1`

## Before you start

Read [Greedy primer](dsa-guide.html#greedy). Intervals `[start, end]` — sort by **end time** first (already sorted in main).

Full guide: [DSA Primer](dsa-guide.html#greedy)

## How to think

Keep the interval that finishes earliest. If next interval starts before current end → overlap → count a removal. Else extend end.

## Diagram

```text
[1,2] [2,3] [3,4] keep all
 [1,3] overlaps → remove 1 interval
```

## C walkthrough

```text
step1: `end = iv[0].e`, `removed = 0`
step2: If `iv[i].s < end` → overlap → `removed++`
step3: Else `end = iv[i].e` — greedy keep
```

## Description

Minimum intervals to remove so none overlap. Sort by end time, greedily keep earliest-finishing.

## Algorithm

```text
step1: sort intervals by end (given sorted in main)
step2: keep track of last end; if start < lastEnd → remove count++
step3: else update lastEnd
```

## Example Trace

```text
[[1,2],[2,3],[3,4],[1,3]] → remove 1 ([1,3])
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
    Interval iv[] = {{1,2},{2,3},{3,4},{1,3}};
    printf("minRemove=%d\n", minRemove(iv, 4));
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
int minRemove(Interval iv[], int n) {
    int removed = 0, end = iv[0].e;
    for (int i = 1; i < n; i++) {
        if (iv[i].s < end) removed++;
        else end = iv[i].e;
    }
    return removed;
}

int main(void) {
    Interval iv[] = {{1,2},{2,3},{3,4},{1,3}};
    printf("minRemove=%d\n", minRemove(iv, 4));
    return 0;
}
```
