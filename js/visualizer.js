/**
 * Execution Studio — step-through memory visualizer (Python Tutor inspired).
 */
export function createSession(meta) {
  const viz = meta.visualization || "none";
  if (viz === "two-pointer") {
    const tape = String(meta.tape || "hello");
    const title = meta.title || "";
    if (/reverse/i.test(title) && !/subsequence|word|duplicate|zero|dups/i.test(title)) {
      return { kind: "two-pointer-reverse", steps: simulateReverseString(tape), tape };
    }
    return { kind: "two-pointer", steps: enrichTwoPointerSteps(tape, meta.trace || []), tape };
  }
  if (viz === "binary-search") {
    const values = String(meta.tape || "1,3,5,7,9,11")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const target = parseInt(meta.target, 10) || values[Math.floor(values.length / 2)] || 7;
    return { kind: "binary-search", steps: simulateBinarySearch(values, target), target };
  }
  if (viz === "tree") {
    const keys = String(meta.treeKeys || "50,30,70")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return { kind: "tree", steps: simulateTreeInsert(keys) };
  }
  if (viz === "linked-list") {
    const nodes = String(meta.listNodes || "1,2,3,4,5")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { kind: "linked-list", steps: simulateListWalk(nodes) };
  }
  if (viz === "array-cells") {
    const cells = String(meta.tape || "0,1,2,3,4,5,6,7").split(",").map((s) => s.trim());
    return { kind: "array-cells", steps: simulateRingBuffer(cells), label: meta.arrayLabel || "buffer" };
  }
  return { kind: "none", steps: [] };
}

export function stepCount(session) {
  return session.steps.length || 0;
}

