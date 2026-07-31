/**
 * Step-through demos on dsa-guide.html — plain-English traces for beginners.
 * Live panels show real C (not pseudo). Each step sets `hl: [lineIndexes]`.
 * Assumed macros/arrays (ROWS, COLS, q_r/…) match the annotated reference below each demo.
 */
(function () {
  /* ── Live C panels (0-based line indexes for hl) ── */
  const skeletons = {
    dfs: [
      "int numIslands(char g[][COLS], int R, int C) {",
      "    int count = 0;",
      "    for (int r = 0; r < R; r++)",
      "        for (int c = 0; c < C; c++)",
      "            if (g[r][c] == '1') {",
      "                count++;",
      "                dfs(g, R, C, r, c);",
      "            }",
      "    return count;",
      "}",
      "void dfs(char g[][COLS], int R, int C, int r, int c) {",
      "    if (r < 0 || r >= R || c < 0 || c >= C) return;",
      "    if (g[r][c] != '1') return;",
      "    g[r][c] = '0';",
      "    dfs(g, R, C, r + 1, c);",
      "    dfs(g, R, C, r - 1, c);",
      "    dfs(g, R, C, r, c + 1);",
      "    dfs(g, R, C, r, c - 1);",
      "}",
    ],
    bfs: [
      "int q_r[MAX_CELLS], q_c[MAX_CELLS], q_d[MAX_CELLS];",
      "int shortestPath(char g[ROWS][COLS], int gr, int gc) {",
      "    int head = 0, tail = 0;",
      "    int vis[ROWS][COLS] = {0};",
      "    q_r[tail] = 0; q_c[tail] = 0; q_d[tail] = 1;",
      "    tail++;",
      "    vis[0][0] = 1;",
      "    while (head < tail) {",
      "        int r = q_r[head], c = q_c[head], d = q_d[head];",
      "        head++;",
      "        if (r == gr && c == gc) return d;",
      "        int dr[4] = {1, -1, 0, 0};",
      "        int dc[4] = {0, 0, 1, -1};",
      "        for (int k = 0; k < 4; k++) {",
      "            int nr = r + dr[k], nc = c + dc[k];",
      "            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;",
      "            if (g[nr][nc] == '#' || vis[nr][nc]) continue;",
      "            vis[nr][nc] = 1;",
      "            q_r[tail] = nr; q_c[tail] = nc; q_d[tail] = d + 1;",
      "            tail++;",
      "        }",
      "    }",
      "    return -1;",
      "}",
    ],
    tree: [
      "struct Node { int val; struct Node *left, *right; };",
      "int hasPathSum(struct Node *root, int target) {",
      "    if (!root) return 0;",
      "    if (!root->left && !root->right)",
      "        return root->val == target;",
      "    return hasPathSum(root->left, target - root->val)",
      "        || hasPathSum(root->right, target - root->val);",
      "}",
    ],
    greedy: [
      "int canJump(int *nums, int n) {",
      "    int farthest = 0;",
      "    for (int i = 0; i < n; i++) {",
      "        if (i > farthest) return 0;",
      "        if (i + nums[i] > farthest)",
      "            farthest = i + nums[i];",
      "        if (farthest >= n - 1) return 1;",
      "    }",
      "    return 0;",
      "}",
    ],
    stack: [
      "void dailyTemps(int *T, int n, int *wait) {",
      "    int stack[256];",
      "    int top = -1;",
      "    for (int i = 0; i < n; i++) {",
      "        while (top >= 0 && T[i] > T[stack[top]]) {",
      "            int prev = stack[top--];",
      "            wait[prev] = i - prev;",
      "        }",
      "        stack[++top] = i;",
      "    }",
      "}",
    ],
    backtrack: [
      "void print_subset(int *cur, int sz); /* your collector / printer */",
      "void backtrack(int *nums, int n, int start, int *cur, int sz) {",
      "    print_subset(cur, sz);",
      "    for (int i = start; i < n; i++) {",
      "        cur[sz] = nums[i];",
      "        backtrack(nums, n, i + 1, cur, sz + 1);",
      "    }",
      "}",
    ],
    "dp-memo": [
      "int ways(int i, int *memo) {",
      "    if (i <= 1) return 1;",
      "    if (memo[i] != -1) return memo[i];",
      "    memo[i] = ways(i - 1, memo) + ways(i - 2, memo);",
      "    return memo[i];",
      "}",
      "/* caller: memset(memo,-1,…); memo[0]=memo[1]=1; return ways(5,memo); */",
    ],
    "dp-tabulation": [
      "int climbStairs(int n) {",
      "    if (n <= 2) return n;",
      "    int dp[n + 1];",
      "    dp[0] = 1;",
      "    dp[1] = 1;",
      "    for (int i = 2; i <= n; i++)",
      "        dp[i] = dp[i - 1] + dp[i - 2];",
      "    return dp[n];",
      "}",
    ],
    "dp-space": [
      "int climbStairs(int n) {",
      "    if (n <= 1) return 1;",
      "    int a = 1, b = 1;",
      "    for (int i = 2; i <= n; i++) {",
      "        int c = a + b;",
      "        a = b;",
      "        b = c;",
      "    }",
      "    return b;",
      "}",
    ],
  };

  /* ── Build DFS steps from grid (complete flood fill) ── */
  function buildDfsSteps(grid) {
    const g = grid.map((row) => row.map((v) => v));
    const rows = g.length;
    const cols = g[0].length;
    const steps = [];
    const sunk = [];
    let visitTrail = [];

    const snap = (note, extra = {}) => {
      steps.push({
        visit: visitTrail.map(([r, c]) => [r, c]),
        sink: sunk.map(([r, c]) => [r, c]),
        islands: extra.islands ?? null,
        hl: extra.hl || [],
        note,
      });
    };

    function dfs(r, c, islandNum) {
      if (r < 0 || r >= rows || c < 0 || c >= cols || g[r][c] !== 1) return;
      visitTrail.push([r, c]);
      snap(`Enter (${r},${c}) — land found. Pass base checks.`, { hl: [11], islands: islandNum });
      g[r][c] = 0;
      sunk.push([r, c]);
      snap(`Sunk (${r},${c}) to 0. Recurse 4 neighbors (down, up, right, left).`, {
        hl: [13],
        islands: islandNum,
      });
      dfs(r + 1, c, islandNum);
      dfs(r - 1, c, islandNum);
      dfs(r, c + 1, islandNum);
      dfs(r, c - 1, islandNum);
    }

    let count = 0;
    snap("INPUT: grid of 0/1. Scan every cell for land ('1').", { hl: [2] });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r][c] !== 1) continue;
        count++;
        visitTrail = [];
        snap(`Found land at (${r},${c}) — island #${count}. count++ then call dfs.`, {
          islands: count,
          hl: [6],
        });
        dfs(r, c, count);
        snap(`DFS finished — entire connected blob sunk. Continue scanning…`, {
          islands: count,
          hl: [3],
        });
      }
    }
    snap(`OUTPUT: return count = ${count} islands. Meaning: ${count} separate land blobs.`, {
      islands: count,
      hl: [8],
    });
    return { grid, steps };
  }

  /* ── Build BFS steps (layer-by-layer until goal) ── */
  function buildBfsSteps(rows, cols, blocked, goal) {
    const wall = new Set(blocked.map(([r, c]) => `${r},${c}`));
    const dist = new Map();
    const steps = [];
    const q = [[0, 0, 1]];
    dist.set("0,0", 1);

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    const snap = (note, goalHit = false, hl = []) => {
      const cells = [...dist.keys()].map((k) => k.split(",").map(Number));
      const maxLayer = Math.max(...dist.values());
      steps.push({ layer: maxLayer, cells, goal: goalHit, hl, note });
    };

    snap("INPUT: grid + start (0,0) + goal. Enqueue start with distance 1.", false, [4]);

    let head = 0;
    while (head < q.length) {
      const [r, c, d] = q[head++];
      if (r === goal[0] && c === goal[1]) {
        snap(
          `Dequeue goal (${r},${c}) with d=${d}. OUTPUT = ${d} (shortest steps). Not “any path” — first arrival wins.`,
          true,
          [10]
        );
        break;
      }
      const added = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nr},${nc}`;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (wall.has(key) || dist.has(key)) continue;
        dist.set(key, d + 1);
        q.push([nr, nc, d + 1]);
        added.push([nr, nc]);
      }
      if (added.length) {
        snap(`Dequeue (${r},${c}) at d=${d}. Enqueue ${added.length} neighbor(s) at d=${d + 1}.`, false, [18]);
      } else {
        snap(`Dequeue (${r},${c}) at d=${d}. No new neighbors (wall or visited).`, false, [16]);
      }
    }
    return {
      grid: Array.from({ length: rows }, () => Array(cols).fill(0)),
      blocked,
      goal,
      steps,
    };
  }

  const dfsDemo = buildDfsSteps([
    [1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1],
  ]);

  const bfsDemo = buildBfsSteps(
    5,
    5,
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [4, 4]
  );

  const dpModes = {
    memo: {
      label: "Top-down + memo",
      skeleton: "dp-memo",
      steps: [
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5], hot: [5], hl: [0], note: "INPUT n=5. Call ways(5). Output will be memo[5] = number of sequences." },
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5, 4], hot: [4], hl: [3], note: "ways(5)=ways(4)+ways(3). Recurse into ways(4) first (line: compute)." },
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5, 4, 3, 2], hot: [2], hl: [1], note: "At ways(2): base / near-base — ways(1)+ways(0) known as 1." },
        { kind: "memo", memo: [1, 1, 2, -1, -1, -1], stack: [5, 4, 3], hot: [2], hl: [3], note: "Store memo[2]=2, return. OUTPUT of this subproblem = 2 ways to climb 2 stairs." },
        { kind: "memo", memo: [1, 1, 2, 3, -1, -1], stack: [5, 4, 3], hot: [3], hl: [3], note: "memo[3]=3 — three sequences sum to 3 (1+1+1, 1+2, 2+1)." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, -1], stack: [5, 4], hot: [4], hl: [3], note: "memo[4]=5. Climbing 4 stairs has 5 sequences." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, -1], stack: [5, 3], hot: [3], hl: [2], note: "ways(3) already in memo → cache hit, no recompute." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, 8], stack: [5], hot: [5], hl: [4], note: "OUTPUT: ways(5)=8. Meaning: 8 distinct ways to climb 5 stairs." },
      ],
    },
    tabulation: {
      label: "Bottom-up table",
      skeleton: "dp-tabulation",
      steps: [
        { kind: "table", table: [1, 1, null, null, null, null], hot: [0, 1], hl: [3], note: "INPUT n=5. Allocate dp[]. Set bases: 1 way for 0 steps, 1 way for 1 stair." },
        { kind: "table", table: [1, 1, 2, null, null, null], hot: [2], hl: [6], note: "dp[2]=2 → two sequences for 2 stairs: 1+1 and 2." },
        { kind: "table", table: [1, 1, 2, 3, null, null], hot: [3], hl: [6], note: "dp[3]=3 → three sequences for 3 stairs." },
        { kind: "table", table: [1, 1, 2, 3, 5, null], hot: [4], hl: [6], note: "dp[4]=5 → five sequences for 4 stairs." },
        { kind: "table", table: [1, 1, 2, 3, 5, 8], hot: [5], hl: [7], note: "OUTPUT return dp[5]=8 → eight sequences reach the top of 5 stairs." },
      ],
    },
    space: {
      label: "2 variables (space O(1))",
      skeleton: "dp-space",
      steps: [
        { kind: "space", i: null, a: 1, b: 1, c: null, hot: ["a", "b"], hl: [2], note: "INPUT n=5. a,b hold last two answers (ways for smaller stairs)." },
        { kind: "space", i: 2, a: 1, b: 1, c: 2, hot: ["c"], hl: [4], note: "i=2: c=a+b=2 — same meaning as dp[2]=2 ways." },
        { kind: "space", i: 2, a: 1, b: 2, c: 2, hot: ["a", "b"], hl: [6], note: "Slide: a←b, b←c so b always = ways(i)." },
        { kind: "space", i: 3, a: 2, b: 3, c: 3, hot: ["c"], hl: [4], note: "i=3: b becomes 3 — three ways for 3 stairs." },
        { kind: "space", i: 4, a: 3, b: 5, c: 5, hot: ["c"], hl: [4], note: "i=4: b=5 ways for 4 stairs." },
        { kind: "space", i: 5, a: 5, b: 8, c: 8, hot: ["b"], hl: [8], note: "OUTPUT return b=8 — eight ways to climb n=5." },
      ],
    },
  };

  const demos = {
    dfs: dfsDemo,
    bfs: bfsDemo,
    dp: { modes: dpModes, defaultMode: "memo" },
    greedy: {
      nums: [2, 3, 1, 1, 4],
      steps: [
        { i: 0, farthest: 0, hl: [1], note: "INPUT nums=[2,3,1,1,4]. farthest=0. Can we reach last index?" },
        { i: 0, farthest: 2, hl: [5], note: "i=0: nums[0]=2 → farthest=2. Green = still reachable." },
        { i: 1, farthest: 4, hl: [6], note: "i=1: 1+3=4 ≥ last index → OUTPUT will be 1 (yes)." },
        { i: 2, farthest: 4, hl: [2], note: "i=2 still reachable; 2+1=3 does not extend farthest." },
        { i: 3, farthest: 4, hl: [2], note: "i=3: no extend. End already reachable." },
        { i: 4, farthest: 8, done: true, hl: [6], note: "OUTPUT return 1. Meaning: yes, some jump sequence reaches the end (not “how many jumps”)." },
      ],
    },
    tree: {
      nodes: [
        { id: 0, val: 5, x: 50, y: 10 },
        { id: 1, val: 4, x: 28, y: 36 },
        { id: 2, val: 8, x: 72, y: 36 },
        { id: 3, val: 11, x: 18, y: 62 },
        { id: 4, val: 13, x: 58, y: 62 },
        { id: 5, val: 4, x: 86, y: 62 },
        { id: 6, val: 7, x: 8, y: 88 },
        { id: 7, val: 2, x: 28, y: 88 },
        { id: 8, val: 1, x: 92, y: 88 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [3, 6],
        [3, 7],
        [5, 8],
      ],
      steps: [
        { path: [], edgePath: [], remaining: 22, hot: [], hl: [1], note: "INPUT: tree + target=22. OUTPUT: 1 if any root→leaf sums to 22, else 0." },
        { path: [0], edgePath: [], remaining: 17, hot: [0], hl: [5], note: "At root 5: recurse left with target−5 = 17." },
        { path: [0, 1], edgePath: [[0, 1]], remaining: 13, hot: [1], hl: [5], note: "At 4: need 13 more. Go left to 11." },
        { path: [0, 1, 3], edgePath: [[0, 1], [1, 3]], remaining: 2, hot: [3], hl: [5], note: "At 11: need 2. Try left child 7." },
        { path: [0, 1, 3, 6], edgePath: [[0, 1], [1, 3], [3, 6]], remaining: -5, hot: [6], fail: true, hl: [4], note: "Leaf 7: 7==−5? No. Backtrack and try right." },
        { path: [0, 1, 3, 7], edgePath: [[0, 1], [1, 3], [3, 7]], remaining: 0, hot: [7], hl: [4], note: "Leaf 2: remaining 0 ✓ Path 5→4→11→2 sums to 22." },
        { path: [0, 1, 3, 7], edgePath: [[0, 1], [1, 3], [3, 7]], remaining: 0, hot: [7], done: true, hl: [5], note: "OUTPUT return 1 (true) up the stack. Meaning: at least one valid path exists." },
      ],
    },
    stack: {
      temps: [73, 74, 75, 71, 69, 72, 76],
      steps: [
        { i: 0, stack: [0], wait: [0, 0, 0, 0, 0, 0, 0], hl: [8], note: "INPUT T=[73,74,75,71,69,72,76]. OUTPUT wait[i]=days until warmer (0 if none)." },
        { i: 1, stack: [1], wait: [1, 0, 0, 0, 0, 0, 0], hl: [6], note: "Day 1 (74)>73 → pop 0, wait[0]=1. Push 1." },
        { i: 2, stack: [2], wait: [1, 1, 0, 0, 0, 0, 0], hl: [6], note: "Day 2 (75)>74 → wait[1]=1. Push 2." },
        { i: 3, stack: [2, 3], wait: [1, 1, 0, 0, 0, 0, 0], hl: [8], note: "71 < 75 — no pop. Push 3 (cooler days wait)." },
        { i: 4, stack: [2, 3, 4], wait: [1, 1, 0, 0, 0, 0, 0], hl: [8], note: "69 cooler still — stack grows: [2,3,4]." },
        { i: 5, stack: [2, 5], wait: [1, 1, 0, 2, 1, 0, 0], hl: [6], note: "72 > 69 and 71 → wait[4]=1, wait[3]=2. Push 5." },
        { i: 6, stack: [6], wait: [1, 1, 4, 2, 1, 1, 0], hl: [6], note: "76 clears stack. wait[5]=1, wait[2]=4. OUTPUT array filled." },
      ],
    },
    backtrack: {
      nums: [1, 2, 3],
      steps: [
        { cur: [], start: 0, hl: [2], note: "INPUT nums=[1,2,3]. OUTPUT: every subset (power set). print_subset({}) first." },
        { cur: [1], start: 1, hl: [4], note: "CHOOSE 1 → explore with start=1. print_subset({1})." },
        { cur: [1, 2], start: 2, hl: [4], note: "CHOOSE 2 → {1,2}. print_subset." },
        { cur: [1, 2, 3], start: 3, hl: [2], note: "CHOOSE 3 → {1,2,3}. No more picks from start=3." },
        { cur: [1, 3], start: 3, hl: [5], note: "Return unchooses 2; CHOOSE 3 → {1,3}." },
        { cur: [2], start: 2, hl: [4], note: "Back to root branch: CHOOSE 2 alone → {2}." },
        { cur: [2, 3], start: 3, hl: [2], note: "{2,3} printed." },
        { cur: [3], start: 3, hl: [2], note: "Last branch {3}. Done — 8 subsets total (= 2³)." },
      ],
    },
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function skeletonKey(kind, container) {
    if (kind === "dp") {
      const mode = container._dpMode || demos.dp.defaultMode;
      return demos.dp.modes[mode].skeleton;
    }
    return kind;
  }

  function renderSkeleton(container, kind, hlLines) {
    const el = container.querySelector("[data-skeleton]");
    if (!el) return;
    const key = skeletonKey(kind, container);
    const lines = skeletons[key] || [];
    /* One line only — multi-line flash is hard to follow. */
    const hotIdx = Array.isArray(hlLines) && hlLines.length ? hlLines[0] : -1;
    el.innerHTML = lines
      .map((line, i) => {
        const cls = i === hotIdx ? "guide-code-line guide-code-line-hot" : "guide-code-line";
        return `<span class="${cls}" data-line="${i}">${escapeHtml(line)}</span>`;
      })
      .join("\n");
    const hotEl = el.querySelector(".guide-code-line-hot");
    if (hotEl) {
      requestAnimationFrame(() => {
        hotEl.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      });
    }
  }

  function renderGrid(container, demo, step, kind) {
    const g = demo.grid;
    const sinkSet = new Set((step.sink || []).map(([r, c]) => `${r},${c}`));
    const visitSet = new Set((step.visit || []).map(([r, c]) => `${r},${c}`));
    const blocked = new Set((demo.blocked || []).map(([r, c]) => `${r},${c}`));
    const goal = demo.goal;
    const layerMap = new Map();

    if (kind === "bfs") {
      for (let s = 0; s <= container._stepIdx; s++) {
        const st = demo.steps[s];
        (st.cells || []).forEach(([r, c]) => {
          const key = `${r},${c}`;
          if (!layerMap.has(key)) layerMap.set(key, st.layer || 1);
        });
      }
    }

    let meta = "";
    if (step.islands != null) meta = `<p class="guide-viz-meta">Islands counted: ${step.islands}</p>`;

    let html = meta + '<div class="guide-viz-grid">';
    for (let r = 0; r < g.length; r++) {
      html += '<div class="guide-viz-row">';
      for (let c = 0; c < g[r].length; c++) {
        const key = `${r},${c}`;
        let val = g[r][c];
        if (sinkSet.has(key)) val = 0;
        let cls = "guide-cell";
        if (blocked.has(key)) cls += " guide-cell-wall";
        else if (goal && r === goal[0] && c === goal[1]) cls += step.goal ? " guide-cell-goal" : " guide-cell-target";
        else if (visitSet.has(key)) cls += " guide-cell-visit";
        else if (layerMap.has(key)) cls += ` guide-cell-layer-${Math.min(layerMap.get(key), 8)}`;
        let show = "";
        if (blocked.has(key)) show = "█";
        else if (kind === "dfs") show = val === 1 ? "1" : sinkSet.has(key) ? "·" : "";
        else if (layerMap.has(key)) show = String(layerMap.get(key));
        else if (r === 0 && c === 0 && container._stepIdx >= 0 && kind === "bfs") show = "1";
        html += `<div class="${cls}">${show}</div>`;
      }
      html += "</div>";
    }
    html += "</div>";
    container.querySelector(".guide-viz-canvas").innerHTML = html;
    container.querySelector(".guide-viz-note").textContent = step.note;
    renderSkeleton(container, kind, step.hl);
    updateStepCounter(container);
  }

  function renderDp(container, demo, step) {
    const mode = container._dpMode || demo.defaultMode;
    const modeLabel = container.querySelector(".guide-viz-mode-label");
    if (modeLabel) modeLabel.textContent = demo.modes[mode].label;

    if (step.kind === "memo") {
      const cols = step.memo
        .map((v, i) => {
          const hot = (step.hot || []).includes(i);
          const text = v === -1 ? "?" : v;
          return `<div class="guide-dp-col ${hot ? "guide-dp-hot" : ""}"><span class="guide-dp-label">m[${i}]</span><span class="guide-dp-val">${text}</span></div>`;
        })
        .join("");
      const stack = step.stack.map((s) => `<span class="guide-stack-frame">ways(${s})</span>`).join('<span class="guide-stack-arrow">→</span>');
      container.querySelector(".guide-viz-canvas").innerHTML = `
        <p class="guide-dp-mode-tag">Top-down — recursive calls + cache · input n=5 → output 8 ways</p>
        <div class="guide-call-stack">${stack || "<span class='muted'>done</span>"}</div>
        <div class="guide-dp-row">${cols}</div>`;
    } else if (step.kind === "space") {
      const vars = [
        ["a", step.a],
        ["b", step.b],
        ["c", step.c],
      ];
      const chips = vars
        .map(([name, val]) => {
          const hot = (step.hot || []).includes(name);
          const text = val == null ? "—" : val;
          return `<div class="guide-dp-col ${hot ? "guide-dp-hot" : ""}"><span class="guide-dp-label">${name}</span><span class="guide-dp-val">${text}</span></div>`;
        })
        .join("");
      const iLine = step.i == null ? "loop not started" : `i = ${step.i}`;
      container.querySelector(".guide-viz-canvas").innerHTML = `
        <p class="guide-dp-mode-tag">Space O(1) — two rolling variables · output = b when done</p>
        <p class="guide-reach-label">${iLine}</p>
        <div class="guide-dp-row">${chips}</div>`;
    } else {
      const cols = (step.table || [])
        .map((v, i) => {
          const hot = (step.hot || []).includes(i);
          const text = v == null ? "?" : v;
          return `<div class="guide-dp-col ${hot ? "guide-dp-hot" : ""}"><span class="guide-dp-label">dp[${i}]</span><span class="guide-dp-val">${text}</span></div>`;
        })
        .join("");
      container.querySelector(".guide-viz-canvas").innerHTML = `
        <p class="guide-dp-mode-tag">Bottom-up — fill table · final output = dp[5]</p>
        <div class="guide-dp-row">${cols}</div>`;
    }
    renderSkeleton(container, "dp", step.hl);
    container.querySelector(".guide-viz-note").textContent = step.note;
    updateStepCounter(container);
  }

  function renderGreedy(container, demo, step) {
    const nums = demo.nums;
    const cells = nums
      .map((n, i) => {
        const cur = i === step.i;
        const inReach = i <= step.farthest;
        const past = i > step.farthest && !cur;
        return `<div class="guide-jump-col ${cur ? "guide-jump-cur" : inReach ? "guide-jump-reach" : past ? "guide-jump-out" : ""}"><span class="guide-dp-label">${i}</span><span class="guide-dp-val">${n}</span></div>`;
      })
      .join("");
    const pct = Math.min(100, ((Math.min(step.farthest, nums.length - 1) + 1) / nums.length) * 100);
    container.querySelector(".guide-viz-canvas").innerHTML = `
      <div class="guide-reach-track"><div class="guide-reach-fill" style="width:${pct}%"></div></div>
      <div class="guide-jump-row">${cells}</div>
      <p class="guide-reach-label">farthest = ${step.farthest}${step.done ? " · OUTPUT = 1 (yes)" : ""}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    renderSkeleton(container, "greedy", step.hl);
    updateStepCounter(container);
  }

  function renderTree(container, demo, step) {
    const onPath = new Set(step.path || []);
    const hot = new Set(step.hot || []);
    const edgeOnPath = new Set((step.edgePath || []).map(([a, b]) => `${a}-${b}`));

    const nodeById = Object.fromEntries(demo.nodes.map((n) => [n.id, n]));

    const lines = demo.edges
      .map(([a, b]) => {
        const na = nodeById[a];
        const nb = nodeById[b];
        const key = `${a}-${b}`;
        const rev = `${b}-${a}`;
        const onP = edgeOnPath.has(key) || edgeOnPath.has(rev);
        const cls = step.fail && onP ? "guide-tree-edge guide-tree-edge-fail" : onP ? "guide-tree-edge guide-tree-edge-path" : "guide-tree-edge";
        return `<line class="${cls}" x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" />`;
      })
      .join("");

    const nodes = demo.nodes
      .map((nd) => {
        let cls = "guide-tree-node";
        if (hot.has(nd.id)) cls += step.fail ? " guide-tree-fail" : step.done ? " guide-tree-hot" : " guide-tree-hot";
        else if (onPath.has(nd.id)) cls += " guide-tree-path";
        return `<div class="${cls}" style="left:${nd.x}%;top:${nd.y}%">${nd.val}</div>`;
      })
      .join("");

    container.querySelector(".guide-viz-canvas").innerHTML = `
      <div class="guide-tree-wrap">
        <svg class="guide-tree-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        <div class="guide-tree-canvas">${nodes}</div>
      </div>
      <p class="guide-reach-label">remaining target = ${step.remaining}${step.done ? " ✓ OUTPUT=1" : step.fail ? " ✗ backtrack" : ""}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    renderSkeleton(container, "tree", step.hl);
    updateStepCounter(container);
  }

  function renderStack(container, demo, step) {
    const temps = demo.temps;
    const wait = step.wait || [];
    const stackSet = new Set(step.stack || []);
    const cells = temps
      .map((t, i) => {
        let cls = "guide-jump-col";
        if (i === step.i) cls += " guide-jump-cur";
        else if (stackSet.has(i)) cls += " guide-jump-reach";
        return `<div class="${cls}"><span class="guide-dp-label">d${i}</span><span class="guide-dp-val">${t}</span><span class="guide-dp-label">w=${wait[i]}</span></div>`;
      })
      .join("");
    const stk = (step.stack || []).map((i) => i).join(", ") || "∅";
    container.querySelector(".guide-viz-canvas").innerHTML = `
      <div class="guide-jump-row">${cells}</div>
      <p class="guide-reach-label">stack indices = [${stk}] · wait[] fills as warmer days arrive</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    renderSkeleton(container, "stack", step.hl);
    updateStepCounter(container);
  }

  function renderBacktrack(container, demo, step) {
    const nums = demo.nums;
    const cur = step.cur || [];
    const chips = nums
      .map((n, i) => {
        const used = cur.includes(n);
        return `<div class="guide-jump-col ${used ? "guide-jump-cur" : ""}"><span class="guide-dp-label">i=${i}</span><span class="guide-dp-val">${n}</span></div>`;
      })
      .join("");
    const setText = cur.length ? `{${cur.join(", ")}}` : "{}";
    container.querySelector(".guide-viz-canvas").innerHTML = `
      <p class="guide-dp-mode-tag">nums = [${nums.join(", ")}]</p>
      <div class="guide-jump-row">${chips}</div>
      <p class="guide-reach-label">current subset = ${setText} · start = ${step.start}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    renderSkeleton(container, "backtrack", step.hl);
    updateStepCounter(container);
  }

  function updateStepCounter(container) {
    const counter = container.querySelector(".guide-viz-step-num");
    const total = container.querySelector(".guide-viz-step-total");
    const steps = getSteps(container);
    if (counter) counter.textContent = String((container._stepIdx ?? 0) + 1);
    if (total) total.textContent = String(steps.length);
  }

  function getSteps(container) {
    const kind = container.dataset.demo;
    if (kind === "dp") {
      const demo = demos.dp;
      return demo.modes[container._dpMode || demo.defaultMode].steps;
    }
    return demos[kind].steps;
  }

  function wireDemo(id, kind) {
    const root = document.querySelector(`[data-demo="${id}"]`);
    if (!root) return;
    const demo = demos[kind];
    root._stepIdx = 0;
    if (kind === "dp") {
      root._dpMode = demo.defaultMode;
      root.querySelectorAll("[data-dp-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          root._dpMode = btn.dataset.dpMode;
          root._stepIdx = 0;
          root.querySelectorAll("[data-dp-mode]").forEach((b) => b.classList.toggle("guide-viz-mode-active", b === btn));
          render();
        });
      });
    }

    const prev = root.querySelector(".guide-viz-prev");
    const next = root.querySelector(".guide-viz-next");
    const reset = root.querySelector(".guide-viz-reset");

    const render = () => {
      const steps = getSteps(root);
      const step = steps[root._stepIdx];
      if (kind === "dfs" || kind === "bfs") renderGrid(root, demo, step, kind);
      else if (kind === "dp") renderDp(root, demo, step);
      else if (kind === "greedy") renderGreedy(root, demo, step);
      else if (kind === "tree") renderTree(root, demo, step);
      else if (kind === "stack") renderStack(root, demo, step);
      else if (kind === "backtrack") renderBacktrack(root, demo, step);
      if (prev) prev.disabled = root._stepIdx === 0;
      if (next) next.disabled = root._stepIdx >= steps.length - 1;
    };

    prev?.addEventListener("click", () => {
      if (root._stepIdx > 0) {
        root._stepIdx--;
        render();
      }
    });
    next?.addEventListener("click", () => {
      const steps = getSteps(root);
      if (root._stepIdx < steps.length - 1) {
        root._stepIdx++;
        render();
      }
    });
    reset?.addEventListener("click", () => {
      root._stepIdx = 0;
      render();
    });
    render();
  }

  wireDemo("dfs", "dfs");
  wireDemo("bfs", "bfs");
  wireDemo("dp", "dp");
  wireDemo("greedy", "greedy");
  wireDemo("tree", "tree");
  wireDemo("stack", "stack");
  wireDemo("backtrack", "backtrack");
})();
