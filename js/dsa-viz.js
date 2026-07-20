/**
 * dsa-viz.js — rich pattern demos for DSA questions (grid, intervals, stack).
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseGrid(meta) {
  const rows = Number(meta.gridRows) || 4;
  const cols = Number(meta.gridCols) || 5;
  const tape = String(meta.gridTape || "11100/11000/00011/00001");
  const grid = [];
  const lines = tape.split("/").slice(0, rows);
  for (let r = 0; r < rows; r++) {
    const row = (lines[r] || "").padEnd(cols, "0").slice(0, cols).split("");
    grid.push(row);
  }
  return { rows, cols, grid };
}

function parseIntervals(meta) {
  const raw = String(meta.intervals || "1-2,2-3,3-4,1-3");
  return raw.split(",").map((s) => {
    const [a, b] = s.trim().split("-").map(Number);
    return { s: a, e: b };
  });
}

function parseTape(meta, fallback) {
  return String(meta.tape || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function snap(base) {
  return JSON.parse(JSON.stringify(base));
}

export function createGridDfsSession(meta) {
  const { rows, cols, grid } = parseGrid(meta);
  const g = grid.map((row) => [...row]);
  const steps = [];
  let islands = 0;

  const push = (patch) =>
    steps.push(
      snap({
        kind: "grid-dfs",
        rows,
        cols,
        grid: g.map((r) => [...r]),
        islands,
        hot: patch.hot || [],
        r: patch.r ?? null,
        c: patch.c ?? null,
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        prevLine: patch.prevLine ?? 1,
        currLine: patch.currLine ?? 2,
        func: "numIslands",
      })
    );

  push({ note: "Scan grid for land cells ('1')", phaseLabel: "Init", prevLine: 1, currLine: 2 });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (g[r][c] !== "1") continue;
      islands += 1;
      push({
        r,
        c,
        hot: [[r, c]],
        note: `Found land at (${r},${c}) — island #${islands}, start DFS sink`,
        phaseLabel: `Island ${islands}`,
        prevLine: 2,
        currLine: 3,
      });
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        if (cr < 0 || cc < 0 || cr >= rows || cc >= cols || g[cr][cc] !== "1") continue;
        g[cr][cc] = "0";
        push({
          r: cr,
          c: cc,
          hot: [[cr, cc]],
          note: `DFS sink (${cr},${cc}) → mark '0'`,
          phaseLabel: "Flood fill",
          prevLine: 3,
          currLine: 4,
        });
        stack.push([cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]);
      }
    }
  }

  push({ note: `All components counted — islands=${islands}`, phaseLabel: "Done", prevLine: 4, currLine: 5 });
  return { kind: "grid-dfs", steps, rows, cols };
}

export function createGridBfsSession(meta) {
  const rows = Number(meta.gridRows) || 3;
  const cols = Number(meta.gridCols) || 3;
  const steps = [];
  const vis = Array.from({ length: rows }, () => Array(cols).fill(0));
  const q = [[0, 0, 1]];
  let head = 0;
  let tail = 1;
  vis[0][0] = 1;

  const push = (patch) =>
    steps.push(
      snap({
        kind: "grid-bfs",
        rows,
        cols,
        vis: vis.map((r) => [...r]),
        queue: q.slice(0, tail).map((x) => [...x]),
        head,
        tail,
        hot: patch.hot || [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        prevLine: patch.prevLine ?? 1,
        currLine: patch.currLine ?? 2,
        func: "shortestPathGrid",
      })
    );

  push({ note: "BFS from (0,0) with distance=1", phaseLabel: "Enqueue", hot: [[0, 0]] });

  while (head < tail) {
    const [r, c, d] = q[head];
    push({ hot: [[r, c]], note: `Dequeue (${r},${c}) dist=${d}`, phaseLabel: "Dequeue", prevLine: 2, currLine: 3 });
    if (r === rows - 1 && c === cols - 1) {
      push({ note: `Reached bottom-right in ${d} steps`, phaseLabel: "Goal", prevLine: 3, currLine: 4 });
      break;
    }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || vis[nr][nc]) continue;
      vis[nr][nc] = 1;
      q[tail] = [nr, nc, d + 1];
      tail += 1;
      push({ hot: [[nr, nc]], note: `Enqueue neighbor (${nr},${nc}) with dist=${d + 1}`, phaseLabel: "Expand", prevLine: 3, currLine: 4 });
    }
    head += 1;
  }

  return { kind: "grid-bfs", steps, rows, cols };
}

export function createIntervalSession(meta) {
  const iv = parseIntervals(meta);
  const mode = meta.intervalMode || (/merge/i.test(meta.id || meta.title || "") ? "merge" : "remove");
  const steps = [];
  let removed = 0;
  let end = iv[0]?.e ?? 0;
  const merged = mode === "merge" ? [{ ...iv[0] }] : [];

  const push = (patch) =>
    steps.push(
      snap({
        kind: "intervals",
        mode,
        intervals: iv.map((x) => ({ ...x })),
        merged: merged.map((x) => ({ ...x })),
        removed,
        end,
        active: patch.active ?? 0,
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        prevLine: patch.prevLine ?? 1,
        currLine: patch.currLine ?? 2,
        func: mode === "merge" ? "mergeIntervals" : "minRemove",
      })
    );

  push({ note: `Intervals: ${iv.map((x) => `[${x.s},${x.e}]`).join(" ")}`, phaseLabel: "Input" });

  if (mode === "remove") {
    for (let i = 1; i < iv.length; i++) {
      if (iv[i].s < end) {
        removed += 1;
        push({ active: i, note: `[${iv[i].s},${iv[i].e}] overlaps end=${end} → remove (+1)`, phaseLabel: "Overlap", prevLine: 2, currLine: 3 });
      } else {
        end = iv[i].e;
        push({ active: i, note: `Keep [${iv[i].s},${iv[i].e}] — update end=${end}`, phaseLabel: "Keep", prevLine: 3, currLine: 2 });
      }
    }
    push({ note: `minRemove=${removed}`, phaseLabel: "Done", prevLine: 3, currLine: 4 });
  } else {
    for (let i = 1; i < iv.length; i++) {
      const cur = merged[merged.length - 1];
      if (iv[i].s <= cur.e) {
        if (iv[i].e > cur.e) cur.e = iv[i].e;
        push({ active: i, note: `Merge [${iv[i].s},${iv[i].e}] into [${cur.s},${cur.e}]`, phaseLabel: "Merge", prevLine: 2, currLine: 3 });
      } else {
        merged.push({ ...iv[i] });
        push({ active: i, note: `Append [${iv[i].s},${iv[i].e}]`, phaseLabel: "Append", prevLine: 3, currLine: 4 });
      }
    }
    push({ note: `Merged: ${merged.map((x) => `[${x.s},${x.e}]`).join(" ")}`, phaseLabel: "Done", prevLine: 4, currLine: 5 });
  }

  return { kind: "intervals", steps, mode };
}

export function createMonotonicStackSession(meta) {
  const nums = parseTape(meta, "73,74,75,71,69,72,76,73").map(Number);
  const waitMode = /temperature|daily/i.test(meta.id || meta.title || "");
  const steps = [];
  const st = [];
  const out = waitMode ? Array(nums.length).fill(0) : Array(nums.length).fill(-1);

  const push = (patch) =>
    steps.push(
      snap({
        kind: "monotonic-stack",
        nums: [...nums],
        stack: [...st],
        out: [...out],
        i: patch.i ?? 0,
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        prevLine: patch.prevLine ?? 1,
        currLine: patch.currLine ?? 2,
        func: waitMode ? "dailyWait" : "nextGreater",
      })
    );

  push({ note: "Initialize empty decreasing stack of indices", phaseLabel: "Init" });

  if (waitMode) {
    for (let i = 0; i < nums.length; i++) {
      while (st.length && nums[i] > nums[st[st.length - 1]]) {
        const j = st.pop();
        out[j] = i - j;
        push({ i, note: `Warmer day ${nums[i]} at ${i} — wait[${j}]=${out[j]}`, phaseLabel: "Pop warmer" });
      }
      st.push(i);
      push({ i, note: `Push index ${i} (temp ${nums[i]})`, phaseLabel: "Push" });
    }
  } else {
    for (let i = nums.length - 1; i >= 0; i--) {
      while (st.length && nums[st[st.length - 1]] <= nums[i]) st.pop();
      out[i] = st.length ? nums[st[st.length - 1]] : -1;
      st.push(i);
      push({ i, note: `nge[${i}]=${out[i]}`, phaseLabel: "Scan right→left" });
    }
  }

  push({ note: waitMode ? `wait: ${out.join(" ")}` : `nge: ${out.join(" ")}`, phaseLabel: "Done" });
  return { kind: "monotonic-stack", steps };
}

function renderGrid(body, step, session) {
  const { rows, cols } = session;
  const grid = step.grid || step.vis;
  const hot = new Set((step.hot || []).map(([r, c]) => `${r},${c}`));
  let html = '<div class="viz-grid">';
  for (let r = 0; r < rows; r++) {
    html += '<div class="viz-grid-row">';
    for (let c = 0; c < cols; c++) {
      const val = grid ? grid[r][c] : step.vis?.[r]?.[c] ?? ".";
      const cls = hot.has(`${r},${c}`) ? "viz-grid-cell viz-grid-hot" : "viz-grid-cell";
      html += `<span class="${cls}">${escapeHtml(String(val))}</span>`;
    }
    html += "</div>";
  }
  html += "</div>";
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div>${html}<p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}

function renderIntervals(body, step) {
  const max = Math.max(...step.intervals.map((x) => x.e), 1) + 1;
  const scale = (v) => Math.round((v / max) * 100);
  const bars = step.intervals
    .map((iv, i) => {
      const removed = step.mode === "remove" && step.active === i && step.note.includes("remove");
      const merged = step.merged.some((m) => m.s === iv.s && m.e === iv.e);
      const cls = removed ? "viz-int-removed" : merged || i === 0 ? "viz-int-kept" : i <= step.active ? "viz-int-active" : "viz-int-idle";
      return `<div class="viz-int-bar ${cls}" style="left:${scale(iv.s)}%;width:${Math.max(scale(iv.e - iv.s), 4)}%" title="[${iv.s},${iv.e}]"><span>${iv.s}-${iv.e}</span></div>`;
    })
    .join("");
  const mergedLine =
    step.merged.length && step.mode === "merge"
      ? `<div class="viz-int-merged">Merged: ${step.merged.map((m) => `[${m.s},${m.e}]`).join(" ")}</div>`
      : step.mode === "remove"
        ? `<div class="viz-int-merged">Removed count: ${step.removed}</div>`
        : "";
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div><div class="viz-int-track">${bars}</div>${mergedLine}<p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}

function renderStack(body, step) {
  const stackCells = step.stack
    .map((idx) => `<div class="viz-stack-cell">${step.nums[idx]}</div>`)
    .reverse()
    .join("");
  const arrCells = step.nums
    .map((n, i) => `<span class="viz-cell ${i === step.i ? "viz-cell-mid" : ""}">${n}</span>`)
    .join("");
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div><div class="viz-array-block"><div class="viz-array-caption">Array</div><div class="viz-array-grid">${arrCells}</div></div><div class="viz-array-block"><div class="viz-array-caption">Stack</div><div class="viz-stack-col">${stackCells || "<span class='muted'>(empty)</span>"}</div></div><div class="viz-array-caption">Output: ${escapeHtml(step.out.join(" "))}</div><p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}

export function renderDsaStudioRich(body, session, step) {
  if (session.kind === "grid-dfs" || session.kind === "grid-bfs") renderGrid(body, step, session);
  else if (session.kind === "intervals") renderIntervals(body, step);
  else if (session.kind === "monotonic-stack") renderStack(body, step);
  else if (session.kind === "dp-table") renderDpTable(body, step);
  else if (session.kind === "jump-game") renderJumpGame(body, step);
  else if (session.kind === "tree-path") renderTreePath(body, step, session);
}

/* ── DP simulators ────────────────────────────────────────── */