export function renderStudio(container, session, stepIndex) {
  container.innerHTML = "";
  if (!session.steps.length) return;

  const idx = Math.max(0, Math.min(stepIndex, session.steps.length - 1));
  const step = session.steps[idx];
  const total = session.steps.length;

  const studio = document.createElement("div");
  studio.className = "viz-studio";
  studio.innerHTML = `
    <div class="viz-topbar">
      <span class="viz-brand">Execution Studio</span>
      <span class="viz-step-pill">Step ${idx + 1} / ${total}</span>
      <span class="viz-phase">${escapeHtml(step.phaseLabel || step.phase || "")}</span>
    </div>
    <div class="viz-body" data-viz-body></div>
    <div class="viz-narration">${escapeHtml(step.note || "")}</div>`;

  const body = studio.querySelector("[data-viz-body]");
  if (session.kind === "two-pointer-reverse" || session.kind === "two-pointer") {
    renderTwoPointerStudio(body, step, session);
  } else if (session.kind === "binary-search") {
    renderBinarySearchStudio(body, step, session);
  } else if (session.kind === "tree") {
    renderTreeStudio(body, step, session);
  } else if (session.kind === "linked-list") {
    renderListStudio(body, step, session);
  } else if (session.kind === "array-cells") {
    renderArrayStudio(body, step, session);
  }

  container.appendChild(studio);
  requestAnimationFrame(() => drawPointerArrows(studio));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Simulators ───────────────────────────────────────────── */

function simulateReverseString(str) {
  const arr = str.split("");
  const steps = [];
  let left = 0;
  let right = arr.length - 1;

  const snap = (phase, extra = {}) => ({
    phase,
    phaseLabel: extra.phaseLabel || phaseLabel(phase),
    arr: [...arr],
    left,
    right,
    t: extra.t ?? "—",
    prevLine: extra.prevLine ?? null,
    currLine: extra.currLine ?? null,
    note: extra.note || "",
    func: "reverseString",
  });

  steps.push(
    snap("init", {
      phaseLabel: "Enter function",
      currLine: 1,
      note: `Setup: left=0, right=${right} (last index of "${str}")`,
    })
  );
  steps.push(
    snap("check", {
      currLine: 2,
      note: left < right ? `while (${left} < ${right}) → true, enter loop` : "Loop finished",
    })
  );

  while (left < right) {
    const tVal = arr[left];
    steps.push(
      snap("save-t", {
        t: tVal,
        prevLine: 2,
        currLine: 3,
        note: `char t = s[${left}];  →  save '${tVal}' before overwrite`,
      })
    );
    arr[left] = arr[right];
    steps.push(
      snap("write-left", {
        t: tVal,
        prevLine: 3,
        currLine: 4,
        note: `s[${left}] = s[${right}];  →  copy '${arr[left]}' to left slot`,
      })
    );
    arr[right] = tVal;
    steps.push(
      snap("write-right", {
        t: "—",
        prevLine: 4,
        currLine: 5,
        note: `s[${right}] = t;  →  write saved '${tVal}' to right slot`,
      })
    );
    left += 1;
    right -= 1;
    steps.push(
      snap("advance", {
        prevLine: 5,
        currLine: 6,
        note: `left++ → ${left},  right-- → ${right}`,
      })
    );
    if (left < right) {
      steps.push(
        snap("check", {
          currLine: 2,
          note: `while (${left} < ${right}) → true, next swap`,
        })
      );
    }
  }

  steps.push(
    snap("done", {
      phaseLabel: "Complete",
      prevLine: 2,
      currLine: null,
      note: left >= right ? "Pointers met in the middle — string reversed in-place." : "Loop exit — done.",
    })
  );
  return steps;
}

function enrichTwoPointerSteps(tape, trace) {
  if (!trace.length) return simulateReverseString(tape).slice(0, 3);
  const arr = tape.split("");
  return trace.map((t, i) => ({
    phase: "scan",
    phaseLabel: `Scan ${i + 1}`,
    arr: [...arr],
    left: t.left ?? 0,
    right: t.right ?? arr.length - 1,
    t: "—",
    currLine: 2,
    note: t.note || `left=${t.left}, right=${t.right}`,
    func: "helper()",
  }));
}

function simulateBinarySearch(arr, target) {
  const steps = [];
  let low = 0;
  let high = arr.length - 1;

  const snap = (phase, mid, extra = {}) => ({
    phase,
    phaseLabel: extra.phaseLabel || phase,
    arr: [...arr],
    low,
    high,
    mid,
    target,
    prevLine: extra.prevLine ?? null,
    currLine: extra.currLine ?? null,
    note: extra.note || "",
    func: "binarySearch",
  });

  steps.push(snap("init", 0, { phaseLabel: "Setup", currLine: 1, note: `Search ${target} in sorted array [${arr.join(", ")}]` }));

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    steps.push(
      snap("mid", mid, {
        phaseLabel: "Compute mid",
        currLine: 3,
        note: `mid = ${low} + (${high}-${low})/2 = ${mid}  →  arr[${mid}]=${arr[mid]}`,
      })
    );
    if (arr[mid] === target) {
      steps.push(
        snap("found", mid, {
          phaseLabel: "Found!",
          prevLine: 4,
          note: `arr[${mid}] == ${target}  →  return ${mid}`,
        })
      );
      return steps;
    }
    if (arr[mid] < target) {
      steps.push(
        snap("go-right", mid, {
          phaseLabel: "Go right",
          prevLine: 5,
          currLine: 6,
          note: `${arr[mid]} < ${target}  →  low = mid+1 = ${mid + 1}`,
        })
      );
      low = mid + 1;
    } else {
      steps.push(
        snap("go-left", mid, {
          phaseLabel: "Go left",
          prevLine: 5,
          currLine: 7,
          note: `${arr[mid]} > ${target}  →  high = mid-1 = ${mid - 1}`,
        })
      );
      high = mid - 1;
    }
  }
  steps.push(
    snap("miss", -1, {
      phaseLabel: "Not found",
      note: `low > high  →  return -1`,
    })
  );
  return steps;
}

function insertBst(root, val) {
  if (!root) return { id: val, left: null, right: null };
  const node = { id: root.id, left: root.left, right: root.right };
  if (val < node.id) node.left = insertBst(node.left, val);
  else if (val > node.id) node.right = insertBst(node.right, val);
  return node;
}

function treeLevels(root) {
  if (!root) return [];
  const levels = [];
  let q = [root];
  while (q.length) {
    levels.push(q.map((n) => (n ? n.id : null)));
    q = q.flatMap((n) => (n ? [n.left, n.right] : [null, null]));
    if (q.every((n) => n === null)) break;
  }
  return levels;
}

