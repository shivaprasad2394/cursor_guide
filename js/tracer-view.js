/**
 * tracer-view.js — renders one step of a live C trace (from ctracer.js).
 * Python Tutor conventions: green arrow = line just executed, red arrow =
 * next line to execute; values that changed since the previous step are
 * highlighted so the effect of each line is obvious.
 */

const PTR_COLORS = ["viz-ptr-left", "viz-ptr-right", "viz-ptr-mid", "viz-ptr-low", "viz-ptr-high"];
const BIT_INDEX_NAMES = new Set(["pos", "bit"]);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sourceHasBitwise(source) {
  return /<<|>>|(?:\|(?!\|))|(?:&(?![&]))|\^|~|0x[0-9a-fA-F]+|[0-9]+[uU]/.test(source);
}

function parseScalar(text) {
  const t = String(text).trim();
  if (!/^-?\d+$/.test(t)) return null;
  return Number(t);
}

function registerWidth(values) {
  const max = Math.max(...values.map((v) => Math.abs(v)));
  if (max <= 0xff) return 8;
  if (max <= 0xffff) return 16;
  return 32;
}

function renderBitRow(value, width, highlightPositions, changed) {
  const u = value >>> 0;
  const bin = (u >>> 0).toString(2).padStart(width, "0");
  const bits = bin.split("").map((b, i) => {
    const pos = width - 1 - i;
    const on = highlightPositions && highlightPositions.has(pos);
    return `<span class="viz-bit ${b === "1" ? "viz-bit-on" : ""} ${on ? "viz-bit-pos" : ""} ${changed ? "viz-cell-changed" : ""}">${b}<small>${pos}</small></span>`;
  }).join("");
  const hex = `0x${(u >>> 0).toString(16).toUpperCase().padStart(Math.ceil(width / 4), "0")}`;
  return { bits, hex, dec: String(value) };
}

function renderRegisters(step, prev, source) {
  if (!sourceHasBitwise(source)) return "";
  const activeFr = step.frames[step.frames.length - 1];
  if (!activeFr) return "";

  const prevVarText = new Map();
  if (prev) {
    const pfr = prev.frames[prev.frames.length - 1];
    if (pfr) pfr.vars.forEach((v) => prevVarText.set(v.name, v.text));
  }

  const highlightPositions = new Set();
  activeFr.vars.forEach((v) => {
    if (!BIT_INDEX_NAMES.has(v.name)) return;
    const p = parseScalar(v.text);
    if (p !== null && p >= 0) highlightPositions.add(p);
  });

  const regs = activeFr.vars
    .map((v) => {
      if (v.ptr || BIT_INDEX_NAMES.has(v.name)) return null;
      const num = parseScalar(v.text);
      if (num === null) return null;
      return { name: v.name, value: num, changed: prevVarText.has(v.name) && prevVarText.get(v.name) !== v.text };
    })
    .filter(Boolean);

  if (!regs.length) return "";

  const width = registerWidth(regs.map((r) => r.value));
  const rows = regs.map((r) => {
    const { bits, hex, dec } = renderBitRow(r.value, width, highlightPositions, r.changed);
    return `<div class="viz-reg-row ${r.changed ? "viz-var-changed" : ""}">
      <div class="viz-reg-head">
        <span class="viz-reg-name">${escapeHtml(r.name)}</span>
        <span class="viz-reg-meta"><span class="viz-reg-dec">${escapeHtml(dec)}</span> <span class="viz-reg-hex">${escapeHtml(hex)}</span></span>
      </div>
      <div class="viz-bit-row">${bits}</div>
    </div>`;
  }).join("");

  const posNote = highlightPositions.size
    ? `<div class="viz-reg-note">Highlighted bit${highlightPositions.size > 1 ? "s" : ""}: ${[...highlightPositions].sort((a, b) => a - b).join(", ")}</div>`
    : "";

  return `<div class="viz-array-block viz-reg-block">
    <div class="viz-array-caption">REGISTERS · ${width}-bit</div>
    ${rows}
    ${posNote}
  </div>`;
}

function fieldNextIdx(fields) {
  const f = fields.next;
  if (!f || f.type !== "ptr" || f.stIdx === null || f.stIdx === undefined) return null;
  return f.stIdx;
}

function renderStructNode(node, hot, ptrOn, changed) {
  const badges = (ptrOn[node.idx] || [])
    .map(
      (name, i) =>
        `<span class="viz-ll-ptr-badge ${PTR_COLORS[i % PTR_COLORS.length]}">${escapeHtml(name)}</span>`
    )
    .join("");
  const rows = Object.entries(node.fields)
    .map(([fname, fval]) => {
      let text = "—";
      if (fval.type === "scalar") text = String(fval.val);
      else if (fval.type === "ptr") text = fval.stIdx === null || fval.stIdx === undefined ? "NULL" : `→ @${fval.stIdx}`;
      return `<div class="viz-ll-row"><span>${escapeHtml(fname)}</span><span class="viz-ll-val">${escapeHtml(text)}</span></div>`;
    })
    .join("");
  return `<div class="viz-ll-node ${hot.has(node.idx) ? "viz-ll-hot" : ""} ${changed ? "viz-cell-changed" : ""}">
    <div class="viz-ll-ptr-slot">${badges}</div>
    <div class="viz-ll-node-head">${escapeHtml(node.name)}@${node.idx}</div>
    ${rows}
  </div>`;
}

