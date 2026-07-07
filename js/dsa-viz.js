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
}
