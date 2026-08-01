/**
 * ESP32 OpenMAC guide — automatic packet and AP-join flow animations.
 */
(function () {
  "use strict";

  const STEP_MS = 5200;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FLOWS = {
    rx: [
      { stage: "RF + DMA", input: "802.11 MPDU on the selected channel", output: "Filled RX descriptor", owner: "ESP32 MAC/DMA", lifetime: "Until software detaches it", why: "The radio writes into hardware-owned memory; software must not touch the descriptor while DMA owns it." },
      { stage: "ISR defer", input: "DMA interrupt cause", output: "RX queue entry", owner: "Wi-Fi ISR", lifetime: "ISR only; no packet parsing", why: "The interrupt stays short and moves expensive work into task context through an ISR-safe queue operation." },
      { stage: "Descriptor walk", input: "Consecutive has_data descriptors", output: "Detached descriptor", owner: "wifi_hardware task", lifetime: "Until MAC handoff", why: "Detaching transfers responsibility from the DMA chain to software without losing the descriptor that must later be recycled." },
      { stage: "MAC decapsulation", input: "802.11 header + LLC/SNAP", output: "Ethernet-form frame", owner: "OpenMAC", lifetime: "Copy or transfer must be explicit", why: "The Wi-Fi addresses, DS bits and LLC/SNAP metadata are translated into the Ethernet form expected by the IP stack." },
      { stage: "esp_netif receive", input: "Ethernet-form frame", output: "LwIP packet", owner: "esp_netif/LwIP", lifetime: "Through verified free callback contract", why: "The handoff contract decides whether the stack copied the bytes or retained a reference; guessing here causes leaks or use-after-free." },
      { stage: "Recycle", input: "Released descriptor/buffer", output: "Empty hardware-owned descriptor", owner: "DMA pool", lifetime: "Reusable after flags and length reset", why: "Resetting length and ownership returns capacity to the ring. Recycling too early lets DMA overwrite live stack data." },
    ],
    tx: [
      { stage: "LwIP transmit", input: "Ethernet destination/source/EtherType", output: "Driver TX request", owner: "esp_netif adapter", lifetime: "Valid for the documented callback scope", why: "The network stack supplies an Ethernet-form packet; this callback is the boundary where driver ownership begins." },
      { stage: "Encapsulate", input: "Ethernet frame", output: "From-DS 802.11 + LLC/SNAP", owner: "OpenMAC adapter", lifetime: "Smart frame allocated", why: "For AP-to-station traffic, Addr1 is the station, Addr2 is the BSSID and Addr3 preserves the original source." },
      { stage: "Reserve slot", input: "Prepared smart frame", output: "One of five in-use slots", owner: "wifi_hardware", lifetime: "Until one completion path wins", why: "A bounded pool avoids allocation in the hardware path, but exhaustion needs backpressure instead of silently overwriting an active slot." },
      { stage: "Program DMA/MMIO", input: "Descriptor, length, rate, FCS", output: "Observed PLCP/config register sequence", owner: "wifi_hardware", lifetime: "Slot remains IN_FLIGHT", why: "Descriptor contents must be visible before the transmit-start write. Register meanings here are source-observed, not a portable API." },
      { stage: "Radio attempt", input: "MAC/PHY metadata + MPDU", output: "Air transmission or error", owner: "ESP32 MAC/PHY", lifetime: "Through ACK/retry policy", why: "Hardware performs timing-sensitive CCA, DCF backoff, transmission and ACK handling that software cannot schedule at microsecond precision." },
      { stage: "Complete or timeout", input: "Completion bitmap or deadline", output: "Recycled frame + FREE slot", owner: "Serialized completion logic", lifetime: "Exactly once; guard late completion", why: "Completion and timeout can race. A generation cookie or strict state machine prevents a stale completion from freeing a reused slot." },
    ],
    ap: [
      { stage: "Beacon / probe", input: "SSID, channel, capabilities", output: "BSS discovered", owner: "AP management plane", lifetime: "Repeated discovery traffic", why: "Beacons advertise periodically; probe responses answer an active scan. Neither means the station is authenticated or associated." },
      { stage: "802.11 authentication", input: "Authentication request", output: "Authentication response", owner: "Station + AP MAC", lifetime: "Link-layer state only", why: "Open-system authentication is an 802.11 management exchange and is separate from WPA key establishment." },
      { stage: "Association", input: "Capabilities and listen interval", output: "Association ID / accepted link", owner: "AP association table", lifetime: "Until disassociation or timeout", why: "Association creates the AP's station context and confirms supported parameters; it still does not assign an IP address." },
      { stage: "Security (if enabled)", input: "Association plus credentials", output: "Installed temporal keys", owner: "Authenticator/supplicant", lifetime: "Key lifetime; EAPOL is multi-message", why: "WPA/WPA2 uses several EAPOL-Key messages carried at layer 2. Treating EAPOL as one IP packet is incorrect." },
      { stage: "DHCP Discover/Offer", input: "Client broadcast", output: "Server address proposal", owner: "LwIP DHCP server", lifetime: "IP configuration transaction", why: "The client asks for configuration only after the Wi-Fi link is usable; the offer proposes, but does not yet finalize, a lease." },
      { stage: "DHCP Request/ACK", input: "Client-selected offer", output: "Lease + local assigned-IP event", owner: "DHCP server/event loop", lifetime: "Lease duration; not association itself", why: "The ACK commits the lease. ESP-IDF's assigned-IP event is a local notification, not a packet sent to the station." },
    ],
  };

  const SEQUENCES = {
    rx: {
      actors: ["PHY / DMA", "Wi-Fi ISR", "wifi_hardware", "MAC task (C)", "esp_netif / LwIP"],
      events: [
        { from: 0, to: 1, call: "DMA fills descriptor; interrupt", ref: "hardware.c:330–340" },
        { from: 1, to: 2, call: "queue RX_ENTRY", ref: "hardware.c:335–339" },
        { from: 2, to: 3, call: "c_hand_rx_to_mac_stack(dma_item)", ref: "80211_mac_interface.c:167–177" },
        { from: 3, to: 3, call: "handle_ap_rx_data(): ToDS → Ethernet", ref: "80211_mac.c:542–586" },
        { from: 3, to: 4, call: "mac_ap_netif_receive(eth_buf, len)", ref: "mac.c:31–43" },
        { from: 3, to: 2, call: "rs_recycle_dma_item(dma_item)", ref: "hardware.c:367–386" },
      ],
    },
    tx: {
      actors: ["LwIP", "mac.c driver", "MAC event queue", "802.11 MAC (C)", "hardware.c", "MMIO / Radio"],
      events: [
        { from: 0, to: 1, call: "openmac_netif_transmit(buffer, len)", ref: "mac.c:48–57" },
        { from: 1, to: 2, call: "c_transmit_data_frame(): malloc + copy", ref: "80211_mac_interface.c:219–238" },
        { from: 2, to: 3, call: "handle_ap_tx_data(): Ethernet → FromDS", ref: "80211_mac.c:664–793" },
        { from: 3, to: 4, call: "rs_tx_smart_frame(smart_frame)", ref: "80211_mac_interface.c:127–163" },
        { from: 4, to: 5, call: "CRC + descriptor + PLCP/MMIO kick", ref: "hardware.c:191–253" },
        { from: 5, to: 4, call: "ISR 0x80 → processTxComplete()", ref: "hardware.c:320–340" },
      ],
    },
    ap: {
      actors: ["Station", "RX DMA / ISR", "AP MAC (C)", "TX hardware", "LwIP DHCP"],
      events: [
        { from: 2, to: 0, call: "Beacon / Probe response", ref: "80211_mac.c:382–408, 620–659" },
        { from: 0, to: 2, call: "Authentication request → response", ref: "80211_mac.c:411–467" },
        { from: 0, to: 2, call: "Association request → AID response", ref: "80211_mac.c:470–537" },
        { from: 0, to: 2, call: "EAPOL-Key exchange (not implemented)", ref: "Production security stage" },
        { from: 0, to: 4, call: "DHCPDISCOVER → DHCPOFFER", ref: "LwIP AP netif after association" },
        { from: 4, to: 0, call: "DHCPREQUEST → DHCPACK / lease", ref: "IP_EVENT_AP_STAIPASSIGNED is local" },
      ],
    },
  };

  function escapeSvg(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSequence(walkthrough, activeIndex) {
    const kind = walkthrough.dataset.walkthrough;
    const sequence = SEQUENCES[kind];
    const target = walkthrough.querySelector(".wifi-callflow");
    if (!sequence || !target) return;

    const width = 1100;
    const side = 70;
    const headerY = 12;
    const headerHeight = 50;
    const eventStart = 105;
    const rowHeight = 66;
    const height = eventStart + sequence.events.length * rowHeight + 24;
    const gap = (width - side * 2) / (sequence.actors.length - 1);
    const xAt = (index) => side + index * gap;
    const markerId = `wifi-seq-arrow-${kind}`;
    const activeMarkerId = `wifi-seq-arrow-active-${kind}`;

    const actors = sequence.actors
      .map((actor, index) => {
        const x = xAt(index);
        return `
          <g class="wifi-seq-actor">
            <rect x="${x - 74}" y="${headerY}" width="148" height="${headerHeight}" rx="7"></rect>
            <text x="${x}" y="${headerY + 30}">${escapeSvg(actor)}</text>
            <line x1="${x}" y1="${headerY + headerHeight}" x2="${x}" y2="${height - 12}"></line>
          </g>`;
      })
      .join("");

    const events = sequence.events
      .map((event, index) => {
        const fromX = xAt(event.from);
        const toX = xAt(event.to);
        const y = eventStart + index * rowHeight;
        const state = index === activeIndex ? " is-active" : index < activeIndex ? " is-complete" : "";
        const marker = index === activeIndex ? activeMarkerId : markerId;
        const labelX = event.from === event.to ? fromX + 48 : (fromX + toX) / 2;
        const anchor = event.from === event.to ? "start" : "middle";
        const arrow =
          event.from === event.to
            ? `<path d="M ${fromX} ${y} h 62 v 25 h -62" marker-end="url(#${marker})"></path>`
            : `<line x1="${fromX}" y1="${y}" x2="${toX}" y2="${y}" marker-end="url(#${marker})"></line>`;
        return `
          <g class="wifi-seq-event${state}" data-seq-step="${index}">
            ${arrow}
            <text class="wifi-seq-call" x="${labelX}" y="${y - 9}" text-anchor="${anchor}">${escapeSvg(event.call)}</text>
            <text class="wifi-seq-ref" x="${labelX}" y="${y + 18}" text-anchor="${anchor}">${escapeSvg(event.ref)}</text>
          </g>`;
      })
      .join("");

    target.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeSvg(kind.toUpperCase())} source call sequence">
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z"></path>
          </marker>
          <marker id="${activeMarkerId}" class="wifi-seq-marker-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z"></path>
          </marker>
        </defs>
        ${actors}
        ${events}
      </svg>`;
  }

  function render(walkthrough, index, focusStage = false) {
    const flow = FLOWS[walkthrough.dataset.walkthrough];
    if (!flow) return;

    const safeIndex = (index + flow.length) % flow.length;
    walkthrough.dataset.step = String(safeIndex);
    const stageButtons = walkthrough.querySelectorAll(".wifi-walk-stage");
    stageButtons.forEach((button, i) => {
      button.classList.toggle("is-active", i === safeIndex);
      button.classList.toggle("is-complete", i < safeIndex);
      if (i === safeIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    const item = flow[safeIndex];
    const sourceEvent = SEQUENCES[walkthrough.dataset.walkthrough].events[safeIndex];
    walkthrough.querySelector(".wifi-walk-count").textContent = `Stage ${safeIndex + 1} of ${flow.length}`;
    walkthrough.querySelector(".wifi-walk-detail").innerHTML = `
      <div class="wifi-walk-detail-title">
        <span>${String(safeIndex + 1).padStart(2, "0")}</span>
        <h4>${item.stage}</h4>
      </div>
      <dl>
        <div><dt>Input</dt><dd>${item.input}</dd></div>
        <div><dt>Output</dt><dd>${item.output}</dd></div>
        <div><dt>Owner</dt><dd>${item.owner}</dd></div>
        <div><dt>Lifetime</dt><dd>${item.lifetime}</dd></div>
      </dl>
      <div class="wifi-walk-source"><strong>Source call</strong><code>${sourceEvent.call}</code><span>${sourceEvent.ref}</span></div>
      <p class="wifi-walk-why"><strong>Why this stage matters</strong>${item.why}</p>`;
    renderSequence(walkthrough, safeIndex);

    const progress = walkthrough.querySelector(".wifi-walk-progress span");
    progress.classList.remove("is-running");
    void progress.offsetWidth;
    if (walkthrough.dataset.playing === "true") progress.classList.add("is-running");

    if (focusStage) stageButtons[safeIndex].focus();
  }

  function stop(walkthrough) {
    window.clearInterval(walkthrough._flowTimer);
    walkthrough._flowTimer = null;
    walkthrough.dataset.playing = "false";
    walkthrough.querySelector(".wifi-walk-progress span").classList.remove("is-running");
  }

  function start(walkthrough) {
    if (walkthrough._userPaused || !walkthrough._visible || document.hidden) return;
    stop(walkthrough);
    walkthrough.dataset.playing = "true";
    walkthrough._flowTimer = window.setInterval(() => {
      render(walkthrough, Number(walkthrough.dataset.step || 0) + 1);
    }, STEP_MS);
    const progress = walkthrough.querySelector(".wifi-walk-progress span");
    void progress.offsetWidth;
    progress.classList.add("is-running");
  }

  function updateToggle(walkthrough) {
    const button = walkthrough.querySelector(".wifi-walk-toggle");
    const paused = Boolean(walkthrough._userPaused);
    button.textContent = paused ? "Play animation" : "Pause animation";
    button.setAttribute("aria-pressed", String(paused));
  }

  function init(walkthrough) {
    const flow = FLOWS[walkthrough.dataset.walkthrough];
    if (!flow) return;

    const stages = walkthrough.querySelector(".wifi-walk-stages");
    stages.innerHTML = flow
      .map(
        (item, i) =>
          `<button type="button" class="wifi-walk-stage" data-step="${i}"><span>${i + 1}</span>${item.stage}</button>`
      )
      .join("");

    walkthrough._userPaused = reduceMotion;
    walkthrough._visible = false;
    walkthrough.dataset.playing = "false";
    stages.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        render(walkthrough, Number(button.dataset.step), true);
        if (!walkthrough._userPaused) start(walkthrough);
      });
    });
    walkthrough.querySelector(".wifi-walk-toggle").addEventListener("click", () => {
      walkthrough._userPaused = !walkthrough._userPaused;
      updateToggle(walkthrough);
      if (walkthrough._userPaused) stop(walkthrough);
      else start(walkthrough);
    });

    walkthrough.addEventListener("mouseenter", () => stop(walkthrough));
    walkthrough.addEventListener("mouseleave", () => start(walkthrough));
    walkthrough.addEventListener("focusin", () => stop(walkthrough));
    walkthrough.addEventListener("focusout", () => window.setTimeout(() => start(walkthrough), 0));

    updateToggle(walkthrough);
    render(walkthrough, 0);
  }

  const walkthroughs = [...document.querySelectorAll(".wifi-walkthrough")];
  walkthroughs.forEach(init);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const walkthrough = entry.target;
        walkthrough._visible = entry.isIntersecting;
        if (entry.isIntersecting) start(walkthrough);
        else stop(walkthrough);
      });
    },
    { threshold: 0.35 }
  );
  walkthroughs.forEach((walkthrough) => observer.observe(walkthrough));

  document.addEventListener("visibilitychange", () => {
    walkthroughs.forEach((walkthrough) => {
      if (document.hidden) stop(walkthrough);
      else start(walkthrough);
    });
  });
})();