function simulateTreeInsert(keys) {
  let root = null;
  const steps = [];
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    steps.push({
      phase: "insert",
      phaseLabel: `Insert ${k}`,
      key: k,
      levels: root ? treeLevels(root) : [],
      note: i === 0 ? `Create root node ${k}` : `BST-insert ${k}, then rebalance if AVL`,
      func: "bstInsert",
      currLine: 2,
    });
    root = insertBst(root, k);
    steps.push({
      phase: "done-key",
      phaseLabel: `After ${k}`,
      key: k,
      levels: treeLevels(root),
      note: `Tree now holds keys: ${keys.slice(0, i + 1).join(" → ")}`,
      func: "bstInsert",
    });
  }
  return steps;
}

function simulateListWalk(nodes) {
  return nodes.map((val, i) => ({
    phase: "walk",
    phaseLabel: `Node ${i}`,
    nodes: [...nodes],
    head: 0,
    curr: i,
    note: i === 0 ? "head points to first node" : `Advance to node ${i} (value ${val})`,
    func: "traverse",
    currLine: 2,
  }));
}

function simulateRingBuffer(cells) {
  return cells.map((_, i) => ({
    phase: "slot",
    phaseLabel: `Index ${i}`,
    cells: [...cells],
    highlight: i,
    note: `Inspect slot ${i} — ring buffer wraps at capacity`,
    func: "ringBuffer",
    currLine: 1,
  }));
}

function phaseLabel(phase) {
  const map = {
    init: "Setup",
    check: "Loop test",
    "save-t": "Save temp",
    "write-left": "Write left",
    "write-right": "Write right",
    advance: "Move pointers",
    done: "Complete",
    scan: "Scan",
  };
  return map[phase] || phase;
}

/* ── Renderers ────────────────────────────────────────────── */

const REVERSE_SNIPPET = [
  { text: "void reverseString(char *s) {", id: 1 },
  { text: "    int left = 0, right = strlen(s)-1;", id: 2 },
  { text: "    while (left < right) {", id: 3 },
  { text: "        char t = s[left];", id: 4 },
  { text: "        s[left]  = s[right];", id: 5 },
  { text: "        s[right] = t;", id: 6 },
  { text: "        left++; right--;", id: 7 },
  { text: "    }", id: 8 },
  { text: "}", id: 9 },
];

const BINARY_SNIPPET = [
  { text: "int binarySearch(int arr[], int n, int target) {", id: 1 },
  { text: "    int low = 0, high = n-1;", id: 2 },
  { text: "    while (low <= high) {", id: 3 },
  { text: "        int mid = low + (high-low)/2;", id: 4 },
  { text: "        if (arr[mid] == target) return mid;", id: 5 },
  { text: "        if (arr[mid] < target) low = mid+1;", id: 6 },
  { text: "        else high = mid-1;", id: 7 },
  { text: "    }", id: 8 },
  { text: "    return -1;", id: 9 },
  { text: "}", id: 10 },
];

function renderCodeRail(lines, step) {
  const prev = step.prevLine;
  const curr = step.currLine;
  return `<div class="viz-code-rail">
    <div class="viz-code-title">${escapeHtml(step.func || "code")}()</div>
    <pre class="viz-code">${lines
      .map((ln) => {
        let cls = "viz-code-line";
        if (ln.id === prev) cls += " viz-line-prev";
        if (ln.id === curr) cls += " viz-line-curr";
        return `<div class="${cls}"><span class="viz-ln">${ln.id}</span>${escapeHtml(ln.text)}</div>`;
      })
      .join("")}</pre>
    <div class="viz-code-legend">
      <span class="viz-leg-prev">▸ just executed</span>
      <span class="viz-leg-curr">▸ next line</span>
    </div>
  </div>`;
}

