---
id: "q119-shortest-path-grid-bfs"
title: "Shortest Path in Grid (BFS)"
pattern: "breadth-first search"
difficulty: "medium"
visualization: "grid-bfs"
vizCategory: "dsa"
stdin: ""
gridRows: 3
gridCols: 3
expectedOutput: "shortest=5\n"
---
## At a glance

- **Goal:** Shortest Path in Grid (BFS)
- **Pattern:** Breadth-First Search
- **Expected output:** `shortest=5`

## Description

Shortest path from top-left to bottom-right in a grid with no obstacles (`0` = open). BFS guarantees minimum steps.

## Algorithm

```text
step1: BFS queue with (row,col,steps)
step2: mark visited, expand 4 neighbors
step3: return steps when bottom-right reached
```

## Example Trace

```text
3×3 open grid → 5 steps from corner to corner
```

## Starter Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
/* TODO: implement the helper function(s) your main needs */

int main(void) {
    int g[3][8] = {0};
    printf("shortest=%d\n", shortestPathGrid(g, 3, 3));
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
int shortestPathGrid(const int g[][8], int R, int C) {
    int q[512][3], head = 0, tail = 0;
    int vis[16][8] = {0};
    q[tail][0] = 0; q[tail][1] = 0; q[tail++][2] = 1;
    vis[0][0] = 1;
    int dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1};
    while (head < tail) {
        int r = q[head][0], c = q[head][1], d = q[head][2]; head++;
        if (r == R - 1 && c == C - 1) return d;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] || vis[nr][nc]) continue;
            vis[nr][nc] = 1;
            q[tail][0] = nr; q[tail][1] = nc; q[tail++][2] = d + 1;
        }
    }
    return -1;
}

int main(void) {
    int g[3][8] = {0};
    printf("shortest=%d\n", shortestPathGrid(g, 3, 3));
    return 0;
}
```
