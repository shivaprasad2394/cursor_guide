#!/usr/bin/env python3
"""Build c-guide.html from docs/c_interview_guide.md (guide chrome + polished HTML)."""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "c_interview_guide.md"
OUT = ROOT / "c-guide.html"

# Map section title keywords → practice question links
PRACTICE = {
    "pointers": [
        ("q103-swap-two-integers-using-pointers", "q103 Swap"),
        ("q104-reverse-array-with-pointer-walking", "q104 Reverse"),
        ("q109-delete-node-double-pointer", "q109 Double pointer"),
    ],
    "arrays vs pointers": [
        ("q106-pointer-to-array-vs-array-of-pointers", "q106 Array of pointers"),
        ("q108-sort-array-of-string-pointers", "q108 String pointers"),
    ],
    "dynamic memory": [
        ("q53-createnode-allocate-initialize-a-new-node", "q53 Create node"),
        ("q70-freetree-must-use-postorder-children-before-parent", "q70 Free tree"),
    ],
    "memory manipulation": [
        ("q78-memset-memcpy-memmove-standard-functions", "q78 mem*"),
        ("q79-custom-memcpy", "q79 memcpy"),
        ("q80-custom-memmove-overlap-safe", "q80 memmove"),
        ("q81-custom-memset", "q81 memset"),
    ],
    "bit manipulation": [
        ("q27-set-clear-toggle-check-bit", "q27 Bits"),
        ("q32-count-set-bits-brian-kernighan-s-trick", "q32 Kernighan"),
        ("q39-bit-range-operations-set-clear-write-bits-in-start-end", "q39 Ranges"),
    ],
    "strings": [
        ("q01-reverse-a-string-in-place", "q01 Reverse string"),
        ("q11-reverse-words-in-a-string-in-place-three-reversal-trick", "q11 Words"),
        ("q97-implement-atoi-string-to-integer", "q97 atoi"),
    ],
    "structures": [
        ("q76-dma-descriptor-ring-nic-hardware-driver-style", "q76 DMA ring"),
    ],
    "memory-mapped": [
        ("q87-mmap-anonymous-memory-file-mapping", "q87 mmap"),
    ],
    "compilation": [
        ("index.html?section=parsing%20%26%20formatting", "Parsing section"),
    ],
}

SIDEBAR_GROUPS = [
    ("Basics", ["1-", "2-", "3-", "4-", "5-", "6-", "7-", "8-", "9-", "10-", "11-"]),
    ("Memory & pointers", ["12-", "13-", "14-", "15-", "16-", "17-", "18-"]),
    ("Systems", ["19-", "20-", "21-", "22-", "23-", "24-"]),
    ("Revision", ["25-", "26-"]),
]


def slugify(title: str) -> str:
    t = title.lower()
    t = re.sub(r"^[\d.]+\s*", "", t)
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t[:60] or "section"


def inline_md(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2">\1</a>',
        text,
    )
    return text


def practice_links(title: str) -> str:
    tl = title.lower()
    keys = []
    if "pointer" in tl and "function" not in tl and "array" not in tl:
        keys.append("pointers")
    if "array" in tl and "pointer" in tl:
        keys.append("arrays vs pointers")
    if "dynamic memory" in tl or "malloc" in tl:
        keys.append("dynamic memory")
    if "memcpy" in tl or "memmove" in tl or "memset" in tl or "memory manipulation" in tl:
        keys.append("memory manipulation")
    if "bit" in tl:
        keys.append("bit manipulation")
    if "string" in tl:
        keys.append("strings")
    if "struct" in tl or "union" in tl or "padding" in tl:
        keys.append("structures")
    if "mmap" in tl or "memory-mapped" in tl:
        keys.append("memory-mapped")
    if "compilation" in tl:
        keys.append("compilation")

    seen = set()
    links = []
    for k in keys:
        for item in PRACTICE.get(k, []):
            if item[0] in seen:
                continue
            seen.add(item[0])
            href = item[0] if item[0].startswith("index") else f"question.html?id={item[0]}"
            links.append(f'<a class="btn" href="{href}">{html.escape(item[1])}</a>')
    if not links:
        return ""
    return '<p class="guide-link-q">Practice: ' + " ".join(links) + "</p>"


