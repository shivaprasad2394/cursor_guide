# ESP32 OpenMAC & Wi-Fi Driver Handbook

This handbook combines the two project walkthroughs into one corrected path through the experimental ESP32 OpenMAC build. Use **Quick** for the architecture and packet journey; switch to **Deep** for implementation hazards and interview prompts.

## 1. Scope, evidence, and project map

This is a study of one experimental, reverse-engineered driver—not a portable ESP32 Wi-Fi API. The inspected build explicitly targets the original ESP32 and ESP-IDF 5.0.1. Its hard-coded MMIO addresses, register bit meanings, timing choices, and PHY recovery sequence are **observations from this source tree**, not an official hardware specification.

> Evidence labels: **802.11 rule** means protocol-defined behavior; **source-observed** means directly visible in this build; **hypothesis** means a useful explanation that still needs measurement.

{{DIAGRAM:boundary}}

### Project map

| Layer | Build-specific role |
| --- | --- |
| `main/main.c` | Initializes NVS, `esp_netif`, events, BLE, then the Wi-Fi hardware task |
| `main/hardware.c` | MMIO, RX descriptors, five TX slots, ISR deferral, channel changes, recovery |
| Rust/C MAC component | 802.11 state and frame handling behind the C interface |
| `main/mac.c` | Adapts Ethernet-form frames between OpenMAC and `esp_netif`/LwIP |
| coexistence files | Software intent and BLE notifications around the shared 2.4 GHz radio |

:::deep
### Interview check

**Q. Why is “works on my ESP32” insufficient evidence for a register claim?**

**A.** A successful trace validates one chip revision, binary, clock/PHY state, and sequence. It does not establish a stable public register contract. Preserve traces, masks, and version guards; label inferred semantics.
:::

## 2. Hardware/software boundary and task ownership

The interrupt handler does minimal work: read and clear the DMA cause, then enqueue an RX event with a FromISR API. The pinned `wifi_hardware` task owns MMIO-facing work and creates the MAC task. This is a useful boundary, but it is not automatically race-free: TX-slot state is shared and must have one documented owner or explicit synchronization.

{{DIAGRAM:tasks}}

Source-observed resources are a hardware-event queue, an RX counting semaphore, a TX counting semaphore, ten RX descriptors, and five TX slots. A counting semaphore limits outstanding work; it does not protect arbitrary shared memory like a mutex.

> ISR rule: use only ISR-safe FreeRTOS calls, pass a `higherPriorityTaskWoken` flag when latency matters, and never block or perform heavy parsing in the ISR.

## 3. 802.11 frame anatomy and address mapping

A basic data MPDU contains MAC header, optional fields, payload, and a four-byte FCS. The LLC/SNAP header (`AA AA 03 00 00 00` plus EtherType) bridges an Ethernet-style protocol identifier into the 802.11 payload.

{{DIAGRAM:frame}}

### DS bits for an infrastructure BSS

| Direction | To DS | From DS | Addr1 | Addr2 | Addr3 |
| --- | --- | --- | --- | --- | --- |
| Station → AP | 1 | 0 | BSSID/AP | station/source | final destination |
| AP → station | 0 | 1 | station/destination | BSSID/AP | original source |

The inspected AP transmit path correctly emits data frames with `From DS = 1`, maps Ethernet destination to Addr1, AP/BSSID to Addr2, and Ethernet source to Addr3. Four-address WDS frames use both bits and are outside this build’s normal AP path.

Sequence control provides a sequence number and fragment number for duplicate handling. FCS is CRC-32 over the MPDU; whether software or hardware appends/checks it is a driver contract, not something to guess.

:::deep
### Precision points

- DSSS/CCK symbol and chip rates are not interchangeable with payload bit rate.
- OFDM airtime is computed in whole OFDM symbols after service, tail, and padding bits; do not divide bytes by headline Mbps alone.
- WPA authentication is not “an EAPOL packet.” Open-system 802.11 authentication and association happen first; WPA/WPA2 key establishment then uses multiple EAPOL-Key messages.
:::