function renderStructHeap(step, prev) {
  const heap = step.heap || [];
  if (!heap.length) return "";

  const byIdx = new Map(heap.map((n) => [n.idx, n]));
  const hot = new Set();
  const ptrOn = {};
  step.frames.forEach((fr) => {
    fr.vars.forEach((v) => {
      if (v.ptr && v.ptr.structIdx !== undefined) {
        hot.add(v.ptr.structIdx);
        if (!ptrOn[v.ptr.structIdx]) ptrOn[v.ptr.structIdx] = [];
        ptrOn[v.ptr.structIdx].push(v.name);
      }
    });
  });

  const prevNodes = new Map();
  if (prev && prev.heap) {
    prev.heap.forEach((n) => prevNodes.set(n.idx, JSON.stringify(n.fields)));
  }
  const nodeChanged = (node) => {
    const key = node.idx;
    return prevNodes.has(key) && prevNodes.get(key) !== JSON.stringify(node.fields);
  };

  const pointedTo = new Set();
  heap.forEach((n) => {
    const next = fieldNextIdx(n.fields);
    if (next !== null) pointedTo.add(next);
  });
  const heads = heap.filter((n) => !pointedTo.has(n.idx));

  const inChain = new Set();
  const renderChain = (startIdx) => {
    let html = "";
    let cur = startIdx;
    const seen = new Set();
    while (cur !== null && !seen.has(cur)) {
      seen.add(cur);
      inChain.add(cur);
      const node = byIdx.get(cur);
      if (!node) break;
      html += renderStructNode(node, hot, ptrOn, nodeChanged(node));
      const next = fieldNextIdx(node.fields);
      if (next !== null) html += '<div class="viz-ll-edge">→</div>';
      cur = next;
    }
    html += '<div class="viz-ll-null">NULL</div>';
    return html;
  };

  let chainsHtml = "";
  if (heads.length) {
    chainsHtml = heads
      .map((h) => `<div class="viz-ll-canvas">${renderChain(h.idx)}</div>`)
      .join("");
  }

  const orphans = heap.filter((n) => !inChain.has(n.idx));
  let orphanHtml = "";
  if (orphans.length) {
    orphanHtml = `<div class="viz-ll-row-label">allocated (not linked yet)</div><div class="viz-ll-canvas">${orphans
      .map((n) => renderStructNode(n, hot, ptrOn, nodeChanged(n)))
      .join("")}</div>`;
  }

  if (!chainsHtml && !orphanHtml) {
    orphanHtml = `<div class="viz-ll-canvas">${heap
      .map((n) => renderStructNode(n, hot, ptrOn, nodeChanged(n)))
      .join("")}</div>`;
  }

  return `<div class="viz-array-block">
    <div class="viz-array-caption">heap · linked nodes</div>
    ${chainsHtml}${orphanHtml}
  </div>`;
}

