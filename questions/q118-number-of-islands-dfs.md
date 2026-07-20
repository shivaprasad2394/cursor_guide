---
id: "q118-number-of-islands-dfs"
title: "Number of Islands (DFS)"
pattern: "depth-first search"
difficulty: "medium"
visualization: "grid-dfs"
vizCategory: "dsa"
stdin: ""
gridRows: 4
gridCols: 5
gridTape: "11100/11000/00011/00001"
expectedOutput: "islands=3\n"
---
## At a glance

- **Goal:** Number of Islands (DFS)
- **Pattern:** Depth-First Search
- **Expected output:** `islands=3`

## Before you start

Read [DFS primer](dsa-guide.html#dfs) — grid version. `'1'` = land, `'0'` = water.

Full guide: [DSA Primer](dsa-guide.html#dfs)

## How to think

Each time you see `'1'`, increment island count, then **sink** the whole connected component by flipping `'1'`→`'0'` via recursive DFS.

## Diagram

```text
Four-direction flood fill from each unvisited land cell.
```

## C walkthrough

```text
step1: Double `for` over every cell
step2: If `g[r][c]=='1'`: count++, call `dfs`
step3: In dfs: bounds check, if not '1' return; set '0'; recurse 4 neighbors
```

## Description

Count connected `'1'` regions in a binary grid using DFS flood-fill.

## Algorithm

```text
step1: for each cell (r,c) if grid[r][c]=='1': islands++, dfs sink the island
step2: dfs marks visited cells as '0'
step3: return island count
```

## Example Trace

```text
3 islands in classic 4×5 grid
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
    char g[4][8] = {
        "11100",
        "11000",
        "00011",
        "00001"
    };
    printf("islands=%d\n", numIslands(g, 4, 5));
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
void dfs(char g[][8], int r, int c, int R, int C) {
    if (r < 0 || c < 0 || r >= R || c >= C || g[r][c] != '1') return;
    g[r][c] = '0';
    dfs(g, r + 1, c, R, C);
    dfs(g, r - 1, c, R, C);
    dfs(g, r, c + 1, R, C);
    dfs(g, r, c - 1, R, C);
}

int numIslands(char g[][8], int R, int C) {
    int count = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (g[r][c] == '1') { dfs(g, r, c, R, C); count++; }
    return count;
}

int main(void) {
    char g[4][8] = {
        "11100",
        "11000",
        "00011",
        "00001"
    };
    printf("islands=%d\n", numIslands(g, 4, 5));
    return 0;
}
```