## 4. End-to-end RX and descriptor lifetime

At boot, this build allocates ten linked DMA descriptors with 1600-byte buffers and gives ownership to hardware. A receive interrupt is deferred through the event queue. The hardware task walks consecutive descriptors marked with data, detaches each, and hands it to the MAC layer. Recycling restores size/flags and appends the descriptor back to the chain.

{{DIAGRAM:rx-ring}}
{{WALKTHROUGH:rx}}

The critical invariant is ownership: **hardware-owned descriptors are not writable by software; stack-owned payloads are not reusable until the release callback or copy contract completes**. A descriptor and its payload are related resources, but not necessarily governed by the same allocator.

## 5. End-to-end TX, PLCP, completion, and timeout hazards

The TX path converts an Ethernet frame to an 802.11 data frame, adds LLC/SNAP, obtains a smart frame, chooses one of five slots, prepares a DMA descriptor, programs observed PLCP/config registers, and starts transmission. This build appends CRC in software and configures its observed path accordingly.

{{DIAGRAM:tx-pipeline}}
{{WALKTHROUGH:tx}}

Completion reads a slot bitmap, clears a completion bit, recycles the smart frame, and marks the slot free. The fallback timeout is 50 ms. Timeout recovery is hazardous unless completion and timeout removal are serialized: a late completion can otherwise recycle a frame twice or refer to a reused slot.

> Production rule: model each slot as `FREE → PREPARED → IN_FLIGHT → COMPLETING → FREE`, attach a generation/cookie, and make exactly one path win completion.

## 6. AP lifecycle: discovery through DHCP

Beacons announce the BSS. A station may also send a probe request and receive a probe response. It then performs 802.11 authentication and association. Only after the link is usable does IP configuration occur.

{{DIAGRAM:ap-join}}
{{WALKTHROUGH:ap}}

DHCP direction must stay separate from association:

1. Client broadcasts **DHCPDISCOVER**.
2. AP-side DHCP server sends **DHCPOFFER**.
3. Client sends **DHCPREQUEST**.
4. Server sends **DHCPACK**.
5. ESP-IDF may report `IP_EVENT_AP_STAIPASSIGNED` after assignment; that event is a local notification, not a DHCP packet traveling to the client.

TIM is a bitmap-related indication that the AP buffers unicast traffic for sleeping stations. DTIM is a periodic TIM instance that also coordinates delivery of buffered broadcast/multicast traffic; it is not simply “the beacon where every client wakes.”

### Intra-BSS forwarding

If one associated station sends to another, an AP normally receives the `To DS` frame and transmits a separate `From DS` frame. Delivering only to LwIP is not automatically enough: the bridge/netif policy must explicitly forward local station traffic or intentionally isolate clients.

## 7. LwIP and esp_netif handoff

On TX, `esp_netif` gives the driver an Ethernet-form frame; the driver encapsulates it for 802.11. On RX, the MAC decapsulates 802.11 and presents an Ethernet-form frame to `esp_netif`.

{{DIAGRAM:ownership}}

The inspected tree contains two receive patterns with different-looking free arguments, including a sentinel marker. That is a warning sign, not a general recipe. The producer, `esp_netif_receive`, and `driver_free_rx_buffer` must agree on:

| Question | Required answer |
| --- | --- |
| Who allocated the payload? | DMA pool, heap, pbuf, or caller |
| Does receive copy or retain? | Verified API/version contract |
| What is passed to the free callback? | Actual buffer/token defined by the adapter |
| What happens on enqueue failure? | Caller releases exactly once |

Never infer ownership from a pointer value or comment alone. Test success, failure, delayed free, and shutdown paths with counters and poisoning in a debug build.

## 8. DCF, CCA, ACK timing, and PHY boundary

For ordinary unicast, a station senses the medium, waits the interframe rules, counts down a random backoff while idle, transmits, and expects an ACK after SIFS. Busy medium freezes the counter; a missing ACK drives retry/backoff policy. Broadcast and multicast are not individually ACKed.

