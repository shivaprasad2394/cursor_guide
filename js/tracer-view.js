/**
 * tracer-view.js — renders one step of a live C trace (from ctracer.js).
 * Python Tutor conventions: green arrow = line just executed, red arrow =
 * next line to execute; values that changed since the previous step are
 * highlighted so the effect of each line is obvious.
 */

const PTR_COLORS = ["viz-ptr-left", "viz-ptr-right", "viz-ptr-mid", "viz-ptr-low", "viz-ptr-high"];
const PTR_STROKE = ["#58a6ff", "#39d98a", "#f0b429", "#ff5f56", "#bc8cff"];
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

function ptrRefKey(ref) {
  if (!ref || ref.stIdx === null || ref.stIdx === undefined) return null;
  return `${ref.stIdx}:${(ref.embedPath || []).join(".")}`;
}

function vizIdStruct(stIdx, embedPath = []) {
  return embedPath.length ? `s:${stIdx}:${embedPath.join(".")}` : `s:${stIdx}`;
}

function vizIdArray(ai, off) {
  return `a:${ai}:${off}`;
}

function vizIdFromPtr(ptr) {
  if (!ptr) return null;
  if (ptr.structIdx !== undefined && ptr.structIdx !== null) {
    return vizIdStruct(ptr.structIdx, ptr.embedPath || []);
  }
  if (ptr.arrIdx !== undefined && ptr.arrIdx !== null) return vizIdArray(ptr.arrIdx, ptr.off);
  return null;
}

function vizIdsForHeapNode(node) {
  const embed = node.fields.node?.type === "embedded" ? ["node"] : [];
  const ids = [vizIdStruct(node.idx)];
  if (embed.length) ids.push(vizIdStruct(node.idx, embed));
  return ids;
}

function ptrColorIdx(name, map) {
  if (!map.has(name)) map.set(name, map.size % PTR_STROKE.length);
  return map.get(name);
}

function ptrLinkAttrs(toId, colorIdx) {
  if (!toId) return "";
  return ` data-viz-link-to="${toId}" data-viz-color-idx="${colorIdx}"`;
}

function drawPointerArrows(container) {
  const split = container.querySelector(".viz-state-split");
  if (!split) return;

  split.querySelector(".viz-ptr-arrows")?.remove();

  const findTarget = (id) => split.querySelector(`[data-viz-id~="${CSS.escape(id)}"]`);

  const links = [];
  split.querySelectorAll("[data-viz-link-to]").forEach((src) => {
    const toId = src.getAttribute("data-viz-link-to");
    const dst = findTarget(toId);
    if (!dst) return;
    links.push({
      src,
      dst,
      colorIdx: Number(src.getAttribute("data-viz-color-idx") || 0) % PTR_STROKE.length,
    });
  });

  if (!links.length) return;

  const splitRect = split.getBoundingClientRect();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("viz-ptr-arrows");
  svg.setAttribute("width", String(splitRect.width));
  svg.setAttribute("height", String(splitRect.height));
  svg.setAttribute("viewBox", `0 0 ${splitRect.width} ${splitRect.height}`);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  PTR_STROKE.forEach((color, i) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", `viz-ptr-head-${i}`);
    marker.setAttribute("markerWidth", "9");
    marker.setAttribute("markerHeight", "9");
    marker.setAttribute("refX", "7");
    marker.setAttribute("refY", "4.5");
    marker.setAttribute("orient", "auto");
    const head = document.createElementNS("http://www.w3.org/2000/svg", "path");
    head.setAttribute("d", "M0,0 L0,9 L9,4.5 z");
    head.setAttribute("fill", color);
    marker.appendChild(head);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);

  links.forEach(({ src, dst, colorIdx }) => {
    const sr = src.getBoundingClientRect();
    const dr = dst.getBoundingClientRect();
    const srcRight = sr.right - splitRect.left;
    const srcLeft = sr.left - splitRect.left;
    const dstRight = dr.right - splitRect.left;
    const dstLeft = dr.left - splitRect.left;
    const y1 = sr.top + sr.height / 2 - splitRect.top;
    const y2 = dr.top + dr.height / 2 - splitRect.top;

    const srcInStack = src.closest(".viz-stack-pane");
    const dstInStack = dst.closest(".viz-stack-pane");
    let x1;
    let x2;
    if (srcInStack && !dstInStack) {
      x1 = srcRight;
      x2 = dstLeft;
    } else if (!srcInStack && dstInStack) {
      x1 = srcLeft;
      x2 = dstRight;
    } else if (srcRight <= dstLeft) {
      x1 = srcRight;
      x2 = dstLeft;
    } else {
      x1 = srcLeft;
      x2 = dstRight;
    }

    const dx = Math.max(28, Math.abs(x2 - x1) * 0.45);
    const c1x = x1 + (x2 >= x1 ? dx : -dx);
    const c2x = x2 - (x2 >= x1 ? dx : -dx);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", PTR_STROKE[colorIdx]);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-opacity", "0.85");
    path.setAttribute("marker-end", `url(#viz-ptr-head-${colorIdx})`);
    svg.appendChild(path);
  });

  split.appendChild(svg);
}