def parse_sections(md: str) -> list[tuple[str, str, list[str]]]:
    """Return list of (level, title, body_lines) for ## sections only (main chapters)."""
    lines = md.splitlines()
    # Drop TOC block between first ## Table of Contents and next ## 1.
    sections: list[tuple[str, list[str]]] = []
    current_title: str | None = None
    current_body: list[str] = []

    for line in lines:
        if line.startswith("## "):
            if current_title is not None:
                sections.append((current_title, current_body))
            current_title = line[3:].strip()
            current_body = []
        else:
            if current_title is not None:
                # skip original TOC list under "Table of Contents"
                if current_title.lower().startswith("table of contents"):
                    continue
                current_body.append(line)
    if current_title is not None and not current_title.lower().startswith("table of contents"):
        sections.append((current_title, current_body))
    # filter out TOC if it got through
    return [(t, b) for t, b in sections if not t.lower().startswith("table of contents")]


def render_body(body_lines: list[str]) -> str:
    out: list[str] = []
    i = 0
    n = len(body_lines)

    while i < n:
        line = body_lines[i]

        # fenced code
        if line.strip().startswith("```"):
            lang = line.strip()[3:].strip() or "c"
            i += 1
            code_lines = []
            while i < n and not body_lines[i].strip().startswith("```"):
                code_lines.append(body_lines[i])
                i += 1
            if i < n:
                i += 1
            code = html.escape("\n".join(code_lines))
            cls = "language-c" if lang in ("c", "C", "") else f"language-{html.escape(lang)}"
            out.append(f'<pre class="guide-code"><code class="{cls}">{code}</code></pre>')
            continue

        # heading ### — Interview Q&A goes under Deep track
        if line.startswith("### "):
            heading = line[4:].strip()
            if re.search(r"interview\s*q", heading, re.I):
                # collect until next ###/#### or end of body chunk handled by caller
                deep = [f"<h3>{inline_md(heading)}</h3>"]
                i += 1
                while i < n and not body_lines[i].startswith("### "):
                    # stop before #### of next major? keep #### inside
                    if body_lines[i].startswith("## "):
                        break
                    deep_line = body_lines[i]
                    # reuse simple rendering for one line at a time via temp
                    if deep_line.strip().startswith("```"):
                        lang = deep_line.strip()[3:].strip() or "c"
                        i += 1
                        code_lines = []
                        while i < n and not body_lines[i].strip().startswith("```"):
                            code_lines.append(body_lines[i])
                            i += 1
                        if i < n:
                            i += 1
                        code = html.escape("\n".join(code_lines))
                        deep.append(
                            f'<pre class="guide-code"><code class="language-c">{code}</code></pre>'
                        )
                        continue
                    if deep_line.startswith("#### "):
                        deep.append(f"<h4>{inline_md(deep_line[5:].strip())}</h4>")
                        i += 1
                        continue
                    if deep_line.startswith(">"):
                        quote = []
                        while i < n and body_lines[i].startswith(">"):
                            quote.append(body_lines[i].lstrip("> ").rstrip())
                            i += 1
                        deep.append(
                            f'<div class="guide-takeaway">{inline_md(" ".join(quote))}</div>'
                        )
                        continue
                    if not deep_line.strip():
                        i += 1
                        continue
                    if re.match(r"^\s*[-*]\s+", deep_line):
                        items = []
                        while i < n and re.match(r"^\s*[-*]\s+", body_lines[i]):
                            items.append(re.sub(r"^\s*[-*]\s+", "", body_lines[i]))
                            i += 1
                        deep.append(
                            "<ul class=\"guide-list\">"
                            + "".join(f"<li>{inline_md(it)}</li>" for it in items)
                            + "</ul>"
                        )
                        continue
                    deep.append(f'<div class="guide-qa">{inline_md(deep_line.strip())}</div>')
                    i += 1
                out.append('<div class="guide-track-deep">' + "\n".join(deep) + "</div>")
                continue
            out.append(f"<h3>{inline_md(heading)}</h3>")
            i += 1
            continue
        if line.startswith("#### "):
            out.append(f"<h4>{inline_md(line[5:].strip())}</h4>")
            i += 1
            continue

        # blockquote
        if line.startswith(">"):
            quote = []
            while i < n and body_lines[i].startswith(">"):
                quote.append(body_lines[i].lstrip("> ").rstrip())
                i += 1
            out.append(f'<div class="guide-takeaway">{inline_md(" ".join(quote))}</div>')
            continue

        # table
        if "|" in line and i + 1 < n and re.match(r"^\s*\|?\s*[-:| ]+\s*$", body_lines[i + 1]):
            rows = []
            while i < n and "|" in body_lines[i]:
                if re.match(r"^\s*\|?\s*[-:| ]+\s*$", body_lines[i]):
                    i += 1
                    continue
                cells = [c.strip() for c in body_lines[i].strip().strip("|").split("|")]
                rows.append(cells)
                i += 1
            if rows:
                thead = "".join(f"<th>{inline_md(c)}</th>" for c in rows[0])
                tbody = ""
                for r in rows[1:]:
                    tbody += "<tr>" + "".join(f"<td>{inline_md(c)}</td>" for c in r) + "</tr>"
                out.append(
                    f'<table class="guide-table"><thead><tr>{thead}</tr></thead><tbody>{tbody}</tbody></table>'
                )
            continue

        # unordered list
        if re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < n and re.match(r"^\s*[-*]\s+", body_lines[i]):
                items.append(re.sub(r"^\s*[-*]\s+", "", body_lines[i]))
                i += 1
            out.append(
                "<ul class=\"guide-list\">"
                + "".join(f"<li>{inline_md(it)}</li>" for it in items)
                + "</ul>"
            )
            continue

        # ordered list
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", body_lines[i]):
                items.append(re.sub(r"^\s*\d+\.\s+", "", body_lines[i]))
                i += 1
            out.append(
                "<ol class=\"guide-trace\">"
                + "".join(f"<li>{inline_md(it)}</li>" for it in items)
                + "</ol>"
            )
            continue

        # blank
        if not line.strip():
            i += 1
            continue

        # Interview Q&A style paragraphs starting with **Q
        if line.strip().startswith("**Q") or line.strip().startswith("**A"):
            out.append(f'<div class="guide-qa">{inline_md(line.strip())}</div>')
            i += 1
            continue

        # plain paragraph (merge consecutive non-empty until blank)
        para = [line]
        i += 1
        while i < n and body_lines[i].strip() and not body_lines[i].startswith(
            ("#", ">", "```", "|", "-", "*")
        ) and not re.match(r"^\s*\d+\.\s+", body_lines[i]):
            if body_lines[i].startswith("###") or body_lines[i].startswith("####"):
                break
            para.append(body_lines[i])
            i += 1
        text = " ".join(p.strip() for p in para)
        # Skip noisy draft leftovers
        if text.lower() in ("or",):
            continue
        out.append(f'<p class="guide-plain">{inline_md(text)}</p>')

    return "\n".join(out)


