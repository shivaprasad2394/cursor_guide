---
id: "q118-number-of-islands-dfs"
title: "Number of Islands (DFS)"
pattern: "depth-first search"
difficulty: "medium"
visualization: "generic"
vizCategory: "dsa"
stdin: ""
expectedOutput: "islands=3\n"
---
## At a glance

- **Goal:** Number of Islands (DFS)
- **Pattern:** Depth-First Search
- **Expected output:** `islands=3`

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