function fieldLinkRef(fields, name) {
  const f = fields[name];
  if (!f || f.type !== "ptr" || f.stIdx === null || f.stIdx === undefined) return null;
  return { stIdx: f.stIdx, embedPath: f.embedPath || [] };
}

function embeddedFields(node) {
  if (node.fields.node && node.fields.node.type === "embedded") return node.fields.node.fields;
  return node.fields;
}

function renderStructNode(node, hot, ptrOn, changed, opts = {}) {
  const { doubly = false, ptrColorMap = new Map() } = opts;
  const nodeIds = vizIdsForHeapNode(node);
  const fromKey = nodeIds[nodeIds.length - 1];
  const badges = (ptrOn[node.idx] || [])
    .map(
      (name, i) =>
        `<span class="viz-ll-ptr-badge ${PTR_COLORS[i % PTR_COLORS.length]}">${escapeHtml(name)}</span>`
    )
    .join("");
  const links = embeddedFields(node);
  const rows = Object.entries(node.fields)
    .map(([fname, fval]) => {
      if (fval.type === "embedded") {
        return `<div class="viz-ll-row"><span>${escapeHtml(fname)}</span><span class="viz-ll-val">embedded ${escapeHtml(fval.structName || "struct")}</span></div>`;
      }
      let text = "—";
      let linkAttrs = "";
      if (fval.type === "scalar") text = String(fval.val);
      else if (fval.type === "ptr") {
        if (fval.stIdx === null || fval.stIdx === undefined) {
          text = "NULL";
        } else {
          const toId = vizIdStruct(fval.stIdx, fval.embedPath || []);
          text = fname === "next" ? `${toId} →` : fname === "prev" ? `← ${toId}` : `→ ${toId}`;
          linkAttrs = ptrLinkAttrs(toId, ptrColorIdx(`${fname}@${fromKey}`, ptrColorMap));
        }
      }
      return `<div class="viz-ll-row"><span>${escapeHtml(fname)}</span><span class="viz-ll-val viz-ptr-link"${linkAttrs}>${escapeHtml(text)}</span></div>`;
    })
    .join("");
  const stackTag = node.onStack ? " · stack" : "";
  const label = node.fields.id?.val ?? node.fields.value?.val ?? node.name;
  const prevRef = fieldLinkRef(links, "prev");
  const nextRef = fieldLinkRef(links, "next");
  const body = doubly
    ? `<div class="viz-ll-row"><span>prev</span><span class="viz-ll-val viz-ptr-link"${prevRef ? ptrLinkAttrs(vizIdStruct(prevRef.stIdx, prevRef.embedPath), ptrColorIdx(`prev@${fromKey}`, ptrColorMap)) : ""}>${prevRef ? `← ${vizIdStruct(prevRef.stIdx, prevRef.embedPath)}` : "NULL"}</span></div>
       <div class="viz-ll-row"><span>${node.fields.id ? "id" : "value"}</span><span class="viz-ll-val">${escapeHtml(String(label))}</span></div>
       <div class="viz-ll-row"><span>next</span><span class="viz-ll-val viz-ptr-link"${nextRef ? ptrLinkAttrs(vizIdStruct(nextRef.stIdx, nextRef.embedPath), ptrColorIdx(`next@${fromKey}`, ptrColorMap)) : ""}>${nextRef ? `${vizIdStruct(nextRef.stIdx, nextRef.embedPath)} →` : "NULL"}</span></div>`
    : rows;
  return `<div class="viz-ll-node ${doubly ? "viz-dll-node" : ""} ${hot.has(node.idx) ? "viz-ll-hot" : ""} ${changed ? "viz-cell-changed" : ""}" data-viz-id="${nodeIds.join(" ")}">
    <div class="viz-ll-ptr-slot">${badges}</div>
    <div class="viz-ll-node-head">${escapeHtml(node.name)}@${node.idx}${stackTag}</div>
    ${body}
  </div>`;
}

