#!/usr/bin/env python3
"""Add beginner-friendly learning sections to DSA pattern questions."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"

ENRICHMENTS = {
    "q111-climbing-stairs-dp.md": {
        "visualization": "dp-stairs",
        "vizN": 5,
        "guide": "#dp",
        "before": "Read [DP primer](dsa-guide.html#dp) first. You only need a `for` loop and two integers — no pointer tricks.",
        "think": "Ask: \"How many ways to reach stair `i`?\" You can arrive from `i-1` (one step) or `i-2` (two steps). So `ways(i) = ways(i-1) + ways(i-2)` — same as Fibonacci.",
        "diagram": "Stair 5: ways = ways(4)+ways(3)\n dp: [1, 1, 2, 3, 5, 8]",
        "walk": "step1: `int a=1, b=1` — ways for stair 0 and 1\nstep2: Loop `i` from 2 to n: `c = a+b`, then shift `a=b`, `b=c`\nstep3: Return `b` — ways to reach stair n",
    },
    "q112-house-robber-dp.md": {
        "visualization": "dp-robber",
        "tape": "2,7,9,3,1",
        "guide": "#dp",
        "before": "Read [DP primer](dsa-guide.html#dp). Each house has money; you **cannot rob two neighbors**.",
        "think": "At house `i`, either **rob it** (money[i] + best up to i-2) or **skip it** (best up to i-1). Track two running totals — no full array required in C.",
        "diagram": "Houses: $2  $7  $9  $3  $1\nPick:   ✓      ✗   ✓      ✗   ✓  → total $12",
        "walk": "step1: `prev2=0`, `prev1=0` — best loot ending two back / one back\nstep2: `cur = max(prev1, nums[i]+prev2)` — rob or skip\nstep3: Shift window: `prev2=prev1`, `prev1=cur`",
    },
    "q113-coin-change-dp.md": {
        "visualization": "dp-coin",
        "tape": "1,2,5",
        "vizAmount": 11,
        "guide": "#dp",
        "before": "Read [DP primer](dsa-guide.html#dp). Classic \"unbounded knapsack\" — each coin can be used many times.",
        "think": "`dp[amount]` = minimum coins to make that amount. Try every coin: `dp[a] = min(dp[a], dp[a-coin]+1)`. Fill from small amounts up to 11.",
        "diagram": "Coins {1,2,5}  target 11\n dp[11]=3  because 5+5+1",
        "walk": "step1: Fill `dp[0..amount]` with a big number; `dp[0]=0`\nstep2: Double loop: each coin, each amount from coin to target\nstep3: If `dp[a-coin]+1` is smaller, update `dp[a]`",
    },
    "q116-jump-game-greedy.md": {
        "visualization": "jump-game",
        "tape": "2,3,1,1,4",
        "guide": "#greedy",
        "before": "Read [Greedy primer](dsa-guide.html#greedy). One pass, one variable — easiest DSA question to start with.",
        "think": "From index `i` you can jump up to `nums[i]` steps. Track **farthest** index reachable. If `farthest` ever passes the last index, answer is yes.",
        "diagram": "Index: 0  1  2  3  4\nnums:  2  3  1  1  4\nfarthest grows: 2 → 4 → … → past end",
        "walk": "step1: `farthest = 0`\nstep2: Loop while `i <= farthest` — if `i + nums[i] > farthest`, update farthest\nstep3: Return `farthest >= n-1`",
    },
    "q120-tree-path-sum-dfs.md": {
        "visualization": "tree-path",
        "vizTarget": 22,
        "guide": "#dfs",
        "before": "Read [DFS primer](dsa-guide.html#dfs). A tree is just nodes with `left` and `right` pointers — DFS means recurse into children.",
        "think": "Pass down **remaining sum**. At each node subtract `val`. At a **leaf**, check if remaining is 0. Recurse left OR right — either path working means yes.",
        "diagram": "        5\n       / \\\n      4   8\n     /   / \\\n   11  13  4\n  / \\       \\\n 7   2       1\nPath 5→4→11→2 = 22",
        "walk": "step1: `if (!root) return 0` — empty tree fails\nstep2: Leaf check: no children → `return val == target`\nstep3: Recurse: `hasPathSum(left, target-val) || hasPathSum(right, target-val)`",
    },
    "q114-daily-temperatures-monotonic-stack.md": {
        "guide": "#stack",
        "before": "Read [Monotonic stack primer](dsa-guide.html#stack). Stack stores **indices** where temperatures are decreasing.",
        "think": "Scan left to right. While today is warmer than stack top, pop and set `wait[popped] = i - popped`. Push current index.",
        "diagram": "Warmer day resolves \"how many days until warmer\" for past colder days sitting in the stack.",
        "walk": "step1: Stack array + `top = -1`\nstep2: While stack not empty and T[i] > T[stack[top]]: pop, set answer\nstep3: Push i onto stack",
    },
    "q115-next-greater-element-monotonic-stack.md": {
        "guide": "#stack",
        "before": "Read [Monotonic stack primer](dsa-guide.html#stack). Scan **right to left** for this variant.",
        "think": "Stack holds indices with increasing values from bottom to top. For each i, pop smaller values; stack top (if any) is next greater.",
        "diagram": "Array: 2 1 2 4 3 8\n nge:  4 2 4 8 -1 8",
        "walk": "step1: Loop i from n-1 down to 0\nstep2: Pop while stack top value <= nums[i]\nstep3: out[i] = stack empty ? -1 : nums[stack[top]]; push i",
    },
    "q117-non-overlapping-intervals-greedy.md": {
        "guide": "#greedy",
        "before": "Read [Greedy primer](dsa-guide.html#greedy). Intervals `[start, end]` — sort by **end time** first (already sorted in main).",
        "think": "Keep the interval that finishes earliest. If next interval starts before current end → overlap → count a removal. Else extend end.",
        "diagram": "[1,2] [2,3] [3,4] keep all\n [1,3] overlaps → remove 1 interval",
        "walk": "step1: `end = iv[0].e`, `removed = 0`\nstep2: If `iv[i].s < end` → overlap → `removed++`\nstep3: Else `end = iv[i].e` — greedy keep",
    },
    "q118-number-of-islands-dfs.md": {
        "guide": "#dfs",
        "before": "Read [DFS primer](dsa-guide.html#dfs) — grid version. `'1'` = land, `'0'` = water.",
        "think": "Each time you see `'1'`, increment island count, then **sink** the whole connected component by flipping `'1'`→`'0'` via recursive DFS.",
        "diagram": "Four-direction flood fill from each unvisited land cell.",
        "walk": "step1: Double `for` over every cell\nstep2: If `g[r][c]=='1'`: count++, call `dfs`\nstep3: In dfs: bounds check, if not '1' return; set '0'; recurse 4 neighbors",
    },
    "q119-shortest-path-grid-bfs.md": {
        "guide": "#bfs",
        "before": "Read [BFS primer](dsa-guide.html#bfs). Empty grid — count steps from top-left to bottom-right.",
        "think": "BFS explores in order of distance. First time you dequeue the goal cell, you have the **minimum** steps. Use a queue + `vis` array.",
        "diagram": "Queue expands in rings: dist 1, then 2, then 3…",
        "walk": "step1: Enqueue (0,0) with dist=1, mark visited\nstep2: Dequeue front; if at goal return dist\nstep3: Enqueue unvisited open neighbors with dist+1",
    },
    "q122-merge-intervals-greedy.md": {
        "guide": "#greedy",
        "before": "Read [Greedy primer](dsa-guide.html#greedy). Sort by start (sorted in main). Merge overlapping intervals into one.",
        "think": "If next interval starts inside current merged interval, extend the end. Otherwise start a new merged interval.",
        "diagram": "[1,3]+[2,6] → [1,6]  then separate [8,10] [15,18]",
        "walk": "step1: Copy first interval to output\nstep2: If overlap: `out.end = max(out.end, in.end)`\nstep3: Else append new interval to output",
    },
}


def patch_frontmatter(fm: str, data: dict) -> str:
    if "visualization" in data:
        fm = re.sub(r'^visualization:.*$', f'visualization: "{data["visualization"]}"', fm, flags=re.M)
    for key in ("vizN", "vizAmount", "vizTarget", "tape"):
        if key in data:
            if re.search(rf"^{key}:", fm, re.M):
                fm = re.sub(rf"^{key}:.*$", f"{key}: {data[key]}", fm, flags=re.M)
            else:
                fm = fm.rstrip() + f"\n{key}: {data[key]}"
    return fm


def build_learning_block(data: dict) -> str:
    guide = data.get("guide", "#order")
    parts = [
        "## Before you start",
        "",
        data["before"],
        "",
        f"Full guide: [DSA Primer](dsa-guide.html{guide})",
        "",
        "## How to think",
        "",
        data["think"],
        "",
        "## Diagram",
        "",
        "```text",
        data["diagram"],
        "```",
        "",
        "## C walkthrough",
        "",
        "```text",
        data["walk"],
        "```",
        "",
    ]
    return "\n".join(parts)


def enrich_file(path: Path, data: dict) -> None:
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)", raw)
    if not m:
        print(f"  skip {path.name}: no frontmatter")
        return
    fm, body = m.group(1), m.group(2)
    fm_inner = fm.strip().strip("-").strip()
    fm_inner = patch_frontmatter(fm_inner, data)
    fm = "---\n" + fm_inner + "\n---\n"

    learning = build_learning_block(data)
    if "## Before you start" in body:
        body = re.sub(r"## Before you start[\s\S]*?(?=## Description|## Algorithm)", "", body)
    # Insert after "At a glance" section
    if "## At a glance" in body:
        body = re.sub(
            r"(## At a glance[\s\S]*?)(?=\n## Description)",
            r"\1\n" + learning,
            body,
            count=1,
        )
    else:
        body = learning + body

    path.write_text(fm + body, encoding="utf-8")
    print(f"  + {path.name}")


def main() -> None:
    for fname, data in ENRICHMENTS.items():
        enrich_file(QUESTIONS / fname, data)
    print("Done enriching DSA learning content.")


if __name__ == "__main__":
    main()