export function createDpStairsSession(meta) {
  const n = Number(meta.vizN || meta.tape || 5);
  const dp = [];
  const steps = [];
  const push = (patch) =>
    steps.push(
      snap({
        kind: "dp-table",
        labels: dp.map((_, i) => `dp[${i}]`),
        values: [...dp],
        hot: patch.hot ?? [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        func: "climbStairs",
      })
    );
  dp[0] = 1;
  dp[1] = 1;
  push({ hot: [0, 1], note: "Base cases: 1 way to stay at start (0 steps) or 1 step", phaseLabel: "Base" });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    push({
      hot: [i],
      note: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      phaseLabel: `Step ${i}`,
    });
  }
  push({ hot: [n], note: `Answer: ${dp[n]} distinct ways to climb ${n} stairs`, phaseLabel: "Done" });
  return { kind: "dp-table", steps };
}

export function createDpRobberSession(meta) {
  const nums = parseTape(meta, "2,7,9,3,1").map(Number);
  const n = nums.length;
  const pick = Array(n).fill(false);
  let prev2 = 0;
  let prev1 = 0;
  const steps = [];
  const push = (patch) =>
    steps.push(
      snap({
        kind: "dp-table",
        houses: [...nums],
        pick: [...pick],
        prev1,
        prev2,
        hot: patch.hot ?? [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        func: "rob",
      })
    );
  push({ note: "Walk houses left→right. At each house: rob it (+ prev2) or skip (keep prev1).", phaseLabel: "Init" });
  for (let i = 0; i < n; i++) {
    const robIt = nums[i] + prev2;
    const skip = prev1;
    const cur = robIt > skip ? robIt : skip;
    pick[i] = robIt > skip;
    push({
      hot: [i],
      note: pick[i]
        ? `House ${i} ($${nums[i]}): ROB → ${nums[i]}+${prev2}=${robIt} beats skip ${skip}`
        : `House ${i} ($${nums[i]}): SKIP → keep ${skip}`,
      phaseLabel: `House ${i}`,
    });
    prev2 = prev1;
    prev1 = cur;
  }
  push({ hot: [], note: `Best total loot = ${prev1}`, phaseLabel: "Done" });
  return { kind: "dp-table", steps, robber: true };
}

export function createDpCoinSession(meta) {
  const coins = parseTape(meta, "1,2,5").map(Number);
  const amount = Number(meta.vizAmount || 11);
  const dp = Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  const steps = [];
  const push = (patch) =>
    steps.push(
      snap({
        kind: "dp-table",
        labels: dp.map((_, i) => `${i}`),
        values: [...dp],
        coins: [...coins],
        amount,
        hot: patch.hot ?? [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        func: "coinChange",
      })
    );
  push({ note: `dp[a] = min coins to make amount a. Start dp[0]=0, rest=INF`, phaseLabel: "Init" });
  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      const cand = dp[a - c] + 1;
      if (cand < dp[a]) {
        dp[a] = cand;
        push({
          hot: [a],
          note: `Use coin ${c}: dp[${a}] = dp[${a - c}]+1 = ${cand}`,
          phaseLabel: `Coin ${c}`,
        });
      }
    }
  }
  push({ hot: [amount], note: `Min coins for ${amount} = ${dp[amount]}`, phaseLabel: "Done" });
  return { kind: "dp-table", steps, coin: true };
}