{{DIAGRAM:dcf}}

CCA, modulation, channel filtering, gain control, and precise turnaround live at the PHY/RF boundary. MAC software supplies policy and frame metadata; it should not claim to implement RF facts merely because it writes an inferred register.

:::deep
### Airtime sanity

At 1 Mb/s DSSS, 100 payload bytes alone represent 800 µs, before PHY preamble/header and MAC overhead. At OFDM rates, add service/tail bits, coding, and round up to whole symbols. Use a standard-aware calculator or packet-capture radiotap timing rather than headline-rate arithmetic.
:::

## 9. Wi-Fi/BLE coexistence and recovery

Wi-Fi and BLE share the 2.4 GHz RF resources, but “BLE uses channels 37–39 so Wi-Fi can avoid them” is false. BLE has 40 two-MHz channels: 37 data channels plus three advertising channels. Adaptive Frequency Hopping can reduce use of poor data channels, but coexistence still needs arbitration.

{{DIAGRAM:coex}}

The source expresses PTA-like arbitration intent and BLE activity notifications. The observed fallback is reactive: after repeated TX timeout cycles, stop BLE advertising, recycle outstanding slots, attempt PHY/channel restoration, allow a Wi-Fi-only window, then restart advertising. One source comment explicitly marks full PHY reload as unsafe/crashing; therefore this is an experiment, not a production recovery guarantee.

Production alternatives include the vendor-supported Wi-Fi/Bluetooth coexistence stack, validated PTA configuration, traffic scheduling at application level, lowering advertising duty cycle, and hardware/module choices with characterized RF coexistence.

## 10. Hardening roadmap, Wireshark, and interview review

### Production-hardening roadmap

1. Replace unexplained constants with versioned register evidence and reset-value checks.
2. Make descriptor and TX-slot ownership explicit, serialized, and instrumented.
3. Bound every queue wait; count drops, retries, stale completions, and recovery entries.
4. Add real sequence-number, retry, ACK, rate-control, power-save, security, and fragmentation policies as required.
5. Validate AP bridge behavior, client isolation, DHCP lifecycle, and shutdown.
6. Prefer supported coexistence APIs; make recovery idempotent and test fault injection.

### Wireshark workflow

- Capture on the AP channel with a monitor-mode adapter; preserve radiotap metadata.
- Filter management traffic with `wlan.fc.type == 0`; inspect beacon, probe, authentication, and association in order.
- Filter DHCP with `bootp`; verify Discover/Offer/Request/ACK direction.
- Filter EAPOL with `eapol`; distinguish 802.11 authentication from WPA key exchange.
- Inspect `wlan.fc.tods`, `wlan.fc.fromds`, addresses, sequence/retry bits, and missing ACK symptoms.
- Correlate capture timestamps with firmware slot/descriptor generation IDs.

### Interview Q&A

:::deep
**Q. Why defer RX from an ISR?**

**A.** It bounds interrupt latency and moves parsing/allocation into task context. The queue also makes overload visible, provided drops are counted.

**Q. What is the strongest descriptor invariant?**

**A.** At every instant exactly one owner may mutate or recycle a descriptor, and every transfer has an observable state transition.

**Q. Does association mean the client has an IP address?**

**A.** No. Association establishes the 802.11 link. Security negotiation and DHCP may still follow.

**Q. Why is a timeout not proof that BLE owns the radio?**

**A.** Missing completion can come from collision, CCA, register sequencing, interrupt loss, stale state, or RF arbitration. It is a trigger for evidence gathering, not a unique diagnosis.
:::

### Practice next

- [Wi-Fi frame pack/unpack](question.html?id=q77-wifi-driver-pack-unpack-extract)
- [DMA descriptor ring](question.html?id=q76-dma-descriptor-ring-nic-hardware-driver-style)
- [Circular ring buffer](question.html?id=q75-circular-ring-buffer)
- [Scatter/gather-style DMA copy](question.html?id=q86-dma-style-buffer-copy-descriptor-scatter-gather)
