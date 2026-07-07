#!/usr/bin/env python3
"""Add DSA patterns section questions (q111–q122, minus duplicates) and update index.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"
INDEX = QUESTIONS / "index.json"

HEADER = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
"""

NEW = [
    {
        "id": "q111-climbing-stairs-dp",
        "file": "q111-climbing-stairs-dp.md",
        "title": "Climbing Stairs (DP)",
        "pattern": "dynamic programming",
        "difficulty": "easy",
        "section": "dsa patterns",
        "expectedOutput": "ways(5)=8\\n",
        "description": "Count distinct ways to climb `n` stairs taking 1 or 2 steps at a time. Classic 1-D DP / Fibonacci pattern.",
        "algorithm": """step1: dp[0]=1, dp[1]=1
step2: for i from 2 to n: dp[i] = dp[i-1] + dp[i-2]
step3: return dp[n]""",
        "example": "n=5 → 8 ways (1+1+1+1+1, 2+1+1+1, …)",
        "func": """int climbStairs(int n) {
    if (n <= 1) return 1;
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}""",
        "main": """    printf("ways(5)=%d\\n", climbStairs(5));""",
    },
    {
        "id": "q112-house-robber-dp",
        "file": "q112-house-robber-dp.md",
        "title": "House Robber (DP)",
        "pattern": "dynamic programming",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "maxLoot=12\\n",
        "description": "Max money robbing non-adjacent houses. `dp[i] = max(dp[i-1], nums[i] + dp[i-2])`.",
        "algorithm": """step1: track prev2 and prev1 (best up to i-2 and i-1)
step2: for each house: cur = max(prev1, nums[i] + prev2)
step3: shift window forward""",
        "example": "nums = [2,7,9,3,1] → pick 2+9+1 = 12",
        "func": """int rob(const int nums[], int n) {
    int prev2 = 0, prev1 = 0;
    for (int i = 0; i < n; i++) {
        int cur = prev1 > nums[i] + prev2 ? prev1 : nums[i] + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}""",
        "main": """    int a[] = {2, 7, 9, 3, 1};
    printf("maxLoot=%d\\n", rob(a, 5));""",
    },
    {
        "id": "q113-coin-change-dp",
        "file": "q113-coin-change-dp.md",
        "title": "Coin Change (DP)",
        "pattern": "dynamic programming",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "minCoins(11)=3\\n",
        "description": "Fewest coins to make amount `11` from `{1,2,5}`. Unbounded knapsack DP.",
        "algorithm": """step1: dp[0]=0, dp[1..amount]=INF
step2: for each coin, for a from coin to amount: dp[a] = min(dp[a], dp[a-coin]+1)
step3: return dp[amount] or -1""",
        "example": "amount=11, coins {1,2,5} → 5+5+1 = 3 coins",
        "func": """int coinChange(const int coins[], int n, int amount) {
    int dp[512];
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;
    for (int c = 0; c < n; c++)
        for (int a = coins[c]; a <= amount; a++)
            if (dp[a - coins[c]] + 1 < dp[a]) dp[a] = dp[a - coins[c]] + 1;
    return dp[amount] > amount ? -1 : dp[amount];
}""",
        "main": """    int c[] = {1, 2, 5};
    printf("minCoins(11)=%d\\n", coinChange(c, 3, 11));""",
    },
    {
        "id": "q114-daily-temperatures-monotonic-stack",
        "file": "q114-daily-temperatures-monotonic-stack.md",
        "title": "Daily Temperatures (Monotonic Stack)",
        "pattern": "monotonic stack",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "wait: 1 1 4 2 1 1 0 0\\n",
        "description": "For each day, days until a warmer temperature. Decreasing monotonic stack of indices.",
        "algorithm": """step1: stack holds indices with decreasing temps
step2: while current temp > temp[stack.top]: pop and set answer
step3: push current index""",
        "example": "T = [73,74,75,71,69,72,76,73] → wait [1,1,4,2,1,1,0,0]",
        "func": """void dailyWait(const int T[], int n, int out[]) {
    int st[64], top = -1;
    for (int i = 0; i < n; i++) out[i] = 0;
    for (int i = 0; i < n; i++) {
        while (top >= 0 && T[i] > T[st[top]]) {
            int j = st[top--];
            out[j] = i - j;
        }
        st[++top] = i;
    }
}""",
        "main": """    int T[] = {73, 74, 75, 71, 69, 72, 76, 73};
    int ans[8];
    dailyWait(T, 8, ans);
    printf("wait:");
    for (int i = 0; i < 8; i++) printf(" %d", ans[i]);
    printf("\\n");""",
    },
    {
        "id": "q115-next-greater-element-monotonic-stack",
        "file": "q115-next-greater-element-monotonic-stack.md",
        "title": "Next Greater Element (Monotonic Stack)",
        "pattern": "monotonic stack",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "nge: 4 2 4 8 -1 8\\n",
        "description": "For each element, find the next greater element to the right. Classic monotonic decreasing stack.",
        "algorithm": """step1: scan right to left OR left to right with stack
step2: pop while stack top <= current
step3: answer[i] = stack top or -1; push i""",
        "example": "nums = [2,1,2,4,3] → nge = [3,2,4,-1,-1]",
        "func": """void nextGreater(const int nums[], int n, int out[]) {
    int st[64], top = -1;
    for (int i = n - 1; i >= 0; i--) {
        while (top >= 0 && nums[st[top]] <= nums[i]) top--;
        out[i] = top >= 0 ? nums[st[top]] : -1;
        st[++top] = i;
    }
}""",
        "main": """    int a[] = {2, 1, 2, 4, 3, 8};
    int out[6];
    nextGreater(a, 6, out);
    printf("nge:");
    for (int i = 0; i < 6; i++) printf(" %d", out[i]);
    printf("\\n");""",
    },
    {
        "id": "q116-jump-game-greedy",
        "file": "q116-jump-game-greedy.md",
        "title": "Jump Game (Greedy)",
        "pattern": "greedy",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "canReachEnd=1\\n",
        "description": "Can you reach the last index? Track farthest reachable index in one pass.",
        "algorithm": """step1: farthest = 0
step2: for i while i <= farthest: farthest = max(farthest, i + nums[i])
step3: return farthest >= n-1""",
        "example": "nums = [2,3,1,1,4] → can reach end",
        "func": """int canJump(const int nums[], int n) {
    int farthest = 0;
    for (int i = 0; i <= farthest && i < n; i++)
        if (i + nums[i] > farthest) farthest = i + nums[i];
    return farthest >= n - 1;
}""",
        "main": """    int a[] = {2, 3, 1, 1, 4};
    printf("canReachEnd=%d\\n", canJump(a, 5));""",
    },
    {
        "id": "q117-non-overlapping-intervals-greedy",
        "file": "q117-non-overlapping-intervals-greedy.md",
        "title": "Non-Overlapping Intervals (Greedy)",
        "pattern": "greedy",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "minRemove=1\\n",
        "description": "Minimum intervals to remove so none overlap. Sort by end time, greedily keep earliest-finishing.",
        "algorithm": """step1: sort intervals by end (given sorted in main)
step2: keep track of last end; if start < lastEnd → remove count++
step3: else update lastEnd""",
        "example": "[[1,2],[2,3],[3,4],[1,3]] → remove 1 ([1,3])",
        "typedef": "typedef struct { int s, e; } Interval;\n",
        "func": """int minRemove(Interval iv[], int n) {
    int removed = 0, end = iv[0].e;
    for (int i = 1; i < n; i++) {
        if (iv[i].s < end) removed++;
        else end = iv[i].e;
    }
    return removed;
}""",
        "main": """    Interval iv[] = {{1,2},{2,3},{3,4},{1,3}};
    printf("minRemove=%d\\n", minRemove(iv, 4));""",
    },
    {
        "id": "q118-number-of-islands-dfs",
        "file": "q118-number-of-islands-dfs.md",
        "title": "Number of Islands (DFS)",
        "pattern": "depth-first search",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "islands=3\\n",
        "description": "Count connected `'1'` regions in a binary grid using DFS flood-fill.",
        "algorithm": """step1: for each cell (r,c) if grid[r][c]=='1': islands++, dfs sink the island
step2: dfs marks visited cells as '0'
step3: return island count""",
        "example": "3 islands in classic 4×5 grid",
        "func": """void dfs(char g[][8], int r, int c, int R, int C) {
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
}""",
        "main": """    char g[4][8] = {
        "11100",
        "11000",
        "00011",
        "00001"
    };
    printf("islands=%d\\n", numIslands(g, 4, 5));""",
    },
    {
        "id": "q119-shortest-path-grid-bfs",
        "file": "q119-shortest-path-grid-bfs.md",
        "title": "Shortest Path in Grid (BFS)",
        "pattern": "breadth-first search",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "shortest=5\\n",
        "description": "Shortest path from top-left to bottom-right in a grid with no obstacles (`0` = open). BFS guarantees minimum steps.",
        "algorithm": """step1: BFS queue with (row,col,steps)
step2: mark visited, expand 4 neighbors
step3: return steps when bottom-right reached""",
        "example": "3×3 open grid → 5 steps from corner to corner",
        "func": """int shortestPathGrid(const int g[][8], int R, int C) {
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
}""",
        "main": """    int g[3][8] = {0};
    printf("shortest=%d\\n", shortestPathGrid(g, 3, 3));""",
    },
    {
        "id": "q120-tree-path-sum-dfs",
        "file": "q120-tree-path-sum-dfs.md",
        "title": "Path Sum on Binary Tree (DFS)",
        "pattern": "depth-first search",
        "difficulty": "medium",
        "section": "dsa patterns",
        "visualization": "tree",
        "expectedOutput": "hasPathSum(22)=1\\n",
        "description": "Return whether a root-to-leaf path sums to target. Classic recursive DFS on a binary tree.",
        "algorithm": """step1: if node NULL → false
step2: if leaf and val == remaining → true
step3: recurse left/right with remaining - val""",
        "example": "path 5→4→11→2 = 22 exists",
        "typedef": "typedef struct Node { int val; struct Node *left, *right; } Node;\n",
        "func": """Node *n(int v, Node *l, Node *r) {
    Node *x = (Node *)malloc(sizeof *x);
    x->val = v; x->left = l; x->right = r;
    return x;
}

int hasPathSum(Node *root, int target) {
    if (!root) return 0;
    if (!root->left && !root->right) return root->val == target;
    return hasPathSum(root->left, target - root->val)
        || hasPathSum(root->right, target - root->val);
}""",
        "main": """    Node *root = n(5,
        n(4, n(11, n(7, NULL, NULL), n(2, NULL, NULL)), NULL),
        n(8, n(13, NULL, NULL), n(4, NULL, n(1, NULL, NULL))));
    printf("hasPathSum(22)=%d\\n", hasPathSum(root, 22));""",
    },
    {
        "id": "q122-merge-intervals-greedy",
        "file": "q122-merge-intervals-greedy.md",
        "title": "Merge Intervals (Greedy)",
        "pattern": "greedy",
        "difficulty": "medium",
        "section": "dsa patterns",
        "expectedOutput": "merged: [1,6] [8,10] [15,18]\\n",
        "description": "Merge all overlapping intervals. Sort by start, then greedily extend the current interval or push a new one.",
        "algorithm": """step1: sort intervals by start (given sorted in main)
step2: merged[0] = first interval
step3: if next.start <= cur.end → cur.end = max(cur.end, next.end); else append""",
        "example": "[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]",
        "typedef": "typedef struct { int s, e; } Interval;\n",
        "func": """int mergeIntervals(Interval in[], int n, Interval out[]) {
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
}""",
        "main": """    Interval in[] = {{1,3},{2,6},{8,10},{15,18}};
    Interval out[4];
    int m = mergeIntervals(in, 4, out);
    printf("merged:");
    for (int i = 0; i < m; i++) printf(" [%d,%d]", out[i].s, out[i].e);
    printf("\\n");""",
    },
]


