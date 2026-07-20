/**
 * Execution Studio — step-through memory visualizer (Python Tutor inspired).
 */
import { createListSession, renderListStudioRich } from "./list-viz.js?v=31";
import { createAvlSession, renderAvlStudioRich } from "./avl-viz.js?v=31";
import {
  createGridDfsSession,
  createGridBfsSession,
  createIntervalSession,
  createMonotonicStackSession,
  renderDsaStudioRich,
} from "./dsa-viz.js?v=31";

export function createSession(meta, opts = {}) {
  const viz = meta.visualization || "none";
  const algorithmText = opts.algorithmText || meta.vizAlgorithm || "";

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
  if (viz === "avl-tree" || (viz === "tree" && /avl/i.test(String(meta.pattern || meta.section || "")))) {
    return createAvlSession(meta);
  }
  if (viz === "tree") {
    const keys = String(meta.treeKeys || "50,30,70")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return { kind: "tree", steps: simulateTreeInsert(keys) };
  }
  if (viz === "linked-list") {
    return createListSession(meta);
  }
  if (viz === "grid-dfs") {
    return createGridDfsSession(meta);
  }
  if (viz === "grid-bfs") {
    return createGridBfsSession(meta);
  }
  if (viz === "intervals") {
    return createIntervalSession(meta);
  }
  if (viz === "monotonic-stack") {
    return createMonotonicStackSession(meta);
  }
  if (viz === "array-cells") {
    const cells = String(meta.tape || "0,1,2,3,4,5,6,7").split(",").map((s) => s.trim());
    return { kind: "array-cells", steps: simulateRingBuffer(cells), label: meta.arrayLabel || "buffer" };
  }
  if (viz === "generic" || viz === "none") {
    return createGenericSession(meta, algorithmText);
  }
  return createGenericSession(meta, algorithmText);
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
    renderListStudioRich(body, step, session);
  } else if (session.kind === "avl-tree") {
    renderAvlStudioRich(body, step, session);
  } else if (session.kind === "array-cells") {
    renderArrayStudio(body, step, session);
  } else if (
    session.kind === "grid-dfs" ||
    session.kind === "grid-bfs" ||
    session.kind === "intervals" ||
    session.kind === "monotonic-stack"
  ) {
    renderDsaStudioRich(body, session, step);
  } else if (session.kind === "generic") {
    renderGenericStudio(body, step, session);
  }

  container.appendChild(studio);
}

