/**
 * ESP32 OpenMAC guide — packet and AP-join step-through controls.
 */
(function () {
  "use strict";

  const FLOWS = {
    rx: [
      { stage: "RF + DMA", input: "802.11 MPDU on the selected channel", output: "Filled RX descriptor", owner: "ESP32 MAC/DMA", lifetime: "Until software detaches it" },
      { stage: "ISR defer", input: "DMA interrupt cause", output: "RX queue entry", owner: "Wi-Fi ISR", lifetime: "ISR only; no packet parsing" },
      { stage: "Descriptor walk", input: "Consecutive has_data descriptors", output: "Detached descriptor", owner: "wifi_hardware task", lifetime: "Until MAC handoff" },
      { stage: "MAC decapsulation", input: "802.11 header + LLC/SNAP", output: "Ethernet-form frame", owner: "OpenMAC", lifetime: "Copy or transfer must be explicit" },
      { stage: "esp_netif receive", input: "Ethernet-form frame", output: "LwIP packet", owner: "esp_netif/LwIP", lifetime: "Through verified free callback contract" },
      { stage: "Recycle", input: "Released descriptor/buffer", output: "Empty hardware-owned descriptor", owner: "DMA pool", lifetime: "Reusable after flags and length reset" },
    ],
    tx: [
      { stage: "LwIP transmit", input: "Ethernet destination/source/EtherType", output: "Driver TX request", owner: "esp_netif adapter", lifetime: "Valid for the documented callback scope" },
      { stage: "Encapsulate", input: "Ethernet frame", output: "From-DS 802.11 + LLC/SNAP", owner: "OpenMAC adapter", lifetime: "Smart frame allocated" },
      { stage: "Reserve slot", input: "Prepared smart frame", output: "One of five in-use slots", owner: "wifi_hardware", lifetime: "Until one completion path wins" },
      { stage: "Program DMA/MMIO", input: "Descriptor, length, rate, FCS", output: "Observed PLCP/config register sequence", owner: "wifi_hardware", lifetime: "Slot remains IN_FLIGHT" },
      { stage: "Radio attempt", input: "MAC/PHY metadata + MPDU", output: "Air transmission or error", owner: "ESP32 MAC/PHY", lifetime: "Through ACK/retry policy" },
      { stage: "Complete or timeout", input: "Completion bitmap or deadline", output: "Recycled frame + FREE slot", owner: "Serialized completion logic", lifetime: "Exactly once; guard late completion" },
    ],
    ap: [
      { stage: "Beacon / probe", input: "SSID, channel, capabilities", output: "BSS discovered", owner: "AP management plane", lifetime: "Repeated discovery traffic" },
      { stage: "802.11 authentication", input: "Authentication request", output: "Authentication response", owner: "Station + AP MAC", lifetime: "Link-layer state only" },
      { stage: "Association", input: "Capabilities and listen interval", output: "Association ID / accepted link", owner: "AP association table", lifetime: "Until disassociation or timeout" },
      { stage: "Security (if enabled)", input: "Association plus credentials", output: "Installed temporal keys", owner: "Authenticator/supplicant", lifetime: "Key lifetime; EAPOL is multi-message" },
      { stage: "DHCP Discover/Offer", input: "Client broadcast", output: "Server address proposal", owner: "LwIP DHCP server", lifetime: "IP configuration transaction" },
      { stage: "DHCP Request/ACK", input: "Client-selected offer", output: "Lease + local assigned-IP event", owner: "DHCP server/event loop", lifetime: "Lease duration; not association itself" },
    ],
  };

  function render(walkthrough, index, focusStage = false) {
    const type = walkthrough.dataset.walkthrough;
    const flow = FLOWS[type];
    if (!flow) return;
    const safeIndex = (index + flow.length) % flow.length;
    walkthrough.dataset.step = String(safeIndex);

    const stages = walkthrough.querySelector(".wifi-walk-stages");
    stages.innerHTML = flow
      .map(
        (item, i) =>
          `<button type="button" class="wifi-walk-stage${i === safeIndex ? " is-active" : ""}" data-step="${i}" aria-current="${i === safeIndex ? "step" : "false"}"><span>${i + 1}</span>${item.stage}</button>`
      )
      .join("");

    const item = flow[safeIndex];
    walkthrough.querySelector(".wifi-walk-count").textContent = `${safeIndex + 1} / ${flow.length}`;
    walkthrough.querySelector(".wifi-walk-detail").innerHTML = `
      <h4>${item.stage}</h4>
      <dl>
        <div><dt>Input</dt><dd>${item.input}</dd></div>
        <div><dt>Output</dt><dd>${item.output}</dd></div>
        <div><dt>Owner</dt><dd>${item.owner}</dd></div>
        <div><dt>Lifetime</dt><dd>${item.lifetime}</dd></div>
      </dl>`;

    stages.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => render(walkthrough, Number(button.dataset.step), true));
    });
    if (focusStage) stages.querySelector(`[data-step="${safeIndex}"]`).focus();
  }

  document.querySelectorAll(".wifi-walkthrough").forEach((walkthrough) => {
    walkthrough.querySelector(".wifi-walk-prev").addEventListener("click", () => {
      render(walkthrough, Number(walkthrough.dataset.step || 0) - 1);
    });
    walkthrough.querySelector(".wifi-walk-next").addEventListener("click", () => {
      render(walkthrough, Number(walkthrough.dataset.step || 0) + 1);
    });
    render(walkthrough, 0);
  });
})();
