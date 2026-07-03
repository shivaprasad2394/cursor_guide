/**
 * C Interview Prep — static practice site (no API, no accounts).
 */
(function () {
  "use strict";

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };
    return { meta: parseSimpleYaml(match[1]), body: match[2].trim() };
  }

  function parseSimpleYaml(text) {
    const meta = {};
    let key = null;
    let list = null;
    let objLines = [];
    let blockKey = null;
    let blockLines = [];

    const flushBlock = () => {
      if (blockKey !== null) {
        meta[blockKey] = blockLines.join("\n");
        if (meta[blockKey]) meta[blockKey] += "\n";
        blockKey = null;
        blockLines = [];
      }
    };

    const flushObject = () => {
      if (key && objLines.length) {
        const joined = objLines.join(" ").trim();
        if (joined.startsWith("{")) {
          try {
            meta[key] = JSON.parse(joined.replace(/(\w+)\s*:/g, '"$1":'));
          } catch {
            meta[key] = joined;
          }
        }
        objLines = [];
      }
    };

    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed && blockKey === null) continue;

      if (blockKey !== null) {
        if (line.startsWith("  ") || line.startsWith("\t")) {
          blockLines.push(line.replace(/^\s{2}/, ""));
          continue;
        }
        flushBlock();
      }

      const root = trimmed.match(/^(\w+)\s*:\s*(.*)$/);
      if (root && !line.startsWith("  ") && !line.startsWith("\t")) {
        flushObject();
        key = root[1];
        const val = root[2].trim();
        if (val === "|" || val === "|-" || val === ">" || val === ">-" ) {
          blockKey = key;
          blockLines = [];
          key = null;
          continue;
        }
        if (val === "") {
          list = [];
          meta[key] = list;
        } else if (val.startsWith('"')) {
          try {
            meta[key] = JSON.parse(val);
          } catch {
            meta[key] = val.slice(1, -1);
          }
        } else if (val.startsWith("'")) {
          meta[key] = val.slice(1, -1);
        } else if (val === "true" || val === "false") {
          meta[key] = val === "true";
        } else if (!isNaN(Number(val))) {
          meta[key] = Number(val);
        } else {
          meta[key] = val;
        }
        continue;
      }

      const item = trimmed.match(/^-\s*(.*)$/);
      if (item && list) {
        const v = item[1].trim();
        if (v.startsWith("{")) {
          try {
            list.push(JSON.parse(v.replace(/(\w+)\s*:/g, '"$1":')));
          } catch {
            list.push(v);
          }
        } else {
          list.push(v.replace(/^["']|["']$/g, ""));
        }
        continue;
      }

      if (key && (line.startsWith("  ") || line.startsWith("\t"))) {
        objLines.push(trimmed);
      }
    }
    flushBlock();
    flushObject();
    return meta;
  }

  function extractCodeSection(body, heading) {
    const re = new RegExp(`## ${heading}\\s*\\n+\`\`\`c\\n([\\s\\S]*?)\`\`\``, "i");
    const section = body.match(re);
    return section ? section[1].trim() : "";
  }

  function extractStarterCode(body) {
    return extractCodeSection(body, "Starter Code");
  }

  function extractSolutionCode(body) {
    return extractCodeSection(body, "Solution");
  }

  function extractAlgorithm(body) {
    const algo = body.match(/## Algorithm\s*\n+([\s\S]*?)(?=\n## |$)/i);
    return algo ? algo[1].trim() : "";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderInlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function isStepLine(line) {
    return /^step\d+:/i.test(line.trim()) || /^\d+\.\s+/.test(line.trim());
  }

  function stripStepPrefix(line) {
    return line.trim().replace(/^step\d+:\s*/i, "").replace(/^\d+\.\s+/, "");
  }

  function renderTextBlock(text) {
    const trimmed = text.trim();
    if (!trimmed) return "";

    const lines = trimmed.split("\n");
    if (lines.every((l) => !l.trim() || isStepLine(l))) {
      const steps = lines.filter((l) => l.trim()).map(stripStepPrefix);
      return `<ol class="spec-steps">${steps
        .map((s, i) => `<li><span class="step-badge">${i + 1}</span><span>${renderInlineMarkdown(s)}</span></li>`)
        .join("")}</ol>`;
    }

    return `<pre class="trace-pre"><code>${escapeHtml(trimmed)}</code></pre>`;
  }

  function renderMarkdownBlock(content) {
    const lines = content.split("\n");
    const parts = [];
    let i = 0;

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        i += 1;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i += 1;
        }
        const isGlance = items.some((it) => /^\*\*Goal:\*\*/.test(it) || /^\*\*Pattern:\*\*/.test(it));
        const cls = isGlance ? "spec-list spec-glance" : "spec-list";
        parts.push(`<ul class="${cls}">${items.map((it) => `<li>${renderInlineMarkdown(it)}</li>`).join("")}</ul>`);
        continue;
      }

      if (isStepLine(trimmed)) {
        const steps = [];
        while (i < lines.length) {
          const t = lines[i].trim();
          if (isStepLine(t)) {
            steps.push(stripStepPrefix(t));
            i += 1;
          } else if (t.startsWith("  ") && steps.length) {
            steps[steps.length - 1] += " " + t.trim();
            i += 1;
          } else break;
        }
        parts.push(`<ol class="spec-steps">${steps
          .map((s, n) => `<li><span class="step-badge">${n + 1}</span><span>${renderInlineMarkdown(s)}</span></li>`)
          .join("")}</ol>`);
        continue;
      }

      const para = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t || /^[-*]\s+/.test(t) || isStepLine(t)) break;
        para.push(t);
        i += 1;
      }
      if (para.length) {
        parts.push(`<p>${renderInlineMarkdown(para.join(" "))}</p>`);
      }
    }

    return parts.join("\n");
  }

  function renderMarkdownSections(body) {
    const html = [];
    const skip = /^starter code$|^solution$/i;

    for (const part of body.split(/^## /m).filter(Boolean)) {
      const nl = part.indexOf("\n");
      const heading = nl === -1 ? part : part.slice(0, nl);
      if (skip.test(heading)) continue;

      let content = nl === -1 ? "" : part.slice(nl + 1).trim();
      const sectionClass =
        /^at a glance$/i.test(heading) ? "spec-section spec-section-glance" : "spec-section";

      content = content
        .replace(/```c\n([\s\S]*?)```/g, (_, code) =>
          `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`
        )
        .replace(/```json\n([\s\S]*?)```/g, (_, code) =>
          `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`
        )
        .replace(/```text\n([\s\S]*?)```/g, (_, code) => renderTextBlock(code))
        .replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, rows) => {
          const ths = header.split("|").filter(Boolean).map((c) => `<th>${escapeHtml(c.trim())}</th>`).join("");
          const trs = rows
            .trim()
            .split("\n")
            .map((row) => {
              const tds = row
                .split("|")
                .filter(Boolean)
                .map((c) => `<td>${escapeHtml(c.trim())}</td>`)
                .join("");
              return `<tr>${tds}</tr>`;
            })
            .join("");
          return `<table class="trace-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
        })
        .replace(/^```\n([\s\S]*?)```/gm, (_, code) => renderTextBlock(code));

      if (!content.includes("<pre") && !content.includes("<table") && !content.includes("<ul") && !content.includes("<ol")) {
        content = renderMarkdownBlock(content);
      } else {
        const chunks = content.split(/(?=<pre|<table|<ul|<ol|<p>)/);
        content = chunks
          .map((chunk) => {
            if (/^<(pre|table|ul|ol|p)/.test(chunk.trim())) return chunk;
            return renderMarkdownBlock(chunk);
          })
          .join("\n");
      }

      html.push(`<section class="${sectionClass}"><h3>${escapeHtml(heading)}</h3>${content}</section>`);
    }
    return html.join("");
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function flashButton(btn, label, ms) {
    const original = btn.textContent;
    btn.textContent = label;
    setTimeout(() => {
      btn.textContent = original;
    }, ms || 1500);
  }

  function normalizeOutput(text) {
    return (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  }

  function diffOutput(actual, expected) {
    const aLines = normalizeOutput(actual).split("\n");
    const eLines = normalizeOutput(expected).split("\n");
    const max = Math.max(aLines.length, eLines.length);
    const rows = [];

    for (let i = 0; i < max; i++) {
      const exp = eLines[i] ?? "";
      const act = aLines[i] ?? "";
      rows.push({ line: i + 1, expected: exp, actual: act, match: exp === act });
    }

    const pass = rows.length > 0 && rows.every((r) => r.match);
    return { rows, pass };
  }

  function renderDiff(diff, container) {
    if (!container) return;
    container.innerHTML = "";
    const table = document.createElement("table");
    table.className = "diff-table";
    table.innerHTML = `<thead><tr><th>#</th><th>Expected</th><th>Actual</th><th></th></tr></thead>`;
    const tbody = document.createElement("tbody");

    for (const row of diff.rows) {
      const tr = document.createElement("tr");
      tr.className = row.match ? "match" : "mismatch";
      tr.innerHTML = `
        <td>${row.line}</td>
        <td><code>${escapeHtml(row.expected) || "∅"}</code></td>
        <td><code>${escapeHtml(row.actual) || "∅"}</code></td>
        <td>${row.match ? "✓" : "✗"}</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);

    const verdict = document.createElement("div");
    verdict.className = `verdict ${diff.pass ? "pass" : "fail"}`;
    verdict.textContent = diff.pass ? "PASS — output matches expected" : "FAIL — output differs from expected";
    container.appendChild(verdict);
  }

  let runnerModule = null;

  async function runInBrowser(source, stdin, onProgress) {
    if (!runnerModule) {
      if (onProgress) onProgress("Loading in-browser C compiler (first run ~60 MB, cached after)…");
      runnerModule = await import("./runner.js?v=10");
    }
    if (onProgress) onProgress("Compiling & running…");
    return runnerModule.compileAndRun(source, stdin || "");
  }

  function formatRunResult(result) {
    let out = "";
    if (result.compileOutput && !result.stdout && !result.stderr) {
      return result.compileOutput.trim();
    }
    if (result.compileOutput && result.compileOutput.trim()) {
      out += result.compileOutput.trim() + "\n";
    }
    if (result.stderr) out += result.stderr;
    out += result.stdout || "";
    return out.trim();
  }

  function buildTape(container, meta, stepIndex) {
    container.innerHTML = "";
    const viz = meta.visualization;
    if (!viz || viz === "none") {
      container.hidden = true;
      return;
    }
    container.hidden = false;

    if (viz === "two-pointer") {
      renderTwoPointerTape(container, meta, stepIndex);
    } else if (viz === "binary-search") {
      renderBinarySearchTape(container, meta, stepIndex);
    } else if (viz === "tree") {
      renderTreeTape(container, meta, stepIndex);
    } else if (viz === "linked-list") {
      renderLinkedListTape(container, meta, stepIndex);
    } else if (viz === "array-cells") {
      renderArrayCellsTape(container, meta, stepIndex);
    }
  }

  function renderTwoPointerTape(container, meta, stepIndex) {
    const tape = String(meta.tape || "");
    const chars = tape.split("");
    const trace = meta.trace || [];
    const step = trace[stepIndex] || trace[trace.length - 1] || { left: 0, right: Math.max(0, chars.length - 1) };
    const left = step.left ?? 0;
    const right = step.right ?? chars.length - 1;

    const wrap = document.createElement("div");
    wrap.className = "memory-tape";
    wrap.innerHTML = `
      <div class="tape-label">MEMORY TAPE · two-pointer</div>
      <div class="tape-row tape-chars">${chars
        .map((c, i) => `<span class="cell ${i === left ? "ptr-left" : ""} ${i === right ? "ptr-right" : ""}">${escapeHtml(c)}</span>`)
        .join("")}</div>
      <div class="tape-row tape-idx">${chars.map((_, i) => `<span class="idx">${i}</span>`).join("")}</div>
      <div class="tape-pointers">
        <span class="ptr-tag left">left=${left}</span>
        <span class="ptr-tag right">right=${right}</span>
      </div>
      ${step.note ? `<div class="tape-note">${escapeHtml(step.note)}</div>` : ""}`;
    container.appendChild(wrap);
  }

  function renderBinarySearchTape(container, meta, stepIndex) {
    const values = String(meta.tape || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const trace = meta.trace || [];
    const step = trace[stepIndex] || trace[0] || { low: 0, high: values.length - 1, mid: 0 };
    const low = step.low ?? 0;
    const high = step.high ?? values.length - 1;
    const mid = step.mid ?? Math.floor((low + high) / 2);

    const wrap = document.createElement("div");
    wrap.className = "memory-tape binary-search-tape";
    wrap.innerHTML = `
      <div class="tape-label">INDEX TAPE · binary search · target=${meta.target ?? "?"}</div>
      <div class="tape-row tape-chars">${values
        .map(
          (v, i) =>
            `<span class="cell ${i === low ? "ptr-low" : ""} ${i === high ? "ptr-high" : ""} ${i === mid ? "ptr-mid" : ""}">${escapeHtml(v)}</span>`
        )
        .join("")}</div>
      <div class="tape-row tape-idx">${values.map((_, i) => `<span class="idx">${i}</span>`).join("")}</div>
      <div class="tape-pointers">
        <span class="ptr-tag low">low=${low}</span>
        <span class="ptr-tag mid">mid=${mid}</span>
        <span class="ptr-tag high">high=${high}</span>
      </div>
      ${step.note ? `<div class="tape-note">${escapeHtml(step.note)}</div>` : ""}`;
    container.appendChild(wrap);
  }

  function insertBst(root, val) {
    if (!root) return { id: val, left: null, right: null };
    if (val < root.id) root.left = insertBst(root.left, val);
    else if (val > root.id) root.right = insertBst(root.right, val);
    return root;
  }

  function treeToLevels(root) {
    if (!root) return [];
    const levels = [];
    let queue = [root];
    while (queue.length) {
      levels.push(queue.map((n) => (n ? n.id : null)));
      queue = queue.flatMap((n) => (n ? [n.left, n.right] : [null, null]));
      if (queue.every((n) => n === null)) break;
    }
    return levels;
  }

  function renderTreeTape(container, meta, stepIndex) {
    const keys = String(meta.treeKeys || "50,30,70,20,40")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const steps = Math.max(1, keys.length);
    const upto = Math.min(stepIndex + 1, keys.length);
    let root = null;
    for (let i = 0; i < upto; i += 1) root = insertBst(root, keys[i]);
    const levels = treeToLevels(root);
    const label = meta.treeLabel || "BST / AVL structure (insert order)";
    const lastKey = keys[upto - 1];

    const rows = levels
      .map((level) =>
        `<div class="tree-level">${level
          .map((v) => {
            if (v === null) return `<span class="tree-node tree-empty">·</span>`;
            const cls = v === lastKey ? "tree-new" : "";
            return `<span class="tree-node ${cls}">${v}</span>`;
          })
          .join("")}</div>`
      )
      .join("");

    const wrap = document.createElement("div");
    wrap.className = "memory-tape tree-tape";
    wrap.innerHTML = `
      <div class="tape-label">TREE · ${escapeHtml(label)}</div>
      <div class="tree-wrap">${rows}</div>
      <div class="tape-pointers">
        <span class="ptr-tag mid">Inserted: ${keys.slice(0, upto).join(" → ")}</span>
        <span class="ptr-tag">Step ${Math.min(stepIndex + 1, steps)} / ${steps}</span>
      </div>`;
    container.appendChild(wrap);
  }

  function renderLinkedListTape(container, meta, stepIndex) {
    const nodes = String(meta.listNodes || "1,2,3,4,5")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hi = parseInt(meta.listHighlight, 10);
    const trace = meta.trace || [];
    const step = trace[stepIndex] || {};
    const highlight = step.index ?? (isNaN(hi) ? Math.min(stepIndex, nodes.length - 1) : hi);

    const wrap = document.createElement("div");
    wrap.className = "memory-tape list-tape";
    wrap.innerHTML = `
      <div class="tape-label">LINKED LIST · nodes left → right</div>
      <div class="list-row">${nodes
        .map(
          (v, i) =>
            `<span class="list-node ${i === highlight ? "list-active" : ""}">${escapeHtml(v)}</span>${
              i < nodes.length - 1 ? `<span class="list-arrow">→</span>` : ""
            }`
        )
        .join("")}<span class="list-null">NULL</span></div>
      ${step.note ? `<div class="tape-note">${escapeHtml(step.note)}</div>` : ""}`;
    container.appendChild(wrap);
  }

  function renderArrayCellsTape(container, meta, stepIndex) {
    const values = String(meta.tape || "0,1,2,3,4,5,6,7")
      .split(",")
      .map((s) => s.trim());
    const trace = meta.trace || [];
    const step = trace[stepIndex] || { index: stepIndex % values.length };
    const idx = step.index ?? 0;
    const label = meta.arrayLabel || "array / buffer";

    const wrap = document.createElement("div");
    wrap.className = "memory-tape array-tape";
    wrap.innerHTML = `
      <div class="tape-label">ARRAY · ${escapeHtml(label)}</div>
      <div class="tape-row tape-chars">${values
        .map((v, i) => `<span class="cell ${i === idx ? "ptr-mid" : ""}">${escapeHtml(v)}</span>`)
        .join("")}</div>
      <div class="tape-row tape-idx">${values.map((_, i) => `<span class="idx">${i}</span>`).join("")}</div>
      ${step.note ? `<div class="tape-note">${escapeHtml(step.note)}</div>` : ""}`;
    container.appendChild(wrap);
  }

  async function initIndexPage() {
    const listEl = document.getElementById("question-list");
    const statsEl = document.getElementById("stats");
    if (!listEl) return;

    const res = await fetch("questions/index.json");
    const data = await res.json();
    const questions = data.questions || [];

    if (statsEl) {
      statsEl.textContent = `${questions.length} programs · live C in browser · no API key`;
    }

    const bySection = new Map();
    for (const q of questions) {
      const sec = q.section || "other";
      if (!bySection.has(sec)) bySection.set(sec, []);
      bySection.get(sec).push(q);
    }

    const sectionOrder = [
      "strings",
      "arrays",
      "bit manipulation",
      "math / number",
      "linked list",
      "binary search tree",
      "avl tree",
      "queues & stacks",
      "parsing & formatting",
      "buffers & driver patterns",
      "memory, dma, mmap & reimplementing libc",
    ];

    const sections = [...bySection.keys()].sort((a, b) => {
      const ia = sectionOrder.indexOf(a);
      const ib = sectionOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    listEl.innerHTML = sections
      .map((sec) => {
        const items = bySection.get(sec);
        const cards = items
          .map(
            (q) => `
        <a class="question-card" href="question.html?id=${encodeURIComponent(q.id)}">
          <span class="card-pattern">${escapeHtml(q.pattern)}</span>
          <span class="card-title">${escapeHtml(q.title)}</span>
          <span class="card-difficulty diff-${escapeHtml(q.difficulty)}">${escapeHtml(q.difficulty)}</span>
        </a>`
          )
          .join("");
        return `<section class="section-group"><h2 class="section-heading">${escapeHtml(sec)}</h2><div class="section-cards">${cards}</div></section>`;
      })
      .join("");
  }

  function setupQuestionNav(questions, currentId) {
    const idx = questions.findIndex((q) => q.id === currentId);
    const posText = idx >= 0 ? `${idx + 1} / ${questions.length}` : "…";

    document.querySelectorAll(".nav-pos").forEach((el) => {
      el.textContent = posText;
    });

    document.querySelectorAll(".nav-prev").forEach((el) => {
      if (idx > 0) {
        el.href = `question.html?id=${encodeURIComponent(questions[idx - 1].id)}`;
        el.classList.remove("nav-disabled");
        el.removeAttribute("aria-disabled");
      } else {
        el.href = "index.html";
        el.classList.add("nav-disabled");
        el.setAttribute("aria-disabled", "true");
      }
    });

    document.querySelectorAll(".nav-next").forEach((el) => {
      if (idx >= 0 && idx < questions.length - 1) {
        el.href = `question.html?id=${encodeURIComponent(questions[idx + 1].id)}`;
        el.classList.remove("nav-disabled");
        el.removeAttribute("aria-disabled");
      } else {
        el.href = "index.html";
        el.classList.add("nav-disabled");
        el.setAttribute("aria-disabled", "true");
      }
    });
  }

  async function initQuestionPage() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      window.location.href = "index.html";
      return;
    }

    const indexData = await (await fetch("questions/index.json")).json();
    const allQuestions = indexData.questions || [];
    const entry = allQuestions.find((q) => q.id === id);
    if (!entry) {
      document.body.innerHTML = "<p>Question not found.</p>";
      return;
    }

    setupQuestionNav(allQuestions, id);

    const raw = await (await fetch(`questions/${entry.file}`)).text();
    const { meta, body } = parseFrontmatter(raw);
    const starterCode = extractStarterCode(body);
    const solutionCode = extractSolutionCode(body);
    const algorithmText = extractAlgorithm(body);

    document.title = `${meta.title || entry.title} · C Interview Prep`;

    const titleEl = document.getElementById("q-title");
    const metaEl = document.getElementById("q-meta");
    const specEl = document.getElementById("q-spec");
    const editor = document.getElementById("editor");
    const consoleOut = document.getElementById("console-output");
    const diffEl = document.getElementById("diff-output");
    const tapeEl = document.getElementById("pointer-tape");
    const revealAlgoBtn = document.getElementById("btn-reveal-algo");
    const revealSolBtn = document.getElementById("btn-reveal-solution");
    const expectedBtn = document.getElementById("btn-expected");
    const runBtn = document.getElementById("btn-run");
    const checkBtn = document.getElementById("btn-check");
    const copyBtn = document.getElementById("btn-copy");
    const stepBtn = document.getElementById("btn-step");
    const vizBtn = document.getElementById("btn-visualize");
    const resetBtn = document.getElementById("btn-reset");
    const algoPanel = document.getElementById("algorithm-panel");

    if (titleEl) titleEl.textContent = meta.title || entry.title;
    if (metaEl) {
      metaEl.innerHTML = `
        <span class="tag">${escapeHtml(meta.pattern || entry.pattern)}</span>
        <span class="tag diff-${escapeHtml(meta.difficulty || entry.difficulty)}">${escapeHtml(meta.difficulty || entry.difficulty)}</span>
        <span class="tag muted">${escapeHtml(meta.complexity || "")}</span>`;
    }
    if (specEl) specEl.innerHTML = renderMarkdownSections(body);
    if (editor) editor.value = starterCode;
    if (revealSolBtn) revealSolBtn.hidden = !solutionCode;

    let traceStep = 0;
    let algoVisible = false;
    let vizVisible = false;
    const hasViz = meta.visualization && meta.visualization !== "none";
    const trace = Array.isArray(meta.trace) ? meta.trace : [];

    if (tapeEl) tapeEl.hidden = true;

    const setBusy = (busy) => {
      [runBtn, checkBtn, expectedBtn, revealAlgoBtn, revealSolBtn, copyBtn, stepBtn, vizBtn, resetBtn].forEach((btn) => {
        if (btn) btn.disabled = busy;
      });
    };

    const setConsole = (text, kind) => {
      if (!consoleOut) return;
      consoleOut.className = `console-out ${kind || ""}`;
      consoleOut.textContent = text;
    };

    if (vizBtn && tapeEl) {
      vizBtn.hidden = !hasViz;
      vizBtn.addEventListener("click", () => {
        vizVisible = !vizVisible;
        tapeEl.hidden = !vizVisible;
        vizBtn.textContent = vizVisible ? "Hide visualization" : "Show visualization";
        if (vizVisible) buildTape(tapeEl, meta, traceStep);
      });
    }

    if (stepBtn && tapeEl) {
      const maxSteps =
        trace.length ||
        (meta.visualization === "tree" && meta.treeKeys
          ? String(meta.treeKeys).split(",").length
          : meta.visualization === "linked-list"
            ? String(meta.listNodes || "").split(",").filter(Boolean).length
            : 1);
      stepBtn.hidden = !hasViz;
      stepBtn.addEventListener("click", () => {
        if (!vizVisible) {
          vizVisible = true;
          tapeEl.hidden = false;
          if (vizBtn) vizBtn.textContent = "Hide visualization";
        }
        traceStep = (traceStep + 1) % maxSteps;
        buildTape(tapeEl, meta, traceStep);
      });
    }

    if (revealAlgoBtn && algoPanel) {
      revealAlgoBtn.addEventListener("click", () => {
        algoVisible = !algoVisible;
        revealAlgoBtn.textContent = algoVisible ? "Hide algorithm" : "Reveal algorithm";
        algoPanel.hidden = !algoVisible;
        if (algoVisible) {
          algoPanel.innerHTML = `<h3>Algorithm</h3><div class="algorithm-body">${renderTextBlock(algorithmText)}</div>`;
        }
      });
    }

    if (revealSolBtn && solutionCode) {
      revealSolBtn.addEventListener("click", () => {
        if (editor) editor.value = solutionCode;
        setConsole("Solution loaded into editor — study it, then Reset to practice again.", "ok");
      });
    }

    if (expectedBtn) {
      expectedBtn.addEventListener("click", () => {
        const out = (meta.expectedOutput || "").trim();
        if (out) {
          setConsole(out, "ok");
        } else {
          setConsole("(No expected output defined for this question.)", "pending");
        }
      });
    }

    if (copyBtn && editor) {
      copyBtn.addEventListener("click", async () => {
        try {
          await copyText(editor.value);
          flashButton(copyBtn, "Copied!");
        } catch {
          flashButton(copyBtn, "Copy failed");
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (editor) editor.value = starterCode;
        setConsole("");
        if (diffEl) diffEl.innerHTML = "";
        traceStep = 0;
        vizVisible = false;
        if (tapeEl) tapeEl.hidden = true;
        if (vizBtn) vizBtn.textContent = "Show visualization";
        buildTape(tapeEl, meta, traceStep);
        if (algoPanel) algoPanel.hidden = true;
        if (revealAlgoBtn) revealAlgoBtn.textContent = "Reveal algorithm";
        algoVisible = false;
      });
    }

    if (runBtn) {
      runBtn.addEventListener("click", async () => {
        setBusy(true);
        if (diffEl) diffEl.innerHTML = "";
        setConsole("Starting…", "pending");

        try {
          const result = await runInBrowser(editor.value, meta.stdin || "", setConsole);
          const out = formatRunResult(result);
          if (!out && result.compileOutput) {
            setConsole(result.compileOutput.trim(), "err");
          } else if (result.stderr && !result.stdout) {
            setConsole(out, "err");
          } else {
            setConsole(out || "(no output)", result.stderr ? "err" : "ok");
          }
        } catch (e) {
          setConsole(String(e.message || e), "err");
        } finally {
          setBusy(false);
        }
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener("click", async () => {
        setBusy(true);
        setConsole("Compiling & checking…", "pending");

        try {
          const result = await runInBrowser(editor.value, meta.stdin || "", setConsole);

          if (!result.ok && result.compileOutput && !result.stdout) {
            setConsole(formatRunResult(result), "err");
            if (diffEl) {
              diffEl.innerHTML = `<div class="verdict fail">Fix compile errors before checking output.</div>`;
            }
            return;
          }

          const out = (result.stdout || "") + (result.stderr || "");
          setConsole(out.trim() || formatRunResult(result), "ok");
          renderDiff(diffOutput(out, meta.expectedOutput || ""), diffEl);
        } catch (e) {
          setConsole(String(e.message || e), "err");
        } finally {
          setBusy(false);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "index") initIndexPage();
    else if (document.body.dataset.page === "question") initQuestionPage();
  });
})();