function renderDllChain(startRef, byIdx, hot, ptrOn, nodeChanged, inChain, anchorKey = null, ptrColorMap = null) {
  let html = "";
  let cur = startRef;
  const seen = new Set();
  while (cur && !seen.has(ptrRefKey(cur))) {
    seen.add(ptrRefKey(cur));
    inChain.add(ptrRefKey(cur));
    const node = byIdx.get(cur.stIdx);
    if (!node) break;
    html += renderStructNode(node, hot, ptrOn, nodeChanged(node), { doubly: true, ptrColorMap });
    const next = fieldLinkRef(embeddedFields(node), "next");
    if (!next) break;
    if (anchorKey && ptrRefKey(next) === anchorKey) {
      html += '<div class="viz-dll-edge viz-dll-cycle">↺ circular · back to anchor</div>';
      break;
    }
    html += '<div class="viz-dll-edge"><span>next →</span><span>← prev</span></div>';
    cur = next;
  }
  if (!anchorKey) html += '<div class="viz-ll-null">NULL</div>';
  return html;
}

function renderStructHeap(step, prev, ptrColorMap = new Map()) {
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

  const hasPrev = heap.some((n) => embeddedFields(n).prev !== undefined);
  const hasNext = heap.some((n) => embeddedFields(n).next !== undefined);
  const isDoubly = hasPrev && hasNext;

  const pointedTo = new Set();
  heap.forEach((n) => {
    const lf = embeddedFields(n);
    const next = fieldLinkRef(lf, "next");
    const prev = fieldLinkRef(lf, "prev");
    if (next) pointedTo.add(ptrRefKey(next));
    if (prev) pointedTo.add(ptrRefKey(prev));
  });

  const isCircular = heap.some((n) => {
    const lf = embeddedFields(n);
    const next = fieldLinkRef(lf, "next");
    const prev = fieldLinkRef(lf, "prev");
    const self = { stIdx: n.idx, embedPath: n.fields.node?.type === "embedded" ? ["node"] : [] };
    return (next && ptrRefKey(next) === ptrRefKey(self)) || (prev && ptrRefKey(prev) === ptrRefKey(self));
  });

  const heads = isDoubly
    ? heap.filter((n) => !fieldLinkRef(embeddedFields(n), "prev"))
    : heap.filter((n) => !pointedTo.has(`${n.idx}:`));

  const inChain = new Set();
  const renderChain = (startNode) => {
    const startRef = { stIdx: startNode.idx, embedPath: startNode.fields.node?.type === "embedded" ? ["node"] : [] };
    const anchorKey = isCircular ? ptrRefKey(startRef) : null;
    if (isDoubly) return renderDllChain(startRef, byIdx, hot, ptrOn, nodeChanged, inChain, anchorKey, ptrColorMap);
    let html = "";
    let cur = startNode.idx;
    const seen = new Set();
    while (cur !== null && !seen.has(cur)) {
      seen.add(cur);
      inChain.add(String(cur));
      const node = byIdx.get(cur);
      if (!node) break;
      html += renderStructNode(node, hot, ptrOn, nodeChanged(node), { doubly: isDoubly, ptrColorMap });
      const next = fieldLinkRef(embeddedFields(node), "next");
      if (next) html += '<div class="viz-ll-edge">→</div>';
      cur = next ? next.stIdx : null;
    }
    html += '<div class="viz-ll-null">NULL</div>';
    return html;
  };

  let chainsHtml = "";
  if (heads.length) {
    if (isCircular) {
      const anchor = heap.find((n) => n.fields.id?.val === 0) || heap[0];
      const anchorRef = { stIdx: anchor.idx, embedPath: anchor.fields.node?.type === "embedded" ? ["node"] : [] };
      const first = fieldLinkRef(embeddedFields(anchor), "next");
      const body = first
        ? renderDllChain(first, byIdx, hot, ptrOn, nodeChanged, inChain, ptrRefKey(anchorRef), ptrColorMap)
        : renderStructNode(anchor, hot, ptrOn, nodeChanged(anchor), { doubly: true, ptrColorMap });
      chainsHtml = `<div class="viz-ll-row-label">circular intrusive list (anchor ${escapeHtml(String(anchor.name))}@${anchor.idx})</div><div class="viz-ll-canvas viz-dll-canvas">${body}</div>`;
    } else {
      chainsHtml = heads
        .map((h) => `<div class="viz-ll-canvas ${isDoubly ? "viz-dll-canvas" : ""}">${renderChain(h)}</div>`)
        .join("");
    }
  }

  const orphans = heap.filter((n) => !inChain.has(String(n.idx)) && !inChain.has(ptrRefKey({ stIdx: n.idx, embedPath: ["node"] })));
  let orphanHtml = "";
  if (orphans.length) {
    orphanHtml = `<div class="viz-ll-row-label">detached / unlinked</div><div class="viz-ll-canvas">${orphans
      .map((n) => renderStructNode(n, hot, ptrOn, nodeChanged(n), { doubly: isDoubly, ptrColorMap }))
      .join("")}</div>`;
  }

  if (!chainsHtml && !orphanHtml) {
    orphanHtml = `<div class="viz-ll-canvas">${heap
      .map((n) => renderStructNode(n, hot, ptrOn, nodeChanged(n), { doubly: isDoubly, ptrColorMap }))
      .join("")}</div>`;
  }

  const label = heap.some((n) => n.onStack)
    ? "stack + heap · linked nodes"
    : "heap · linked nodes";

  return `<div class="viz-array-block">
    <div class="viz-array-caption">${label}</div>
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
  const ptrColorMap = new Map();

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
            const toId = vizIdFromPtr(v.ptr);
            const ci = v.ptr ? ptrColorIdx(v.ptr.name || v.name, ptrColorMap) : 0;
            const ptrCls = v.ptr ? `viz-var-pointer ${PTR_COLORS[ci]}` : "";
            return `<div class="viz-var-row ${chg ? "viz-var-changed" : ""}">
            <span class="viz-var-name">${escapeHtml(v.name)}</span>
            <span class="viz-var-type"></span>
            <span class="viz-var-val ${ptrCls}"${toId ? ptrLinkAttrs(toId, ci) : ""}>${escapeHtml(v.text)}${chg ? '<span class="viz-chg-dot" title="changed this step">●</span>' : ""}</span>
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
            .map((p, bi) => {
              const ci = ptrColorIdx(p.name, ptrColorMap);
              return `<span class="viz-ptr-badge ${PTR_COLORS[ci]}">↓ ${escapeHtml(p.name)}</span>`;
            })
            .join("");
          const hot =
            arr.activeOff !== undefined && arr.activeOff !== null
              ? arr.activeOff === idx
              : arr.ptrs.some((p) => p.off === idx);
          const chg = cellChanged(ai, idx, val);
          return `<div class="viz-array-col" data-viz-id="${vizIdArray(ai, idx)}">
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

  const heapHtml = renderStructHeap(step, prev, ptrColorMap);
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
            <div class="viz-state-split" data-role="state-split">
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

  requestAnimationFrame(() => drawPointerArrows(container));
}