def build_sidebar(sections: list[tuple[str, list[str]]]) -> str:
    items = []
    for title, _ in sections:
        sid = slugify(title)
        # number prefix for grouping
        m = re.match(r"^(\d+)\.", title)
        num = f"{m.group(1)}-" if m else ""
        label = re.sub(r"^[\d.]+\s*", "", title)
        if len(label) > 42:
            label = label[:40] + "…"
        items.append((num, sid, label))

    # group roughly by number ranges
    groups = [
        ("Basics", lambda n: n and int(n[:-1]) <= 11),
        ("Memory & pointers", lambda n: n and 12 <= int(n[:-1]) <= 18),
        ("Systems", lambda n: n and 19 <= int(n[:-1]) <= 24),
        ("Revision", lambda n: n and int(n[:-1]) >= 25),
    ]
    html_parts = ['<p class="guide-sidebar-title">On this page</p>', '<nav class="guide-sidebar-nav">']
    for gname, pred in groups:
        html_parts.append(f'<p class="guide-sidebar-group">{gname}</p>')
        for num, sid, label in items:
            if pred(num):
                html_parts.append(f'<a href="#{sid}">{html.escape(label)}</a>')
    # unnumbered leftovers
    for num, sid, label in items:
        if not num:
            html_parts.append(f'<a href="#{sid}">{html.escape(label)}</a>')
    html_parts.append("</nav>")
    html_parts.append(
        '<a class="guide-sidebar-cta btn btn-primary" href="index.html">← Home</a>'
    )
    html_parts.append(
        '<a class="guide-sidebar-cta btn" href="dsa-guide.html" style="margin-top:0.5rem">DSA Handbook →</a>'
    )
    return "\n".join(html_parts)


