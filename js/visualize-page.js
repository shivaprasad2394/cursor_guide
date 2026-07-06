/**
 * visualize-page.js — full-page Execution Studio.
 * Mode 1 "Code trace": runs the user's (or solution) C code through the
 * mini interpreter in ctracer.js and replays real execution.
 * Mode 2 "Pattern demo": falls back to the algorithm-pattern simulators.
 */
import { traceC, CUnsupported } from "./ctracer.js?v=22";
import { createSession, renderStudio, stepCount } from "./visualizer.js?v=22";
import { renderTraceStep } from "./tracer-view.js?v=22";
import { preprocessVizSource } from "./viz-preprocess.js?v=22";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* minimal frontmatter parser (same format app.js writes) */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  let listKey = null;
  for (const line of m[1].split("\n")) {
    const item = line.match(/^\s+-\s*(\{.*\})\s*$/);
    if (item && listKey) {
      try { meta[listKey].push(JSON.parse(item[1])); } catch { /* skip */ }
      continue;
    }
    const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const val = kv[2].trim();
    if (val === "") { meta[key] = []; listKey = key; continue; }
    listKey = null;
    if (val.startsWith('"')) {
      try { meta[key] = JSON.parse(val); } catch { meta[key] = val.slice(1, -1); }
    } else if (!isNaN(Number(val))) {
      meta[key] = Number(val);
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: m[2] };
}

function extractSection(body, heading) {
  const re = new RegExp(`## ${heading}\\s*\\n+\`\`\`c\\n([\\s\\S]*?)\`\`\``, "i");
  const m = body.match(re);
  return m ? m[1].trim() : "";
}

function traceForVizPage(code) {
  const { source, structDefs } = preprocessVizSource(code);
  if (structDefs.size > 0) {
    return traceC(code, { vizStructs: true, structDefs, preprocessedSource: source });
  }
  return traceC(code);
}

function extractAlgorithm(body) {
  const m = body.match(/## Algorithm\s*\n+([\s\S]*?)(?=\n## |$)/i);
  return m ? m[1].trim() : "";
}

/* ── Page bootstrap ───────────────────────────────────────── */

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const titleEl = document.getElementById("studio-title");
  const stage = document.getElementById("studio-stage");
  const msg = document.getElementById("studio-msg");
  const tabs = document.getElementById("studio-tabs");
  const tabTrace = document.getElementById("tab-trace");
  const tabPattern = document.getElementById("tab-pattern");
  const backLink = document.getElementById("back-to-question");

  if (!id) {
    titleEl.textContent = "No question selected";
    stage.innerHTML = `<p class="studio-msg">Open a question and press “Visualizer ⧉”.</p>`;
    return;
  }
  backLink.href = `question.html?id=${encodeURIComponent(id)}`;

  const index = await (await fetch("questions/index.json")).json();
  const entry = (index.questions || []).find((q) => q.id === id);
  if (!entry) {
    titleEl.textContent = "Question not found";
    return;
  }

  const raw = await (await fetch(`questions/${entry.file}`)).text();
  const { meta, body } = parseFrontmatter(raw);
  const solution = extractSection(body, "Solution");
  const starter = extractSection(body, "Starter Code");
  const algorithmText = extractAlgorithm(body);

  titleEl.textContent = meta.title || entry.title;
  document.title = `${meta.title || entry.title} · Execution Studio`;

  const userCode = localStorage.getItem(`studio-code:${id}`);

  /* try the user's code first, then the reference solution */
  const candidates = [];
  if (userCode) candidates.push({ code: userCode, label: "your editor code" });
  if (solution) candidates.push({ code: solution, label: "the reference solution" });
  if (!candidates.length && starter) candidates.push({ code: starter, label: "the starter code" });

  let trace = null;
  let traceError = null;
  let codeToTrace = candidates.length ? candidates[0].code : "";
  let codeLabel = candidates.length ? candidates[0].label : "";
  for (const cand of candidates) {
    try {
      const t = traceForVizPage(cand.code);
      if (!t.steps.length) throw new CUnsupported("no steps produced");
      trace = t;
      codeToTrace = cand.code;
      codeLabel = cand.label;
      traceError = null;
      break;
    } catch (err) {
      if (!traceError) traceError = err;
    }
  }

  /* pattern session fallback / secondary tab */
  const patternSession = createSession(meta, { algorithmText });
  const patternSteps = stepCount(patternSession);

  /* controls state */
  let mode = trace ? "trace" : "pattern";
  let idx = 0;
  let playTimer = null;

  const slider = document.getElementById("ctl-slider");
  const label = document.getElementById("ctl-label");
  const playBtn = document.getElementById("ctl-play");
  const speedSel = document.getElementById("ctl-speed");

  const total = () => (mode === "trace" ? trace.steps.length : patternSteps);

  const render = () => {
    if (mode === "trace") {
      renderTraceStep(stage, trace, codeToTrace, idx);
    } else {
      stage.innerHTML = "";
      const holder = document.createElement("div");
      stage.appendChild(holder);
      renderStudio(holder, patternSession, idx);
    }
    slider.max = String(Math.max(total() - 1, 0));
    slider.value = String(idx);
    label.textContent = `${idx + 1} / ${total()}`;
    tabTrace.classList.toggle("studio-tab-active", mode === "trace");
    tabPattern.classList.toggle("studio-tab-active", mode === "pattern");
  };

  const goto = (n) => {
    idx = Math.max(0, Math.min(n, total() - 1));
    render();
  };

  const stopPlay = () => {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    playBtn.textContent = "▶ Play";
  };

  document.getElementById("ctl-first").addEventListener("click", () => { stopPlay(); goto(0); });
  document.getElementById("ctl-prev").addEventListener("click", () => { stopPlay(); goto(idx - 1); });
  document.getElementById("ctl-next").addEventListener("click", () => { stopPlay(); goto(idx + 1); });
  document.getElementById("ctl-last").addEventListener("click", () => { stopPlay(); goto(total() - 1); });
  slider.addEventListener("input", () => { stopPlay(); goto(Number(slider.value)); });

  playBtn.addEventListener("click", () => {
    if (playTimer) { stopPlay(); return; }
    playBtn.textContent = "⏸ Pause";
    playTimer = setInterval(() => {
      if (idx >= total() - 1) { stopPlay(); return; }
      goto(idx + 1);
    }, Number(speedSel.value));
  });
  speedSel.addEventListener("change", () => {
    if (playTimer) { stopPlay(); playBtn.click(); }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") { stopPlay(); goto(idx + 1); }
    if (ev.key === "ArrowLeft") { stopPlay(); goto(idx - 1); }
  });

  /* tabs */
  if (trace && patternSteps > 0) {
    tabs.hidden = false;
    tabTrace.addEventListener("click", () => { stopPlay(); mode = "trace"; idx = 0; render(); });
    tabPattern.addEventListener("click", () => { stopPlay(); mode = "pattern"; idx = 0; render(); });
  }

  /* status message */
  if (trace) {
    msg.hidden = false;
    msg.innerHTML = `Tracing <strong>${codeLabel}</strong> live — real line-by-line execution.${trace.truncated ? " (trace capped)" : ""}`;
  } else if (traceError) {
    msg.hidden = false;
    const reason = traceError instanceof CUnsupported ? traceError.message : "could not parse this program";
    msg.innerHTML = `Live trace unavailable (<em>${escapeHtml(reason)}</em>) — showing the pattern demo instead.`;
  }

  render();
}

init();