function renderArrayColumns(arr, opts = {}) {
  const { left, right, low, high, mid, charCells = false } = opts;
  return `<div class="viz-array-grid">${arr
    .map((val, i) => {
      const badges = [];
      if (left !== undefined && right !== undefined) {
        if (i === left && i === right) badges.push(`<span class="viz-ptr-badge viz-ptr-meet">● meet</span>`);
        else {
          if (i === left) badges.push(`<span class="viz-ptr-badge viz-ptr-left">↓ left</span>`);
          if (i === right) badges.push(`<span class="viz-ptr-badge viz-ptr-right">↓ right</span>`);
        }
      }
      if (low !== undefined && i === low) badges.push(`<span class="viz-ptr-badge viz-ptr-low">↓ low</span>`);
      if (mid !== undefined && i === mid) badges.push(`<span class="viz-ptr-badge viz-ptr-mid">↓ mid</span>`);
      if (high !== undefined && i === high) badges.push(`<span class="viz-ptr-badge viz-ptr-high">↓ high</span>`);

      let cellCls = "viz-cell";
      if (i === left) cellCls += " viz-cell-left";
      if (i === right) cellCls += " viz-cell-right";
      if (i === left && i === right) cellCls += " viz-cell-meet";
      if (i === low) cellCls += " viz-cell-low";
      if (i === mid) cellCls += " viz-cell-mid";
      if (i === high) cellCls += " viz-cell-high";

      const display = charCells ? `'${escapeHtml(String(val) === " " ? "␣" : val)}'` : escapeHtml(String(val));

      return `<div class="viz-array-col" data-col="${i}">
        <div class="viz-ptr-slot">${badges.join("")}</div>
        <span class="viz-idx">${i}</span>
        <span class="${cellCls}" data-cell="${i}">${display}</span>
        ${charCells ? `<span class="viz-type-tag">char</span>` : ""}
      </div>`;
    })
    .join("")}</div>`;
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
    t: extra.t ?? null,
    showT: extra.showT ?? false,
    prevLine: extra.prevLine ?? null,
    currLine: extra.currLine ?? null,
    note: extra.note || "",
    func: "reverseString",
  });

  steps.push(
    snap("init", {
      phaseLabel: "Enter function",
      currLine: 1,
      note: "Enter reverseString(char *s)",
    })
  );
  steps.push(
    snap("init-vars", {
      phaseLabel: "Init pointers",
      prevLine: 1,
      currLine: 2,
      note: `int left = 0;  int right = ${right};  (strlen(s)-1)`,
    })
  );
  steps.push(
    snap("check", {
      phaseLabel: "Loop test",
      prevLine: 2,
      currLine: 3,
      showT: false,
      note: `while (${left} < ${right})  →  true, enter loop body`,
    })
  );

  while (left < right) {
    const tVal = arr[left];
    steps.push(
      snap("save-t", {
        phaseLabel: "Save temp",
        t: tVal,
        showT: true,
        prevLine: 3,
        currLine: 4,
        note: `char t = s[${left}];  →  t = '${tVal}'`,
      })
    );
    arr[left] = arr[right];
    steps.push(
      snap("write-left", {
        phaseLabel: "Write left",
        t: tVal,
        showT: true,
        prevLine: 4,
        currLine: 5,
        note: `s[${left}] = s[${right}];  →  s[${left}] = '${arr[left]}'`,
      })
    );
    arr[right] = tVal;
    steps.push(
      snap("write-right", {
        phaseLabel: "Write right",
        t: tVal,
        showT: true,
        prevLine: 5,
        currLine: 6,
        note: `s[${right}] = t;  →  s[${right}] = '${tVal}'`,
      })
    );
    left += 1;
    right -= 1;
    steps.push(
      snap("advance", {
        phaseLabel: "Move pointers",
        showT: false,
        prevLine: 6,
        currLine: 7,
        note: `left++ → ${left};  right-- → ${right}`,
      })
    );
    if (left < right) {
      steps.push(
        snap("check", {
          phaseLabel: "Loop test",
          prevLine: 7,
          currLine: 3,
          showT: false,
          note: `while (${left} < ${right})  →  true, next swap`,
        })
      );
    }
  }

  steps.push(
    snap("done", {
      phaseLabel: "Complete",
      prevLine: 3,
      currLine: 8,
      showT: false,
      note: `while (${left} < ${right})  →  false.  String reversed in-place.`,
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
            ${renderArrayColumns(arr, { left, right, charCells: true })}
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
            ${
              step.showT
                ? `<div class="viz-var-row">
              <span class="viz-var-name">t</span>
              <span class="viz-var-type">char</span>
              <span class="viz-var-val">'${escapeHtml(String(step.t))}'</span>
            </div>`
                : ""
            }
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
            ${renderArrayColumns(arr, { low, high, mid: mid >= 0 ? mid : undefined })}
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

function renderArrayStudio(body, step) {
  const cells = step.cells || [];
  const hi = step.highlight ?? 0;
  body.innerHTML = `
    <div class="viz-split viz-split-single">
      <div class="viz-memory">
        <div class="viz-stack-label">MEMORY · ${escapeHtml(step.label || "array")}</div>
        <div class="viz-array-block">
          ${renderArrayColumns(cells, { mid: hi })}
        </div>
      </div>
    </div>`;
}

/* ── Generic visualizer (all other questions) ─────────────── */

function parseAlgorithmSteps(text) {
  if (!text) return [];
  const steps = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const m = trimmed.match(/^step\s*\d+\s*:\s*(.+)$/i);
    if (m) steps.push(m[1].trim());
  }
  return steps;
}

function createGenericSession(meta, algorithmText) {
  const algoLines = parseAlgorithmSteps(algorithmText);
  const fallback = ["Understand the problem and inputs", "Design helper function(s)", "Implement logic step by step", "Return result to main()"];
  const lines = algoLines.length ? algoLines : fallback;
  const category = meta.vizCategory || meta.pattern || meta.section || "general";
  const tape = meta.tape || "";
  const expected = (meta.expectedOutput || "").trim().split("\n")[0];

  const steps = lines.map((text, i) => ({
    phase: "algo",
    phaseLabel: `Step ${i + 1} of ${lines.length}`,
    algoText: text,
    algoIndex: i,
    category,
    tape,
    expected,
    prevLine: i > 0 ? i : null,
    currLine: i + 1,
    note: text,
    func: "algorithm",
  }));

  steps.push({
    phase: "verify",
    phaseLabel: "Verify output",
    category,
    expected,
    prevLine: lines.length,
    currLine: lines.length + 1,
    note: expected ? `Run Check — expected: ${expected}` : "Run your code and compare with Expected output.",
    func: "main",
  });

  return { kind: "generic", steps, meta, algoLines: lines };
}

function renderGenericStudio(body, step, session) {
  const lines = session.algoLines || [];
  const codeLines = lines.map((text, i) => ({
    text: `// ${i + 1}. ${text}`,
    id: i + 1,
  }));
  if (step.phase === "verify") {
    codeLines.push({ text: "int main() {  /* provided */  return 0; }", id: lines.length + 1 });
  }

  body.innerHTML = `
    <div class="viz-split">
      ${renderCodeRail(codeLines.length ? codeLines : [{ text: "// Write your helper here", id: 1 }], step)}
      <div class="viz-memory">
        <div class="viz-stack-label">${escapeHtml(String(step.category || "program").slice(0, 48))}</div>
        ${renderGenericContext(step)}
      </div>
    </div>`;
}

function renderGenericContext(step) {
  const cat = String(step.category || "").toLowerCase();

  if (cat.includes("bit")) {
    const bits = (step.algoIndex + 1).toString(2).padStart(8, "0");
    return `<div class="viz-frame">
      <div class="viz-frame-head">Bit manipulation</div>
      <div class="viz-bit-row">${bits.split("").map((b, i) => `<span class="viz-bit ${b === "1" ? "viz-bit-on" : ""}">${b}<small>${7 - i}</small></span>`).join("")}</div>
      <p class="viz-focus-text">${escapeHtml(step.algoText || "")}</p>
    </div>`;
  }

  if (step.tape && step.tape.length <= 40) {
    const chars = step.tape.split("");
    const pos = step.algoIndex % Math.max(chars.length, 1);
    return `<div class="viz-frame">
      <div class="viz-frame-head">Data</div>
      ${renderArrayColumns(chars, { left: pos, right: Math.min(pos + 1, chars.length - 1), charCells: true })}
      <p class="viz-focus-text">${escapeHtml(step.algoText || "")}</p>
    </div>`;
  }

  if (step.expected) {
    return `<div class="viz-frame">
      <div class="viz-frame-head">${step.phase === "verify" ? "Expected result" : "Current focus"}</div>
      ${step.phase === "verify" ? `<pre class="viz-expected-box">${escapeHtml(step.expected)}</pre>` : `<p class="viz-focus-text">${escapeHtml(step.algoText || step.note || "")}</p>`}
    </div>`;
  }

  return `<div class="viz-frame">
    <div class="viz-frame-head">Algorithm step</div>
    <p class="viz-focus-text">${escapeHtml(step.algoText || step.note || "")}</p>
  </div>`;
}
