/**
 * Step-through demos on dsa-guide.html — plain-English traces for beginners.
 */
(function () {
  const demos = {
    dfs: {
      grid: [
        [1, 1, 1, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1],
      ],
      steps: [
        { visit: [[0, 0]], sink: [], note: "Start at (0,0). It's land ('1') — count 1 island, begin DFS." },
        { visit: [[0, 0], [0, 1]], sink: [[0, 0]], note: "Visit right neighbor (0,1). Mark (0,0) as visited by sinking to '0'." },
        { visit: [[0, 1], [0, 2]], sink: [[0, 0], [0, 1]], note: "Keep going right to (0,2). Same connected blob — still 1 island." },
        { visit: [[0, 2], [1, 0]], sink: [[0, 0], [0, 1], [0, 2]], note: "Can't go right (water). Backtrack, go down to (1,0)." },
        { visit: [[1, 0], [1, 1]], sink: [[0, 0], [0, 1], [0, 2], [1, 0]], note: "Flood-fill continues. All these '1's belong to the same island." },
        { visit: [[3, 3]], sink: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1]], note: "First island fully sunk. Scanner finds (3,3) later — that's a second island → answer = 2." },
      ],
    },
    bfs: {
      grid: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      blocked: [[0, 2], [1, 2], [2, 2], [3, 2]],
      goal: [4, 4],
      steps: [
        { layer: 1, cells: [[0, 0]], note: "Enqueue start (0,0) with distance 1. Queue: [(0,0, d=1)]" },
        { layer: 2, cells: [[0, 0], [1, 0], [0, 1]], note: "Dequeue (0,0). Push open neighbors (1,0) and (0,1) with d=2." },
        { layer: 3, cells: [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2]], note: "Layer 2 cells expand. BFS always finishes nearer cells first." },
        { layer: 4, cells: [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2], [3, 0], [2, 1], [1, 2]], note: "Wall at column 2 blocks some paths — BFS finds shortest route around it." },
        { layer: 8, cells: [[4, 4]], goal: true, note: "First time (4,4) leaves the queue → 8 steps. That's guaranteed minimum on an unweighted grid." },
      ],
    },
    dp: {
      steps: [
        { table: [1, 1, null, null, null, null], hot: [0, 1], note: "Base: dp[0]=1, dp[1]=1 (one way to stand still; one way for one step)." },
        { table: [1, 1, 2, null, null, null], hot: [2], note: "dp[2] = dp[1]+dp[0] = 1+1 = 2 (step+step, or one big step)." },
        { table: [1, 1, 2, 3, null, null], hot: [3], note: "dp[3] = dp[2]+dp[1] = 2+1 = 3" },
        { table: [1, 1, 2, 3, 5, null], hot: [4], note: "dp[4] = dp[3]+dp[2] = 3+2 = 5" },
        { table: [1, 1, 2, 3, 5, 8], hot: [5], note: "dp[5] = 5+3 = 8 ← answer for n=5 stairs" },
      ],
    },
    greedy: {
      nums: [2, 3, 1, 1, 4],
      steps: [
        { i: 0, farthest: 2, note: "i=0, nums[0]=2 → can reach index 2. farthest = 2" },
        { i: 1, farthest: 4, note: "i=1, nums[1]=3 → reach 1+3=4. farthest = 4 (past end soon!)" },
        { i: 2, farthest: 4, note: "i=2, nums[2]=1 → 2+1=3 ≤ 4. farthest stays 4" },
        { i: 3, farthest: 4, note: "i=3 still inside reachable range [0..4]" },
        { i: 4, farthest: 8, done: true, note: "farthest=4 ≥ last index 4 → YES, you can reach the end" },
      ],
    },
    tree: {
      nodes: [
        { id: 0, val: 5, x: 50, y: 8 },
        { id: 1, val: 4, x: 28, y: 38 },
        { id: 2, val: 8, x: 72, y: 38 },
        { id: 3, val: 11, x: 18, y: 68 },
        { id: 4, val: 13, x: 58, y: 68 },
        { id: 5, val: 4, x: 86, y: 68 },
        { id: 6, val: 7, x: 8, y: 92 },
        { id: 7, val: 2, x: 28, y: 92 },
        { id: 8, val: 1, x: 92, y: 92 },
      ],
      steps: [
        { path: [], remaining: 22, hot: [], note: "Target sum 22. Start at root — can any root→leaf path work?" },
        { path: [0], remaining: 17, hot: [0], note: "Visit 5. Need 22−5 = 17 more on a path to a leaf." },
        { path: [0, 1], remaining: 13, hot: [1], note: "Go left to 4. Need 17−4 = 13." },
        { path: [0, 1, 3], remaining: 2, hot: [3], note: "Go to 11. Need 13−11 = 2." },
        { path: [0, 1, 3, 7], remaining: 0, hot: [7], note: "Leaf 2: value 2 equals remaining 2 ✓ Path 5→4→11→2 sums to 22." },
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
          if (!layerMap.has(key)) layerMap.set(key, st.layer || s + 1);
        });
      }
    }

    let html = '<div class="guide-viz-grid">';
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
        const show = blocked.has(key) ? "█" : kind === "dfs" ? (val === 1 ? "1" : sinkSet.has(key) ? "·" : "") : layerMap.has(key) || (r === 0 && c === 0 && container._stepIdx >= 0) ? "●" : "";
        html += `<div class="${cls}">${show}</div>`;
      }
      html += "</div>";
    }
    html += "</div>";
    container.querySelector(".guide-viz-canvas").innerHTML = html;
    container.querySelector(".guide-viz-note").textContent = step.note;
    const counter = container.querySelector(".guide-viz-step-num");
    if (counter) counter.textContent = String((container._stepIdx ?? 0) + 1);
  }

  function renderDp(container, demo, step) {
    const labels = step.table.map((_, i) => i);
    const cols = step.table
      .map((v, i) => {
        const hot = (step.hot || []).includes(i);
        const text = v == null ? "?" : v;
        return `<div class="guide-dp-col ${hot ? "guide-dp-hot" : ""}"><span class="guide-dp-label">${i}</span><span class="guide-dp-val">${text}</span></div>`;
      })
      .join("");
    container.querySelector(".guide-viz-canvas").innerHTML = `<div class="guide-dp-row">${cols}</div>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    const counter = container.querySelector(".guide-viz-step-num");
    if (counter) counter.textContent = String((container._stepIdx ?? 0) + 1);
  }

  function renderGreedy(container, demo, step) {
    const nums = demo.nums;
    const cells = nums
      .map((n, i) => {
        const cur = i === step.i;
        const inReach = i <= step.farthest;
        return `<div class="guide-jump-col ${cur ? "guide-jump-cur" : inReach ? "guide-jump-reach" : ""}"><span class="guide-dp-label">${i}</span><span class="guide-dp-val">${n}</span></div>`;
      })
      .join("");
    const pct = ((step.farthest + 1) / nums.length) * 100;
    container.querySelector(".guide-viz-canvas").innerHTML = `
      <div class="guide-reach-track"><div class="guide-reach-fill" style="width:${pct}%"></div></div>
      <div class="guide-jump-row">${cells}</div>
      <p class="guide-reach-label">farthest = ${step.farthest}${step.done ? " ✓" : ""}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    const counter = container.querySelector(".guide-viz-step-num");
    if (counter) counter.textContent = String((container._stepIdx ?? 0) + 1);
  }

  function renderTree(container, demo, step) {
    const onPath = new Set(step.path || []);
    const hot = new Set(step.hot || []);
    const nodes = demo.nodes
      .map((nd) => {
        let cls = "guide-tree-node";
        if (hot.has(nd.id)) cls += " guide-tree-hot";
        else if (onPath.has(nd.id)) cls += " guide-tree-path";
        return `<div class="${cls}" style="left:${nd.x}%;top:${nd.y}%">${nd.val}</div>`;
      })
      .join("");
    container.querySelector(".guide-viz-canvas").innerHTML = `
      <div class="guide-tree-canvas">${nodes}</div>
      <p class="guide-reach-label">remaining target = ${step.remaining}</p>`;
    container.querySelector(".guide-viz-note").textContent = step.note;
    const counter = container.querySelector(".guide-viz-step-num");
    if (counter) counter.textContent = String((container._stepIdx ?? 0) + 1);
  }

  function wireDemo(id, kind) {
    const root = document.querySelector(`[data-demo="${id}"]`);
    if (!root) return;
    const demo = demos[kind];
    root._stepIdx = 0;
    const prev = root.querySelector(".guide-viz-prev");
    const next = root.querySelector(".guide-viz-next");
    const reset = root.querySelector(".guide-viz-reset");

    const render = () => {
      const step = demo.steps[root._stepIdx];
      if (kind === "dfs" || kind === "bfs") renderGrid(root, demo, step, kind);
      else if (kind === "dp") renderDp(root, demo, step);
      else if (kind === "greedy") renderGreedy(root, demo, step);
      else if (kind === "tree") renderTree(root, demo, step);
      if (prev) prev.disabled = root._stepIdx === 0;
      if (next) next.disabled = root._stepIdx >= demo.steps.length - 1;
    };

    prev?.addEventListener("click", () => {
      if (root._stepIdx > 0) {
        root._stepIdx--;
        render();
      }
    });
    next?.addEventListener("click", () => {
      if (root._stepIdx < demo.steps.length - 1) {
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

  /* Sticky sidebar: highlight active section */
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