def special_diagrams(title: str) -> str:
    tl = title.lower()
    if "compilation" in tl:
        return """
<div class="guide-pipeline" aria-label="Compilation pipeline">
  <span class="guide-pipeline-step">.c</span><span class="guide-pipeline-arrow">→</span>
  <span class="guide-pipeline-step">preprocess .i</span><span class="guide-pipeline-arrow">→</span>
  <span class="guide-pipeline-step">compile .s</span><span class="guide-pipeline-arrow">→</span>
  <span class="guide-pipeline-step">assemble .o</span><span class="guide-pipeline-arrow">→</span>
  <span class="guide-pipeline-step">link exe</span><span class="guide-pipeline-arrow">→</span>
  <span class="guide-pipeline-step">load</span>
</div>"""
    if "storage classes" in tl or "memory layout" in tl or "process memory" in tl:
        return """
<div class="guide-mem-layout">high addresses
┌─────────────┐
│    stack    │  ↓ grows down
├─────────────┤
│     …       │
├─────────────┤
│    heap     │  ↑ grows up
├─────────────┤
│    .bss     │  zero-init globals
├─────────────┤
│    .data    │  initialized globals
├─────────────┤
│   .rodata   │  string literals, const
├─────────────┤
│    .text    │  machine code
└─────────────┘
low addresses</div>"""
    return ""


def main() -> None:
    md = SRC.read_text(encoding="utf-8")
    # Light editorial cleanup
    md = md.replace("\nor\n\nA **macro**", "\n\nA **macro**")
    md = re.sub(r"> this is \*\*pure C\*\*\.", "> Pure C — systems, embedded, and interview depth.", md)

    sections = parse_sections(md)
    sidebar = build_sidebar(sections)

    body_parts = []
    for title, body in sections:
        sid = slugify(title)
        display = title
        body_html = special_diagrams(title) + render_body(body)
        body_html += practice_links(title)
        body_parts.append(
            f'<section class="guide-section" id="{sid}">\n'
            f"<h2>{inline_md(display)}</h2>\n"
            f"{body_html}\n"
            f"</section>"
        )

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C Handbook · Lset Prep</title>
  <link rel="stylesheet" href="css/style.css?v=38">
</head>
<body data-page="guide" data-guide-track="quick">
  <header class="site-header">
    <div class="brand">
      <a href="index.html" class="brand-title">← Lset Prep</a>
      <span class="brand-sub">C handbook · systems &amp; interview depth</span>
    </div>
  </header>

  <div class="guide-layout">
    <aside class="guide-sidebar" aria-label="Table of contents">
{sidebar}
    </aside>

    <main class="guide-content">
      <header class="guide-hero">
        <p class="guide-kicker">IIT / MIT style handbook · pure C</p>
        <h1>C programming for systems interviews</h1>
        <p class="guide-lead">
          From the compilation pipeline to undefined behavior: memory layout, pointers,
          structs/padding, bit tricks, and the sharp facts interviewers probe.
          Diagrams and classic algorithms stay learning-friendly; tables and Q&amp;A add rigor.
          Pair with the <a href="dsa-guide.html">DSA Handbook</a> and live practice questions.
        </p>
        <div class="guide-track-bar">
          <span class="guide-track-bar-label">Reading track</span>
          <button type="button" class="guide-track-btn guide-track-active" data-track-set="quick">Quick</button>
          <button type="button" class="guide-track-btn" data-track-set="deep">Deep</button>
        </div>
        <p class="guide-plain" style="margin-top:0.5rem">
          <strong>Quick</strong> — skim definitions, diagrams, and takeaways.
          <strong>Deep</strong> — expand interview Q&amp;A density (same page; use Deep on DSA for pattern proofs).
        </p>
      </header>

{chr(10).join(body_parts)}

      <section class="guide-section" id="next-steps">
        <h2>Next steps</h2>
        <p class="guide-plain">Practice the matching Lset Prep categories, then return here for revision tables.</p>
        <div class="guide-cross-links">
          <a class="btn btn-primary" href="index.html?section=pointers">Pointers practice →</a>
          <a class="btn" href="index.html?section=bit%20manipulation">Bit manipulation →</a>
          <a class="btn" href="dsa-guide.html">DSA Handbook →</a>
          <a class="btn" href="index.html">← Home</a>
        </div>
      </section>
    </main>
  </div>

  <script src="js/guide-common.js?v=38"></script>
  <script src="js/c-guide.js?v=38"></script>
</body>
</html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"Wrote {OUT} ({len(sections)} sections, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