function renderTwoPointerStudio(body, step, session) {
  const arr = step.arr || session.tape.split("");
  const left = step.left ?? 0;
  const right = step.right ?? arr.length - 1;
  const snippet = session.kind === "two-pointer-reverse" ? REVERSE_SNIPPET : REVERSE_SNIPPET;

  body.innerHTML = `
    <div class="viz-split">
      ${renderCodeRail(snippet, step)}
      <div class="viz-memory">
        <div class="viz-stack-label">STACK</div>
        <div class="viz-frame">
          <div class="viz-frame-head">${escapeHtml(step.func || "reverseString")}()</div>
          <div class="viz-var-row">
            <span class="viz-var-name">s</span>
            <span class="viz-var-type">char*</span>
            <span class="viz-var-val viz-var-pointer">→ array below</span>
          </div>
          <div class="viz-array-block" data-viz-array>
            <div class="viz-array-caption">char s[] on stack (via main)</div>
            <div class="viz-array-indices">${arr.map((_, i) => `<span class="viz-idx" data-idx="${i}">${i}</span>`).join("")}</div>
            <div class="viz-array-cells">${arr
              .map((c, i) => {
                let cls = "viz-cell";
                if (i === left) cls += " viz-cell-left";
                if (i === right) cls += " viz-cell-right";
                if (i === left && i === right) cls += " viz-cell-meet";
                return `<span class="${cls}" data-cell="${i}">'${escapeHtml(c === " " ? "␣" : c)}'</span>`;
              })
              .join("")}</div>
            <div class="viz-array-types">${arr.map(() => `<span class="viz-type-tag">char</span>`).join("")}</div>
            <svg class="viz-arrow-layer" data-arrow-layer aria-hidden="true"></svg>
          </div>
          <div class="viz-locals">
            <div class="viz-var-row" data-var-left>
              <span class="viz-var-name">left</span>
              <span class="viz-var-type">int</span>
              <span class="viz-var-val viz-val-left">${left}</span>
            </div>
            <div class="viz-var-row" data-var-right>
              <span class="viz-var-name">right</span>
              <span class="viz-var-type">int</span>
              <span class="viz-var-val viz-val-right">${right}</span>
            </div>
            <div class="viz-var-row">
              <span class="viz-var-name">t</span>
              <span class="viz-var-type">char</span>
              <span class="viz-var-val">${step.t === "—" ? "—" : `'${escapeHtml(step.t)}'`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderBinarySearchStudio(body, step, session) {
  const arr = step.arr || [];
  const { low = 0, high = arr.length - 1, mid = 0, target } = step;

  body.innerHTML = `
    <div class="viz-split">
      ${renderCodeRail(BINARY_SNIPPET, step)}
      <div class="viz-memory">
        <div class="viz-stack-label">STACK · binary search</div>
        <div class="viz-frame">
          <div class="viz-frame-head">binarySearch()</div>
          <div class="viz-var-row"><span class="viz-var-name">target</span><span class="viz-var-type">int</span><span class="viz-var-val">${target}</span></div>
          <div class="viz-array-block" data-viz-array>
            <div class="viz-array-indices">${arr.map((_, i) => `<span class="viz-idx">${i}</span>`).join("")}</div>
            <div class="viz-array-cells">${arr
              .map((v, i) => {
                let cls = "viz-cell";
                if (i === low) cls += " viz-cell-low";
                if (i === high) cls += " viz-cell-high";
                if (i === mid) cls += " viz-cell-mid";
                return `<span class="${cls}">${v}</span>`;
              })
              .join("")}</div>
          </div>
          <div class="viz-locals">
            <div class="viz-var-row"><span class="viz-var-name">low</span><span class="viz-var-type">int</span><span class="viz-var-val viz-val-low">${low}</span></div>
            <div class="viz-var-row"><span class="viz-var-name">mid</span><span class="viz-var-type">int</span><span class="viz-var-val viz-val-mid">${mid >= 0 ? mid : "—"}</span></div>
            <div class="viz-var-row"><span class="viz-var-name">high</span><span class="viz-var-type">int</span><span class="viz-var-val viz-val-high">${high}</span></div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderTreeStudio(body, step) {
  const levels = step.levels || (step.tree ? treeLevels(step.tree) : []);
  const rows = levels.length
    ? levels
        .map(
          (level) =>
            `<div class="viz-tree-row">${level
              .map((v) =>
                v === null
                  ? `<span class="viz-tree-node viz-tree-null">·</span>`
                  : `<span class="viz-tree-node ${v === step.key ? "viz-tree-new" : ""}">${v}</span>`
              )
              .join("")}</div>`
        )
        .join("")
    : `<div class="viz-tree-empty">Insert first key…</div>`;

  body.innerHTML = `
    <div class="viz-split viz-split-single">
      <div class="viz-memory viz-tree-panel">
        <div class="viz-stack-label">HEAP · tree nodes</div>
        <div class="viz-frame">
          <div class="viz-frame-head">${escapeHtml(step.func || "bstInsert")}(${step.key ?? "?"})</div>
          <div class="viz-tree-canvas">${rows}</div>
        </div>
      </div>
    </div>`;
}

function renderListStudio(body, step) {
  const nodes = step.nodes || [];
  const curr = step.curr ?? 0;
  body.innerHTML = `
    <div class="viz-split viz-split-single">
      <div class="viz-memory">
        <div class="viz-stack-label">HEAP · linked nodes</div>
        <div class="viz-list-canvas">${nodes
          .map(
            (v, i) =>
              `<span class="viz-list-box ${i === curr ? "viz-list-curr" : ""}">${escapeHtml(v)}</span>${
                i < nodes.length - 1 ? `<span class="viz-list-link">next →</span>` : `<span class="viz-list-null">NULL</span>`
              }`
          )
          .join("")}</div>
        <div class="viz-var-row"><span class="viz-var-name">curr</span><span class="viz-var-type">Node*</span><span class="viz-var-val">node ${curr}</span></div>
      </div>
    </div>`;
}

function renderArrayStudio(body, step) {
  const cells = step.cells || [];
  const hi = step.highlight ?? 0;
  body.innerHTML = `
    <div class="viz-split viz-split-single">
      <div class="viz-memory">
        <div class="viz-stack-label">MEMORY · ${escapeHtml(step.label || "array")}</div>
        <div class="viz-array-block">
          <div class="viz-array-indices">${cells.map((_, i) => `<span class="viz-idx">${i}</span>`).join("")}</div>
          <div class="viz-array-cells">${cells
            .map((v, i) => `<span class="viz-cell ${i === hi ? "viz-cell-mid" : ""}">${escapeHtml(v)}</span>`)
            .join("")}</div>
        </div>
      </div>
    </div>`;
}

function drawPointerArrows(studio) {
  const layer = studio.querySelector("[data-arrow-layer]");
  const block = studio.querySelector("[data-viz-array]");
  if (!layer || !block) return;

  const leftVal = studio.querySelector(".viz-val-left");
  const rightVal = studio.querySelector(".viz-val-right");
  if (!leftVal || !rightVal) return;

  const leftIdx = parseInt(leftVal.textContent, 10);
  const rightIdx = parseInt(rightVal.textContent, 10);
  const blockRect = block.getBoundingClientRect();

  layer.setAttribute("width", block.offsetWidth);
  layer.setAttribute("height", block.offsetHeight);
  layer.innerHTML = "";

  const cellLeft = block.querySelector(`[data-cell="${leftIdx}"]`);
  const cellRight = block.querySelector(`[data-cell="${rightIdx}"]`);
  if (!cellLeft || !cellRight) return;

  const lr = cellLeft.getBoundingClientRect();
  const rr = cellRight.getBoundingClientRect();
  const x1 = lr.left + lr.width / 2 - blockRect.left;
  const x2 = rr.left + rr.width / 2 - blockRect.left;
  const yTop = 8;
  const yBot = block.offsetHeight - 6;

  layer.innerHTML = `
    <line x1="${x1}" y1="${yTop}" x2="${x1}" y2="${yBot - 28}" class="viz-svg-left"/>
    <polygon points="${x1 - 4},${yBot - 28} ${x1 + 4},${yBot - 28} ${x1},${yBot - 22}" class="viz-svg-left"/>
    <text x="${x1}" y="${yTop - 2}" class="viz-svg-label viz-svg-label-left">left</text>
    <line x1="${x2}" y1="${yTop}" x2="${x2}" y2="${yBot - 28}" class="viz-svg-right"/>
    <polygon points="${x2 - 4},${yBot - 28} ${x2 + 4},${yBot - 28} ${x2},${yBot - 22}" class="viz-svg-right"/>
    <text x="${x2}" y="${yTop - 2}" class="viz-svg-label viz-svg-label-right">right</text>`;
}