export function renderTraceStep(container, trace, source, idx) {
  const step = trace.steps[idx];
  const prev = idx > 0 ? trace.steps[idx - 1] : null;
  const prevLine = prev ? prev.line : 0;
  const lines = source.split("\n");

  /* what changed since the previous snapshot? */
  const prevVarText = new Map();
  if (prev) {
    prev.frames.forEach((fr, fi) => {
      fr.vars.forEach((v) => prevVarText.set(`${fi}:${fr.name}:${v.name}`, v.text));
    });
  }
  const changedVar = (fi, frName, v) => {
    if (!prev) return false;
    const key = `${fi}:${frName}:${v.name}`;
    return !prevVarText.has(key) || prevVarText.get(key) !== v.text;
  };
  const prevCellVals = new Map();
  if (prev) {
    prev.arrays.forEach((arr, ai) => {
      arr.cells.forEach((c) => {
        if (typeof c === "object") prevCellVals.set(`${ai}:${c.idx}`, c.val);
      });
    });
  }
  const cellChanged = (ai, idx, val) => {
    const key = `${ai}:${idx}`;
    return prevCellVals.has(key) && prevCellVals.get(key) !== val;
  };
  const outputGrew = prev ? step.output.length > prev.output.length : step.output.length > 0;

  /* code rail with dual arrows */
  const codeHtml = lines
    .map((text, i) => {
      const ln = i + 1;
      let cls = "viz-code-line";
      if (ln === step.line) cls += " viz-line-curr";
      else if (ln === prevLine) cls += " viz-line-prev";
      const arrows =
        (ln === prevLine ? '<span class="viz-arr-prev">➜</span>' : "") +
        (ln === step.line ? '<span class="viz-arr-next">➜</span>' : "");
      return `<div class="${cls}" data-line="${ln}"><span class="viz-arr-slot">${arrows}</span><span class="viz-ln">${ln}</span>${escapeHtml(text) || " "}</div>`;
    })
    .join("");

  const framesHtml = step.frames.length
    ? step.frames
        .map(
          (fr, fi) => `<div class="viz-frame ${fi === step.frames.length - 1 ? "viz-frame-active" : ""}">
        <div class="viz-frame-head">${escapeHtml(fr.name)}()</div>
        ${fr.vars
          .map((v) => {
            const chg = changedVar(fi, fr.name, v);
            return `<div class="viz-var-row ${chg ? "viz-var-changed" : ""}">
            <span class="viz-var-name">${escapeHtml(v.name)}</span>
            <span class="viz-var-type"></span>
            <span class="viz-var-val ${v.ptr ? "viz-var-pointer" : ""}">${escapeHtml(v.text)}${chg ? '<span class="viz-chg-dot" title="changed this step">●</span>' : ""}</span>
          </div>`;
          })
          .join("")}
      </div>`
        )
        .join("")
    : `<div class="viz-frame"><div class="viz-frame-head">(program end)</div></div>`;

  /* hide anonymous string-literal blocks nobody points at (format strings etc.) */
  const arraysHtml = step.arrays
    .map((arr, ai) => {
      if (arr.label.startsWith('"') && !arr.ptrs.length) return "";
      const cols = arr.cells
        .map((cell) => {
          const idx = typeof cell === "object" ? cell.idx : arr.cells.indexOf(cell);
          const val = typeof cell === "object" ? cell.val : cell;
          const badges = arr.ptrs
            .filter((p) => p.off === idx)
            .map((p, bi) => `<span class="viz-ptr-badge ${PTR_COLORS[bi % PTR_COLORS.length]}">↓ ${escapeHtml(p.name)}</span>`)
            .join("");
          const hot =
            arr.activeOff !== undefined && arr.activeOff !== null
              ? arr.activeOff === idx
              : arr.ptrs.some((p) => p.off === idx);
          const chg = cellChanged(ai, idx, val);
          return `<div class="viz-array-col">
            <div class="viz-ptr-slot">${badges}</div>
            <span class="viz-idx">${idx}</span>
            <span class="viz-cell ${hot ? "viz-cell-mid" : ""} ${chg ? "viz-cell-changed" : ""}">${escapeHtml(val)}</span>
          </div>`;
        })
        .join("");
      return `<div class="viz-array-block">
        <div class="viz-array-caption">${escapeHtml(arr.label)}${arr.more ? " (first 32)" : ""}</div>
        <div class="viz-array-grid">${cols}</div>
      </div>`;
    })
    .join("");

  const heapHtml = renderStructHeap(step, prev);
  const registersHtml = renderRegisters(step, prev, source);
  const memoryHtml = [registersHtml, heapHtml, arraysHtml].filter(Boolean).join("");

  /* narration: what just ran, what runs next */
  const srcLine = (n) => (n >= 1 && n <= lines.length ? lines[n - 1].trim().slice(0, 90) : "");
  let narration = "";
  if (prevLine && srcLine(prevLine)) {
    narration += `<span class="viz-narr-prev">➜ just executed:</span> <code>${escapeHtml(srcLine(prevLine))}</code> `;
  }
  if (step.line && srcLine(step.line)) {
    narration += `<span class="viz-narr-next">➜ next:</span> <code>${escapeHtml(srcLine(step.line))}</code>`;
  } else if (step.note) {
    narration += escapeHtml(step.note);
  }

  container.innerHTML = `
    <div class="viz-studio studio-full">
      <div class="viz-topbar">
        <span class="viz-brand">Live C trace</span>
        <span class="viz-step-pill">Step ${idx + 1} / ${trace.steps.length}</span>
        <span class="viz-phase">${escapeHtml(step.phase)}</span>
      </div>
      <div class="viz-body">
        <div class="viz-split studio-split">
          <div class="viz-code-rail studio-code-rail" data-role="code-rail">
            <div class="viz-code-title">your program</div>
            <pre class="viz-code">${codeHtml}</pre>
            <div class="viz-code-legend">
              <span class="viz-legend-prev">➜ line just executed</span>
              <span class="viz-legend-next">➜ next line to execute</span>
            </div>
          </div>
          <div class="viz-memory">
            <div class="viz-state-split">
              <div class="viz-stack-pane">
                <div class="viz-stack-label">STACK</div>
                ${framesHtml}
              </div>
              <div class="viz-mem-pane">
                <div class="viz-stack-label">MEMORY</div>
                ${memoryHtml || '<p class="viz-mem-empty">(empty)</p>'}
              </div>
            </div>
            <div class="viz-output-pane">
              <div class="viz-stack-label">OUTPUT</div>
              <pre class="studio-output ${outputGrew ? "studio-output-new" : ""}">${escapeHtml(step.output) || "(none yet)"}</pre>
            </div>
          </div>
        </div>
      </div>
      <div class="viz-narration">${narration}</div>
    </div>`;

  const rail = container.querySelector('[data-role="code-rail"]');
  const curr = rail && (rail.querySelector(".viz-line-curr") || rail.querySelector(".viz-line-prev"));
  if (rail && curr) {
    rail.scrollTop = Math.max(0, curr.offsetTop - rail.clientHeight / 2);
  }
}