def build_md(q: dict) -> str:
    typedef = q.get("typedef", "")
    viz = q.get("visualization", "generic")
    eo = q["expectedOutput"]
    display = eo.replace("\\n", " ").strip()
    return f"""---
id: "{q['id']}"
title: "{q['title']}"
pattern: "{q['pattern']}"
difficulty: "{q['difficulty']}"
visualization: "{viz}"
vizCategory: "dsa"
stdin: ""
expectedOutput: "{eo}"
---
## At a glance

- **Goal:** {q['title']}
- **Pattern:** {q['pattern'].title()}
- **Expected output:** `{display}`

## Description

{q['description']}

## Algorithm

```text
{q['algorithm']}
```

## Example Trace

```text
{q['example']}
```

## Starter Code

```c
{HEADER}{typedef}/* TODO: implement the helper function(s) your main needs */

int main(void) {{
{q['main']}
    return 0;
}}
```

## Solution

```c
{HEADER}{typedef}{q['func']}

int main(void) {{
{q['main']}
    return 0;
}}
```
"""


def main() -> None:
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    existing = {q["id"] for q in index["questions"]}
    added = 0
    for q in NEW:
        if q["id"] in existing:
            continue
        (QUESTIONS / q["file"]).write_text(build_md(q), encoding="utf-8")
        index["questions"].append(
            {
                "id": q["id"],
                "file": q["file"],
                "title": q["title"],
                "pattern": q["pattern"],
                "difficulty": q["difficulty"],
                "section": q["section"],
            }
        )
        added += 1
        print(f"  + {q['id']}")
    INDEX.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added} DSA questions ({len(index['questions'])} total).")


if __name__ == "__main__":
    main()