export function createJumpGameSession(meta) {
  const nums = parseTape(meta, "2,3,1,1,4").map(Number);
  const n = nums.length;
  let farthest = 0;
  const steps = [];
  const push = (patch) =>
    steps.push(
      snap({
        kind: "jump-game",
        nums: [...nums],
        farthest,
        i: patch.i ?? 0,
        hot: patch.hot ?? [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        func: "canJump",
      })
    );
  push({ note: "farthest = rightmost index reachable so far", phaseLabel: "Init", i: 0 });
  for (let i = 0; i <= farthest && i < n; i++) {
    const reach = i + nums[i];
    if (reach > farthest) {
      farthest = reach;
      push({
        i,
        hot: Array.from({ length: farthest + 1 }, (_, k) => k),
        note: `At i=${i}, jump ${nums[i]} → farthest=${farthest}`,
        phaseLabel: `Index ${i}`,
      });
    } else {
      push({ i, hot: [i], note: `At i=${i}, farthest stays ${farthest}`, phaseLabel: `Index ${i}` });
    }
  }
  push({
    note: farthest >= n - 1 ? `farthest=${farthest} ≥ last index ${n - 1} → can reach end` : "cannot reach",
    phaseLabel: "Done",
    i: n - 1,
    hot: Array.from({ length: n }, (_, k) => k),
  });
  return { kind: "jump-game", steps };
}

export function createTreePathSession(meta) {
  const target = Number(meta.vizTarget || 22);
  const tree = [
    { id: 0, val: 5, l: 1, r: 2, x: 50, y: 10 },
    { id: 1, val: 4, l: 3, r: null, x: 28, y: 35 },
    { id: 2, val: 8, l: 4, r: 5, x: 72, y: 35 },
    { id: 3, val: 11, l: 6, r: 7, x: 18, y: 60 },
    { id: 4, val: 13, l: null, r: null, x: 58, y: 60 },
    { id: 5, val: 4, l: null, r: 8, x: 86, y: 60 },
    { id: 6, val: 7, l: null, r: null, x: 8, y: 85 },
    { id: 7, val: 2, l: null, r: null, x: 28, y: 85 },
    { id: 8, val: 1, l: null, r: null, x: 92, y: 85 },
  ];
  const path = [0, 1, 3, 7];
  const steps = [];
  const remainings = [22, 17, 6, -5];
  const push = (patch) =>
    steps.push(
      snap({
        kind: "tree-path",
        tree,
        path: patch.path ?? [],
        remaining: patch.remaining ?? target,
        hot: patch.hot ?? [],
        note: patch.note,
        phaseLabel: patch.phaseLabel || "",
        func: "hasPathSum",
      })
    );
  push({ note: `Does any root→leaf path sum to ${target}?`, phaseLabel: "Start", path: [], remaining: target });
  push({ path: [0], remaining: 17, hot: [0], note: "Visit 5 → need 22-5=17 more", phaseLabel: "DFS" });
  push({ path: [0, 1], remaining: 13, hot: [1], note: "Go left to 4 → need 17-4=13", phaseLabel: "DFS" });
  push({ path: [0, 1, 3], remaining: 2, hot: [3], note: "Go to 11 → need 13-11=2", phaseLabel: "DFS" });
  push({
    path: [0, 1, 3, 7],
    remaining: 0,
    hot: [7],
    note: "Leaf 2: 2==2 remaining → path 5→4→11→2 sums to 22 ✓",
    phaseLabel: "Found",
  });
  return { kind: "tree-path", steps, target };
}

function renderDpTable(body, step) {
  if (step.houses) {
    const cells = step.houses
      .map(
        (v, i) =>
          `<div class="viz-house ${step.pick[i] ? "viz-house-pick" : ""} ${(step.hot || []).includes(i) ? "viz-cell-mid" : ""}"><span class="viz-house-val">$${v}</span><small>${step.pick[i] ? "rob" : "skip"}</small></div>`
      )
      .join("");
    body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div><div class="viz-house-row">${cells}</div><p class="viz-dp-vars">prev2=${step.prev2} · prev1=${step.prev1}</p><p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
    return;
  }
  const labels = step.labels || step.values.map((_, i) => String(i));
  const cols = (step.values || []).map((v, i) => {
    const hot = (step.hot || []).includes(i);
    return `<div class="viz-array-col"><span class="viz-idx">${escapeHtml(labels[i])}</span><span class="viz-cell ${hot ? "viz-cell-mid" : ""}">${v >= 1000 ? "∞" : v}</span></div>`;
  }).join("");
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div><div class="viz-array-block"><div class="viz-array-caption">DP table</div><div class="viz-array-grid">${cols}</div></div><p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}

function renderJumpGame(body, step) {
  const n = step.nums.length;
  const cells = step.nums
    .map((v, i) => {
      const inReach = (step.hot || []).includes(i);
      const cur = i === step.i;
      return `<div class="viz-array-col"><span class="viz-idx">${i}</span><span class="viz-cell ${cur ? "viz-cell-mid" : inReach ? "viz-cell-low" : ""}">${v}</span></div>`;
    })
    .join("");
  const bar = `<div class="viz-reach-bar" style="width:${Math.min(100, ((step.farthest + 1) / n) * 100)}%"></div>`;
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}()</div><div class="viz-array-block"><div class="viz-array-caption">nums · farthest=${step.farthest}</div><div class="viz-reach-wrap">${bar}<div class="viz-array-grid">${cells}</div></div></div><p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}

function renderTreePath(body, step, session) {
  const hot = new Set(step.hot || []);
  const onPath = new Set(step.path || []);
  const nodes = (step.tree || session.tree || [])
    .map((nd) => {
      const cls = hot.has(nd.id) ? "viz-tree-node viz-tree-hot" : onPath.has(nd.id) ? "viz-tree-node viz-tree-path" : "viz-tree-node";
      return `<div class="${cls}" style="left:${nd.x}%;top:${nd.y}%">${nd.val}</div>`;
    })
    .join("");
  body.innerHTML = `<div class="viz-split"><div class="viz-memory"><div class="viz-frame-head">${escapeHtml(step.func)}(target=${session.target})</div><div class="viz-tree-canvas">${nodes}</div><p class="viz-dp-vars">remaining=${step.remaining}</p><p class="viz-focus-text">${escapeHtml(step.note || "")}</p></div></div>`;
}
