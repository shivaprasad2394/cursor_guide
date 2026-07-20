/**
 * Step-through demos on dsa-guide.html — plain-English traces for beginners.
 */
(function () {
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
        note,
      });
    };

    function dfs(r, c) {
      if (r < 0 || r >= rows || c < 0 || c >= cols || g[r][c] !== 1) return;
      visitTrail.push([r, c]);
      snap(`Enter (${r},${c}) — land found. Mark it (sink to 0) so we never revisit.`);
      g[r][c] = 0;
      sunk.push([r, c]);
      snap(`Sunk (${r},${c}). Try 4 neighbors recursively (down, up, right, left).`);
      dfs(r + 1, c);
      dfs(r - 1, c);
      dfs(r, c + 1);
      dfs(r, c - 1);
    }

    let count = 0;
    snap("Scan grid for '1'. When found, run DFS — each run = one island.");
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r][c] !== 1) continue;
        count++;
        visitTrail = [];
        snap(`Found land at (${r},${c}) — island #${count}. Start DFS flood fill.`, { islands: count });
        dfs(r, c);
        snap(`DFS finished — entire connected blob sunk. Continue scanning…`, { islands: count });
      }
    }
    snap(`Scan done. Total islands = ${count}.`, { islands: count });
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

    const snap = (note, goalHit = false) => {
      const cells = [...dist.keys()].map((k) => k.split(",").map(Number));
      const maxLayer = Math.max(...dist.values());
      steps.push({ layer: maxLayer, cells, goal: goalHit, note });
    };

    snap("Enqueue (0,0) with distance 1. Queue processes front-to-back = nearest cells first.");

    let head = 0;
    while (head < q.length) {
      const [r, c, d] = q[head++];
      if (r === goal[0] && c === goal[1]) {
        snap(`Dequeue (${r},${c}) with d=${d} — GOAL. First arrival = shortest path (${d} steps).`, true);
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
        snap(`Dequeue (${r},${c}) at d=${d}. Enqueue ${added.length} new cell(s) at d=${d + 1}.`);
      } else {
        snap(`Dequeue (${r},${c}) at d=${d}. No new neighbors (wall or visited).`);
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
      steps: [
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5], hot: [5], note: "ways(5): memo[] unknown (−1). Recurse before computing." },
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5, 4], hot: [4], note: "ways(5) = ways(4) + ways(3). Call ways(4) first." },
        { kind: "memo", memo: [1, 1, -1, -1, -1, -1], stack: [5, 4, 3, 2], hot: [2], note: "ways(2) = ways(1)+ways(0) = 1+1. Base cases already known." },
        { kind: "memo", memo: [1, 1, 2, -1, -1, -1], stack: [5, 4, 3], hot: [2], note: "Store memo[2]=2. Return to ways(3)." },
        { kind: "memo", memo: [1, 1, 2, 3, -1, -1], stack: [5, 4, 3], hot: [3], note: "ways(3)=ways(2)+ways(1)=2+1=3 → memo[3]=3." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, -1], stack: [5, 4], hot: [4], note: "ways(4)=ways(3)+ways(2)=3+2=5 → memo[4]=5." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, -1], stack: [5, 3], hot: [3], note: "ways(3) already in memo → reuse 3 (no recompute!)." },
        { kind: "memo", memo: [1, 1, 2, 3, 5, 8], stack: [5], hot: [5], note: "ways(5)=5+3=8 → memo[5]=8. Answer = 8." },
      ],
    },
    tabulation: {
      label: "Bottom-up table",
      steps: [
        { kind: "table", table: [1, 1, null, null, null, null], hot: [0, 1], note: "Tabulation: fill dp[0..5] left to right. Bases dp[0]=dp[1]=1." },
        { kind: "table", table: [1, 1, 2, null, null, null], hot: [2], note: "dp[2] = dp[1]+dp[0] = 2" },
        { kind: "table", table: [1, 1, 2, 3, null, null], hot: [3], note: "dp[3] = dp[2]+dp[1] = 3" },
        { kind: "table", table: [1, 1, 2, 3, 5, null], hot: [4], note: "dp[4] = dp[3]+dp[2] = 5" },
        { kind: "table", table: [1, 1, 2, 3, 5, 8], hot: [5], note: "dp[5] = dp[4]+dp[3] = 8 ← answer" },
      ],
    },
    space: {
      label: "2 variables (space O(1))",
      steps: [
        { kind: "space", i: null, a: 1, b: 1, c: null, hot: ["a", "b"], note: "Only need last two values: a=dp[i−2], b=dp[i−1]. Start a=1, b=1." },
        { kind: "space", i: 2, a: 1, b: 1, c: 2, hot: ["c"], note: "i=2: c=a+b=2. Then slide: a←b, b←c." },
        { kind: "space", i: 2, a: 1, b: 2, c: 2, hot: ["a", "b"], note: "After slide: a=1, b=2 (same as dp[1], dp[2])." },
        { kind: "space", i: 3, a: 2, b: 3, c: 3, hot: ["c"], note: "i=3: c=2+1=3 → a=2, b=3" },
        { kind: "space", i: 4, a: 3, b: 5, c: 5, hot: ["c"], note: "i=4: c=3+2=5 → a=3, b=5" },
        { kind: "space", i: 5, a: 5, b: 8, c: 8, hot: ["b"], note: "i=5: c=5+3=8 → b=8. Return b." },
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
        { i: 0, farthest: 0, note: "Init farthest=0. Loop while i ≤ farthest (still reachable)." },
        { i: 0, farthest: 2, note: "i=0: nums[0]=2 → can reach index 2. farthest=2." },
        { i: 1, farthest: 4, note: "i=1: nums[1]=3 → reach 1+3=4. farthest=4 ≥ last index 4 ✓ (can finish)." },
        { i: 2, farthest: 4, note: "i=2: 2+1=3 ≤ farthest — no update. Still reachable." },
        { i: 3, farthest: 4, note: "i=3: 3+1=4 ≤ farthest — no update." },
        { i: 4, farthest: 8, done: true, note: "i=4: 4+4=8 — extends farthest but end was already reachable. Return 1." },
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
        { path: [], edgePath: [], remaining: 22, hot: [], note: "Target 22. DFS from root — try left subtree first." },
        { path: [0], edgePath: [], remaining: 17, hot: [0], note: "At root 5: need 22−5=17. Choose left child (edge 5→4)." },
        { path: [0, 1], edgePath: [[0, 1]], remaining: 13, hot: [1], note: "At 4: need 17−4=13. Go to 11." },
        { path: [0, 1, 3], edgePath: [[0, 1], [1, 3]], remaining: 2, hot: [3], note: "At 11: need 13−11=2. Try left child 7." },
        { path: [0, 1, 3, 6], edgePath: [[0, 1], [1, 3], [3, 6]], remaining: -5, hot: [6], fail: true, note: "Leaf 7: need −5 at leaf — fail. Backtrack (↑ return)." },
        { path: [0, 1, 3, 7], edgePath: [[0, 1], [1, 3], [3, 7]], remaining: 0, hot: [7], note: "Try right child 2: leaf with remaining 0 ✓ Path 5→4→11→2 = 22." },
        { path: [0, 1, 3, 7], edgePath: [[0, 1], [1, 3], [3, 7]], remaining: 0, hot: [7], done: true, note: "Return true up the call stack — no need to explore 8, 13, … once found." },
      ],
    },
  };

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
    updateStepCounter(container);
  }

  function renderDp(container, demo, step) {
    const modeLabel = container.querySelector(".guide-viz-mode-label");
    if (modeLabel) modeLabel.textContent = demo.modes[container._dpMode].label;

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
        <p class="guide-dp-mode-tag">Top-down — recursive calls + cache</p>
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
        <p class="guide-dp-mode-tag">Space O(1) — two rolling variables</p>
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
        <p class="guide-dp-mode-tag">Bottom-up — fill table left to right</p>
        <div class="guide-dp-row">${cols}</div>`;
    }
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
      <p class="guide-reach-label">farthest = ${step.farthest}${step.done ? " · canReachEnd = YES" : ""}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
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
      <p class="guide-reach-label">remaining target = ${step.remaining}${step.done ? " ✓" : step.fail ? " ✗ backtrack" : ""}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
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

  const tocLinks = document.querySelectorAll(".guide-sidebar a[href^='#']");
  const sections = [...document.querySelectorAll(".guide-section[id]")];
  if (tocLinks.length && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tocLinks.forEach((a) => a.classList.toggle("guide-toc-active", a.getAttribute("href") === `#${e.target.id}`));
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  wireDemo("dfs", "dfs");
  wireDemo("bfs", "bfs");
  wireDemo("dp", "dp");
  wireDemo("greedy", "greedy");
  wireDemo("tree", "tree");
})();
