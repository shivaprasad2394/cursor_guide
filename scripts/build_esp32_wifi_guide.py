#!/usr/bin/env python3
"""Build esp32-wifi-guide.html from the maintainable Markdown source."""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "esp32_openmac_wifi_guide.md"
OUT = ROOT / "esp32-wifi-guide.html"
ASSET_VERSION = "45"


def slugify(text: str) -> str:
    text = re.sub(r"^\d+\.\s+", "", text.lower())
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-") or "section"


def inline(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', escaped)
    return escaped


def flow(nodes: list[tuple[str, str]], label: str) -> str:
    parts = []
    for index, (title, detail) in enumerate(nodes):
        parts.append(
            f'<div class="wifi-node"><strong>{html.escape(title)}</strong>'
            f'<span>{html.escape(detail)}</span></div>'
        )
        if index != len(nodes) - 1:
            parts.append('<span class="wifi-arrow" aria-hidden="true">→</span>')
    return f'<div class="wifi-diagram wifi-flow" role="img" aria-label="{html.escape(label)}">{"".join(parts)}</div>'


def diagram(name: str) -> str:
    if name == "boundary":
        return """
<figure class="wifi-diagram wifi-boundary">
  <figcaption>System boundary — protocol rules above, observed hardware contract below</figcaption>
  <div class="wifi-layer wifi-layer-app">Application / UART bridge / services</div>
  <div class="wifi-layer wifi-layer-stack">LwIP + esp_netif <span>Ethernet-form packets</span></div>
  <div class="wifi-layer wifi-layer-mac">OpenMAC C/Rust logic <span>802.11 state + framing</span></div>
  <div class="wifi-layer wifi-layer-hal">hardware.c <span>DMA descriptors · slots · MMIO</span></div>
  <div class="wifi-layer wifi-layer-rf">ESP32 MAC / PHY / shared 2.4 GHz RF</div>
</figure>"""
    if name == "tasks":
        return """
<figure class="wifi-diagram">
  <figcaption>Two task domains and deferred interrupt work</figcaption>
  <div class="wifi-topology">
    <div class="wifi-node"><strong>Wi-Fi ISR</strong><span>read + clear cause</span></div>
    <span class="wifi-arrow" aria-hidden="true">→</span><div class="wifi-queue">hardware_event_queue<br><small>RX / TX / channel</small></div>
    <span class="wifi-arrow" aria-hidden="true">→</span><div class="wifi-node wifi-node-hot"><strong>wifi_hardware</strong><span>MMIO + descriptor owner</span></div>
    <span class="wifi-arrow" aria-hidden="true">⇄</span><div class="wifi-node"><strong>rs_wifi MAC task</strong><span>802.11 policy</span></div>
  </div>
  <div class="wifi-topology wifi-topology-secondary">
    <div class="wifi-node"><strong>LwIP task context</strong><span>Ethernet-form TX/RX</span></div>
    <span class="wifi-arrow" aria-hidden="true">⇄</span><div class="wifi-queue">esp_netif adapter</div>
    <span class="wifi-arrow" aria-hidden="true">⇄</span><div class="wifi-node"><strong>OpenMAC</strong><span>explicit ownership boundary</span></div>
  </div>
</figure>"""
    if name == "frame":
        return """
<figure class="wifi-diagram">
  <figcaption>Basic 802.11 data MPDU (sizes vary with optional fields)</figcaption>
  <div class="wifi-frame">
    <span style="--w:2"><b>Frame control</b><small>2 B</small></span>
    <span style="--w:2"><b>Duration</b><small>2 B</small></span>
    <span style="--w:6"><b>Addr1</b><small>6 B</small></span>
    <span style="--w:6"><b>Addr2</b><small>6 B</small></span>
    <span style="--w:6"><b>Addr3</b><small>6 B</small></span>
    <span style="--w:2"><b>Sequence</b><small>2 B</small></span>
    <span class="wifi-frame-payload" style="--w:9"><b>LLC/SNAP + payload</b><small>variable</small></span>
    <span class="wifi-frame-fcs" style="--w:4"><b>FCS</b><small>4 B</small></span>
  </div>
</figure>"""
    if name == "rx-ring":
        return """
<figure class="wifi-diagram">
  <figcaption>RX descriptor lifecycle — logical ring formed by recycling</figcaption>
  <svg class="wifi-ring-svg" viewBox="0 0 720 210" role="img" aria-label="RX descriptors circulate between hardware, MAC and recycle stages">
    <defs><marker id="wifiArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>
    <path class="wifi-ring-path" d="M120 105 C120 25 600 25 600 105 C600 185 120 185 120 105" marker-end="url(#wifiArrow)"/>
    <g class="wifi-svg-card" transform="translate(45 72)"><rect width="150" height="66" rx="9"/><text x="75" y="27">HW-owned</text><text class="sub" x="75" y="48">owner=1 · empty</text></g>
    <g class="wifi-svg-card" transform="translate(285 20)"><rect width="150" height="66" rx="9"/><text x="75" y="27">DMA filled</text><text class="sub" x="75" y="48">has_data=1</text></g>
    <g class="wifi-svg-card" transform="translate(525 72)"><rect width="150" height="66" rx="9"/><text x="75" y="27">MAC consumes</text><text class="sub" x="75" y="48">descriptor detached</text></g>
    <g class="wifi-svg-card" transform="translate(285 124)"><rect width="150" height="66" rx="9"/><text x="75" y="27">Recycle</text><text class="sub" x="75" y="48">reset · append</text></g>
  </svg>
</figure>"""
    if name == "tx-pipeline":
        return flow(
            [
                ("Ethernet", "14-byte header"),
                ("Encapsulate", "802.11 + LLC"),
                ("TX slot", "one of five"),
                ("Descriptor", "payload + FCS"),
                ("PLCP/MMIO", "observed sequence"),
                ("Complete", "recycle once"),
            ],
            "TX pipeline from Ethernet frame to completion",
        )
    if name == "ap-join":
        return """
<figure class="wifi-diagram">
  <figcaption>AP join is link setup first, IP configuration later</figcaption>
  <div class="wifi-sequence">
    <div class="wifi-lane"><strong>Station</strong><strong>ESP32 AP</strong><strong>DHCP server</strong></div>
    <div class="wifi-message" style="--from:1;--to:2"><span>Probe request</span></div>
    <div class="wifi-message reverse" style="--from:1;--to:2"><span>Probe response</span></div>
    <div class="wifi-message" style="--from:1;--to:2"><span>Authentication + association</span></div>
    <div class="wifi-message" style="--from:1;--to:3"><span>Discover / Request</span></div>
    <div class="wifi-message reverse" style="--from:1;--to:3"><span>Offer / ACK</span></div>
  </div>
</figure>"""
    if name == "ownership":
        return """
<figure class="wifi-diagram">
  <figcaption>Buffer ownership must cross each boundary exactly once</figcaption>
  <div class="wifi-ownership">
    <div><strong>DMA pool</strong><span>descriptor + radio buffer</span><em>recycle callback</em></div>
    <span>→ copy or transfer →</span>
    <div><strong>OpenMAC</strong><span>802.11 ↔ Ethernet</span><em>document allocator</em></div>
    <span>→ verified contract →</span>
    <div><strong>esp_netif / LwIP</strong><span>copy or retained reference</span><em>release exactly once</em></div>
  </div>
</figure>"""
    if name == "dcf":
        return """
<figure class="wifi-diagram">
  <figcaption>Simplified successful unicast DCF timeline</figcaption>
  <div class="wifi-timeline">
    <span class="busy">medium busy</span><span class="wait">DIFS</span>
    <span class="slot">7</span><span class="slot">6</span><span class="slot frozen">busy: freeze</span>
    <span class="wait">DIFS</span><span class="slot">5</span><span class="slot">…</span><span class="slot">0</span>
    <span class="tx">DATA</span><span class="wait">SIFS</span><span class="ack">ACK</span>
  </div>
</figure>"""
    if name == "coex":
        return """
<figure class="wifi-diagram">
  <figcaption>Observed reactive recovery state flow (experimental)</figcaption>
  <div class="wifi-state-flow">
    <div class="wifi-state active"><strong>Shared operation</strong><span>Wi-Fi + BLE advertising</span></div>
    <span>3 timeout cycles</span>
    <div class="wifi-state warning"><strong>Pause BLE</strong><span>release outstanding slots</span></div>
    <span>restore attempt</span>
    <div class="wifi-state"><strong>Wi-Fi-only window</strong><span>channel / MAC recovery</span></div>
    <span>after 5 s</span>
    <div class="wifi-state"><strong>Restart BLE</strong><span>return to shared operation</span></div>
  </div>
</figure>"""
    raise ValueError(f"Unknown diagram: {name}")


def walkthrough(kind: str) -> str:
    labels = {"rx": "RX packet", "tx": "TX packet", "ap": "AP join"}
    return f"""
<div class="wifi-walkthrough" data-walkthrough="{kind}">
  <div class="wifi-walk-head">
    <div>
      <span class="wifi-walk-kicker">Automatic {labels[kind]} flow</span>
      <span class="wifi-walk-count" aria-live="polite"></span>
    </div>
    <button class="btn wifi-walk-toggle" type="button" aria-pressed="false">Pause animation</button>
  </div>
  <div class="wifi-walk-stages" aria-label="{labels[kind]} stages"></div>
  <div class="wifi-walk-detail" aria-live="polite"></div>
  <div class="wifi-walk-progress" aria-hidden="true"><span></span></div>
</div>"""


def render_blocks(lines: list[str]) -> str:
    out: list[str] = []
    index = 0
    deep = False
    while index < len(lines):
        raw = lines[index]
        line = raw.strip()
        if not line:
            index += 1
            continue
        if line == ":::deep":
            out.append('<div class="guide-track-deep">')
            deep = True
            index += 1
            continue
        if line == ":::" and deep:
            out.append("</div>")
            deep = False
            index += 1
            continue
        marker = re.fullmatch(r"\{\{DIAGRAM:([^}]+)\}\}", line)
        if marker:
            out.append(diagram(marker.group(1)))
            index += 1
            continue
        marker = re.fullmatch(r"\{\{WALKTHROUGH:([^}]+)\}\}", line)
        if marker:
            out.append(walkthrough(marker.group(1)))
            index += 1
            continue
        if line.startswith("```"):
            language = line[3:].strip() or "text"
            code: list[str] = []
            index += 1
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code.append(lines[index])
                index += 1
            index += 1
            out.append(f'<pre class="guide-code"><code class="language-{html.escape(language)}">{html.escape(chr(10).join(code))}</code></pre>')
            continue
        if line.startswith("### "):
            out.append(f"<h3>{inline(line[4:])}</h3>")
            index += 1
            continue
        if line.startswith("> "):
            quote: list[str] = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote.append(lines[index].strip().lstrip("> "))
                index += 1
            out.append(f'<div class="guide-takeaway">{inline(" ".join(quote))}</div>')
            continue
        if "|" in line and index + 1 < len(lines) and re.match(r"^\s*\|?\s*[-:| ]+\|?\s*$", lines[index + 1]):
            rows: list[list[str]] = []
            while index < len(lines) and "|" in lines[index]:
                current = lines[index].strip()
                index += 1
                if re.match(r"^\|?\s*[-:| ]+\|?$", current):
                    continue
                rows.append([cell.strip() for cell in current.strip("|").split("|")])
            head = "".join(f"<th>{inline(cell)}</th>" for cell in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in row) + "</tr>" for row in rows[1:])
            out.append(f'<div class="guide-table-wrap"><table class="guide-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
            continue
        if re.match(r"^[-*]\s+", line):
            items: list[str] = []
            while index < len(lines) and re.match(r"^\s*[-*]\s+", lines[index]):
                items.append(re.sub(r"^\s*[-*]\s+", "", lines[index]))
                index += 1
            out.append('<ul class="guide-list">' + "".join(f"<li>{inline(item)}</li>" for item in items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", line):
            items = []
            while index < len(lines) and re.match(r"^\s*\d+\.\s+", lines[index]):
                items.append(re.sub(r"^\s*\d+\.\s+", "", lines[index]))
                index += 1
            out.append('<ol class="guide-trace">' + "".join(f"<li>{inline(item)}</li>" for item in items) + "</ol>")
            continue
        paragraph = [line]
        index += 1
        while index < len(lines) and lines[index].strip() and not re.match(
            r"^(### |>|```|\{\{|:::|\s*[-*]\s+|\s*\d+\.\s+)", lines[index]
        ) and not ("|" in lines[index] and index + 1 < len(lines) and re.match(r"^\s*\|?\s*[-:| ]+\|?\s*$", lines[index + 1])):
            paragraph.append(lines[index].strip())
            index += 1
        out.append(f'<p class="guide-plain">{inline(" ".join(paragraph))}</p>')
    if deep:
        out.append("</div>")
    return "\n".join(out)


def parse_source(source: str) -> tuple[str, str, list[tuple[str, list[str]]]]:
    lines = source.splitlines()
    title = lines[0].removeprefix("# ").strip()
    sections: list[tuple[str, list[str]]] = []
    intro: list[str] = []
    current_title: str | None = None
    current: list[str] = []
    for line in lines[1:]:
        if line.startswith("## "):
            if current_title is None:
                intro = current
            else:
                sections.append((current_title, current))
            current_title = line[3:].strip()
            current = []
        else:
            current.append(line)
    if current_title:
        sections.append((current_title, current))
    return title, render_blocks(intro), sections


def main() -> None:
    title, intro, sections = parse_source(SRC.read_text(encoding="utf-8"))
    nav_items = []
    for section_title, _ in sections:
        nav_label = re.sub(r"^\d+\.\s+", "", section_title)
        nav_items.append(
            f'<a href="#{slugify(section_title)}">{html.escape(nav_label)}</a>'
        )
    nav = "\n".join(nav_items)
    body = "\n".join(
        f'<section class="guide-section" id="{slugify(section_title)}">'
        f"<h2>{inline(section_title)}</h2>{render_blocks(section_lines)}</section>"
        for section_title, section_lines in sections
    )
    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Technically corrected ESP32 OpenMAC and Wi-Fi driver handbook with interactive packet walkthroughs.">
  <title>{html.escape(title)} · Lset Prep</title>
  <link rel="stylesheet" href="css/style.css?v={ASSET_VERSION}">
</head>
<body data-page="guide" data-guide-track="quick">
  <header class="site-header">
    <div class="brand">
      <a href="index.html" class="brand-title">← Lset Prep</a>
      <span class="brand-sub">ESP32 OpenMAC · Wi-Fi driver handbook</span>
    </div>
  </header>
  <div class="guide-layout">
    <aside class="guide-sidebar" aria-label="Table of contents">
      <p class="guide-sidebar-title">On this page</p>
      <nav class="guide-sidebar-nav">{nav}</nav>
      <a class="guide-sidebar-cta btn btn-primary" href="index.html">← Home</a>
      <a class="guide-sidebar-cta btn" href="c-guide.html">C Handbook →</a>
    </aside>
    <main class="guide-content">
      <header class="guide-hero wifi-guide-hero">
        <p class="guide-kicker">Experimental driver study · corrected protocol model</p>
        <h1>{html.escape(title)}</h1>
        <div class="guide-lead">{intro}</div>
        <div class="guide-track-bar" role="group" aria-label="Reading track">
          <span class="guide-track-bar-label">Reading track</span>
          <button type="button" class="guide-track-btn guide-track-active" data-track-set="quick" aria-pressed="true">Quick</button>
          <button type="button" class="guide-track-btn" data-track-set="deep" aria-pressed="false">Deep</button>
        </div>
      </header>
      {body}
      <section class="guide-section" id="related-handbooks">
        <h2>Related handbooks</h2>
        <div class="guide-cross-links">
          <a class="btn btn-primary" href="index.html?section=buffers%20%26%20driver%20patterns">Driver practice →</a>
          <a class="btn" href="c-guide.html">C Handbook →</a>
          <a class="btn" href="dsa-guide.html">DSA Handbook →</a>
          <a class="btn" href="index.html">← Home</a>
        </div>
      </section>
    </main>
  </div>
  <script src="js/guide-common.js?v={ASSET_VERSION}"></script>
  <script src="js/esp32-wifi-guide.js?v={ASSET_VERSION}"></script>
</body>
</html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"Wrote {OUT} ({len(sections)} sections, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
