/**
 * list-viz.js — rich linked-list Execution Studio (heap nodes + stack pointers).
 * Used when live C tracing can't handle struct/typedef (all linked-list questions).
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseValues(meta) {
  return String(meta.listNodes || "1,2,3,4,5")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildLinear(values) {
  return values.map((val, i) => ({
    id: i,
    val: String(val),
    next: i < values.length - 1 ? i + 1 : null,
  }));
}

function cloneHeap(heap) {
  return heap.map((n) => ({ ...n }));
}

function snap(base) {
  return { ...base, heap: cloneHeap(base.heap) };
}

function inferOp(meta) {
  const t = `${meta.id || ""} ${meta.title || ""}`.toLowerCase();
  if (/reverse/i.test(t)) return "reverse";
  if (/middle|slow|fast/i.test(t)) return "middle";
  if (/cycle|floyd|tortoise|hare/i.test(t)) return "cycle";
  if (/merge/i.test(t)) return "merge";
  if (/remove.*nth|nth.*end/i.test(t)) return "remove-nth";
  if (/insertathead|insert.*head|prepend/i.test(t)) return "insert-head";
  if (/insertatend|insert.*tail|insert.*end/i.test(t)) return "insert-tail";
  if (/delete.*double|delete.*address|delete-node-double/i.test(t)) return "delete-target";
  if (/delete|deletenode/i.test(t)) return "delete";
  if (/createnode|create.*node/i.test(t)) return "create";
  if (/freelist/i.test(t)) return "free";
  if (/printlist/i.test(t)) return "print";
  return "traverse";
}

const SNIPPETS = {
  reverse: [
    { id: 1, text: "Node *reverseList(Node *head) {" },
    { id: 2, text: "    Node *prev = NULL, *cur = head;" },
    { id: 3, text: "    while (cur != NULL) {" },
    { id: 4, text: "        Node *next = cur->next;" },
    { id: 5, text: "        cur->next = prev;" },
    { id: 6, text: "        prev = cur;" },
    { id: 7, text: "        cur = next;" },
    { id: 8, text: "    }" },
    { id: 9, text: "    return prev;" },
    { id: 10, text: "}" },
  ],
  middle: [
    { id: 1, text: "Node *findMiddle(Node *head) {" },
    { id: 2, text: "    Node *slow = head, *fast = head;" },
    { id: 3, text: "    while (fast && fast->next) {" },
    { id: 4, text: "        slow = slow->next;" },
    { id: 5, text: "        fast = fast->next->next;" },
    { id: 6, text: "    }" },
    { id: 7, text: "    return slow;" },
    { id: 8, text: "}" },
  ],
  cycle: [
    { id: 1, text: "int hasCycle(Node *head) {" },
    { id: 2, text: "    Node *slow = head, *fast = head;" },
    { id: 3, text: "    while (fast && fast->next) {" },
    { id: 4, text: "        slow = slow->next;" },
    { id: 5, text: "        fast = fast->next->next;" },
    { id: 6, text: "        if (slow == fast) return 1;" },
    { id: 7, text: "    }" },
    { id: 8, text: "    return 0;" },
    { id: 9, text: "}" },
  ],
  merge: [
    { id: 1, text: "Node *mergeLists(Node *a, Node *b) {" },
    { id: 2, text: "    Node dummy = {0,NULL}, *tail = &dummy;" },
    { id: 3, text: "    while (a && b) {" },
    { id: 4, text: "        if (a->id <= b->id) { tail->next=a; a=a->next; }" },
    { id: 5, text: "        else { tail->next=b; b=b->next; }" },
    { id: 6, text: "        tail = tail->next;" },
    { id: 7, text: "    }" },
    { id: 8, text: "    tail->next = a ? a : b;" },
    { id: 9, text: "    return dummy.next;" },
    { id: 10, text: "}" },
  ],
  "remove-nth": [
    { id: 1, text: "Node *removeNthFromEnd(Node *head, int n) {" },
    { id: 2, text: "    Node dummy = {0, head}, *slow = &dummy, *fast = &dummy;" },
    { id: 3, text: "    for (int i=0; i<=n; i++) fast = fast->next;" },
    { id: 4, text: "    while (fast) { slow=slow->next; fast=fast->next; }" },
    { id: 5, text: "    slow->next = slow->next->next;" },
    { id: 6, text: "    return dummy.next;" },
    { id: 7, text: "}" },
  ],
  "insert-head": [
    { id: 1, text: "void prependNode(Node **head, Node *local) {" },
    { id: 2, text: "    local->next = *head;" },
    { id: 3, text: "    *head = local;" },
    { id: 4, text: "}" },
  ],
  traverse: [
    { id: 1, text: "void printList(Node *head) {" },
    { id: 2, text: "    for (Node *cur = head; cur; cur = cur->next)" },
    { id: 3, text: "        printf(\"%d -> \", cur->id);" },
    { id: 4, text: "    printf(\"NULL\\n\");" },
    { id: 5, text: "}" },
  ],
  delete: [
    { id: 1, text: "void deleteNode(Node **head, int key) {" },
    { id: 2, text: "    if (*head == NULL) return;" },
    { id: 3, text: "    if ((*head)->id == key) {" },
    { id: 4, text: "        Node *dead = *head;" },
    { id: 5, text: "        *head = (*head)->next;" },
    { id: 6, text: "        free(dead); return;" },
    { id: 7, text: "    }" },
    { id: 8, text: "    Node *prev = *head, *cur = (*head)->next;" },
    { id: 9, text: "    while (cur && cur->id != key) { prev = cur; cur = cur->next; }" },
    { id: 10, text: "    if (cur == NULL) return;" },
    { id: 11, text: "    prev->next = cur->next; free(cur);" },
    { id: 12, text: "}" },
  ],
  "delete-target": [
    { id: 1, text: "void deleteNode(Node **head, Node *target) {" },
    { id: 2, text: "    Node **cur = head;" },
    { id: 3, text: "    while (*cur) {" },
    { id: 4, text: "        if (*cur == target) {" },
    { id: 5, text: "            *cur = target->next;" },
    { id: 6, text: "            free(target); return;" },
    { id: 7, text: "        }" },
    { id: 8, text: "        cur = &((*cur)->next);" },
    { id: 9, text: "    }" },
    { id: 10, text: "}" },
  ],
  create: [
    { id: 1, text: "Node *createNode(int id) {" },
    { id: 2, text: "    Node *n = (Node *)malloc(sizeof(*n));" },
    { id: 3, text: "    if (n == NULL) return NULL;" },
    { id: 4, text: "    n->id = id; n->next = NULL;" },
    { id: 5, text: "    return n;" },
    { id: 6, text: "}" },
  ],
  "insert-tail": [
    { id: 1, text: "int insertAtEnd(Node **head, int id) {" },
    { id: 2, text: "    Node *n = createNode(id);" },
    { id: 3, text: "    if (*head == NULL) { *head = n; return 0; }" },
    { id: 4, text: "    Node *cur = *head;" },
    { id: 5, text: "    while (cur->next) cur = cur->next;" },
    { id: 6, text: "    cur->next = n; return 0;" },
    { id: 7, text: "}" },
  ],
  print: [
    { id: 1, text: "void printList(const Node *head) {" },
    { id: 2, text: "    for (const Node *cur = head; cur; cur = cur->next)" },
    { id: 3, text: "        printf(\"%d -> \", cur->id);" },
    { id: 4, text: "    printf(\"NULL\\n\");" },
    { id: 5, text: "}" },
  ],
  free: [
    { id: 1, text: "void freeList(Node *head) {" },
    { id: 2, text: "    while (head) {" },
    { id: 3, text: "        Node *t = head->next;" },
    { id: 4, text: "        free(head); head = t;" },
    { id: 5, text: "    }" },
    { id: 6, text: "}" },
  ],
};

function simulateReverse(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.reverse;
  const steps = [];
  let prev = null;
  let cur = 0;
  let line = 2;

  const push = (patch) => {
    const listHead = prev !== null ? prev : cur !== null ? cur : 0;
    steps.push(
      snap({
        func: "reverseList",
        snippet,
        heap,
        vars: {
          head: 0,
          listHead,
          prev,
          cur,
          next: patch.next !== undefined ? patch.next : null,
        },
        hot: patch.hot || [],
        prevLine: patch.prevLine ?? line,
        currLine: patch.currLine ?? line + 1,
        phaseLabel: patch.phaseLabel || "",
        note: patch.note || "",
      })
    );
  };

  push({ head: 0, prev: null, cur: 0, next: heap[0]?.next ?? null, currLine: 3, note: "Enter loop: prev=NULL, cur=head", phaseLabel: "Init" });

  while (cur !== null) {
    const next = heap[cur].next;
    push({
      prevLine: 3,
      currLine: 4,
      next,
      note: "Save cur->next before we overwrite the link",
      phaseLabel: "Save next",
      hot: [cur],
    });
    heap[cur].next = prev;
    push({
      prevLine: 4,
      currLine: 5,
      next,
      note: "Flip link: cur->next = prev",
      phaseLabel: "Reverse link",
      hot: [cur, prev].filter((x) => x !== null),
    });
    prev = cur;
    cur = next;
    push({
      prevLine: 6,
      currLine: 7,
      next: null,
      note: cur === null ? "cur reached NULL — loop ends" : "Advance prev and cur",
      phaseLabel: "Advance",
      hot: [prev, cur].filter((x) => x !== null),
    });
    line = 7;
  }

  push({
    prev,
    cur: null,
    prevLine: 8,
    currLine: 9,
    note: "Return prev — new head of reversed list",
    phaseLabel: "Done",
    hot: [prev].filter((x) => x !== null),
  });
  return steps;
}

function simulateMiddle(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.middle;
  const steps = [];
  let slow = 0;
  let fast = 0;

  const push = (patch) =>
    steps.push(
      snap({
        func: "findMiddle",
        snippet,
        heap,
        vars: { head: 0, slow, fast },
        hot: [slow, fast].filter((x) => x !== null),
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({ prevLine: 1, currLine: 2, note: "slow = head, fast = head", phaseLabel: "Init" });

  while (fast !== null && heap[fast]?.next !== null) {
    push({ prevLine: 3, currLine: 4, note: "slow = slow->next (one step)", phaseLabel: "Move slow" });
    slow = heap[slow].next;
    push({ prevLine: 4, currLine: 5, note: "fast = fast->next->next (two steps)", phaseLabel: "Move fast" });
    const hop = heap[fast].next;
    fast = hop !== null ? heap[hop].next : null;
  }

  push({
    prevLine: 6,
    currLine: 7,
    note: `Return slow — middle node id=${heap[slow]?.val}`,
    phaseLabel: "Done",
    hot: [slow],
  });
  return steps;
}

function simulateCycle(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.cycle;
  const steps = [];
  let slow = 0;
  let fast = 0;

  const push = (patch) =>
    steps.push(
      snap({
        func: "hasCycle",
        snippet,
        heap,
        vars: { head: 0, slow, fast },
        hot: [slow, fast].filter((x) => x !== null),
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({ prevLine: 1, currLine: 2, note: "Both pointers start at head", phaseLabel: "Init" });

  while (fast !== null && heap[fast]?.next !== null) {
    push({ prevLine: 3, currLine: 4, note: "slow moves one step", phaseLabel: "Slow +1" });
    slow = heap[slow].next;
    push({ prevLine: 4, currLine: 5, note: "fast moves two steps", phaseLabel: "Fast +2" });
    const hop = heap[fast].next;
    fast = hop !== null ? heap[hop].next : null;
    push({ prevLine: 5, currLine: 6, note: "slow != fast — no cycle yet", phaseLabel: "Compare" });
    if (fast === null) break;
  }

  push({ prevLine: 7, currLine: 8, note: "fast reached NULL — no cycle (return 0)", phaseLabel: "Done" });
  return steps;
}

function simulateTraverse(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.traverse;
  return values.map((_, i) =>
    snap({
      func: "printList",
      snippet,
      heap,
      vars: { head: 0, cur: i },
      hot: [i],
      prevLine: i === 0 ? 1 : 2,
      currLine: i === 0 ? 2 : 3,
      note: i === 0 ? "cur = head — start walk" : `Visit node@${i} (id=${heap[i].val})`,
      phaseLabel: `Node ${i}`,
    })
  );
}

function simulateInsertHead() {
  const heap = [];
  const snippet = SNIPPETS["insert-head"];
  const steps = [];
  let head = null;

  const addNode = (val, stepNote, phaseLabel, currLine) => {
    const id = heap.length;
    heap.push({ id, val: String(val), next: head });
    head = id;
    steps.push(
      snap({
        func: "prependNode",
        snippet,
        heap,
        vars: { head, newNode: id },
        hot: [id],
        prevLine: currLine - 1,
        currLine,
        note: stepNote,
        phaseLabel,
      })
    );
  };

  addNode(10, "Create node(10), link to old head, update head", "Insert 10", 4);
  addNode(5, "Create node(5), prepend before 10", "Insert 5", 4);
  return steps;
}

function simulateMerge() {
  const heap = [
    { id: 0, val: "1", next: 1 },
    { id: 1, val: "2", next: 2 },
    { id: 2, val: "4", next: null },
    { id: 3, val: "1", next: 4 },
    { id: 4, val: "3", next: 5 },
    { id: 5, val: "4", next: null },
  ];
  const snippet = SNIPPETS.merge;
  const steps = [];
  let pa = 0;
  let pb = 3;
  const merged = [];

  const push = (patch) =>
    steps.push(
      snap({
        func: "mergeLists",
        snippet,
        heap: cloneHeap(heap),
        vars: { a: pa, b: pb, tail: merged.length ? merged[merged.length - 1] : null },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
        mergeOut: merged.length ? merged.map((id) => heap[id].val).join(" → ") + " → NULL" : "(building…)",
        listLabels: ["List A", "List B"],
      })
    );

  push({ prevLine: 1, currLine: 2, note: "List A: 1→2→4, List B: 1→3→4 — attach smaller head each time", phaseLabel: "Init", hot: [0, 3] });

  while (pa !== null && pb !== null) {
    const pickA = parseInt(heap[pa].val, 10) <= parseInt(heap[pb].val, 10);
    const pick = pickA ? pa : pb;
    merged.push(pick);
    push({
      prevLine: 3,
      currLine: pickA ? 4 : 5,
      note: `Attach node@${pick} (id=${heap[pick].val}) to merged list`,
      phaseLabel: "Attach",
      hot: [pick],
    });
    if (pickA) pa = heap[pa].next;
    else pb = heap[pb].next;
  }

  while (pa !== null) {
    merged.push(pa);
    pa = heap[pa].next;
  }
  while (pb !== null) {
    merged.push(pb);
    pb = heap[pb].next;
  }

  push({ prevLine: 7, currLine: 8, note: "Drain remaining nodes from whichever list is left", phaseLabel: "Tail", hot: [] });
  push({
    prevLine: 8,
    currLine: 9,
    note: `Done: ${merged.map((id) => heap[id].val).join(" → ")} → NULL`,
    phaseLabel: "Done",
    hot: merged.slice(0, 1),
    mergeOut: merged.map((id) => heap[id].val).join(" → ") + " → NULL",
  });
  return steps;
}

function simulateRemoveNth(values, n) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS["remove-nth"];
  const steps = [];
  let slow = null;
  let fast = null;

  const advance = (ptr) => {
    if (ptr === null) return 0;
    return heap[ptr]?.next ?? null;
  };

  const push = (patch) =>
    steps.push(
      snap({
        func: "removeNthFromEnd",
        snippet,
        heap: cloneHeap(heap),
        dummyNode: true,
        vars: { dummy: -1, head: 0, slow: patch.slow ?? slow, fast: patch.fast ?? fast },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
        removed: patch.removed ?? null,
      })
    );

  slow = null;
  fast = null;
  push({ prevLine: 1, currLine: 2, note: "Dummy node sits before head — slow starts at dummy", phaseLabel: "Dummy", slow, fast, hot: [0] });

  fast = null;
  for (let i = 0; i <= n; i += 1) {
    fast = advance(fast);
    push({
      prevLine: 2,
      currLine: 3,
      note: `Advance fast pointer (${i + 1}/${n + 1} steps ahead of slow)`,
      phaseLabel: "Gap fast",
      slow,
      fast,
      hot: [fast].filter((x) => x !== null),
    });
  }

  while (fast !== null) {
    slow = slow === null ? 0 : heap[slow].next;
    fast = heap[fast].next;
    push({
      prevLine: 3,
      currLine: 4,
      note: "Move slow and fast together until fast reaches NULL",
      phaseLabel: "Scan",
      slow,
      fast,
      hot: [slow, fast].filter((x) => x !== null),
    });
  }

  const victim = slow !== null ? heap[slow].next : heap[0]?.next ?? null;
  if (victim !== null) heap[slow].next = heap[victim].next;
  push({
    prevLine: 4,
    currLine: 5,
    note: victim !== null ? `Unlink node@${victim} (id=${heap[victim]?.val})` : "Unlink target node",
    phaseLabel: "Remove",
    slow,
    fast,
    hot: [slow, victim].filter((x) => x !== null),
    removed: victim,
  });
  push({ prevLine: 5, currLine: 6, note: "Return head (via dummy.next)", phaseLabel: "Done", slow, fast: null, hot: [0] });
  return steps;
}

function simulateDelete(values, key) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.delete;
  const steps = [];
  let head = 0;
  let prev = null;
  let cur = head;
  let removed = null;

  const push = (patch) =>
    steps.push(
      snap({
        func: "deleteNode",
        snippet,
        heap: cloneHeap(heap),
        vars: {
          head,
          key,
          prev: patch.prev !== undefined ? patch.prev : prev,
          cur: patch.cur !== undefined ? patch.cur : cur,
          dead: patch.dead !== undefined ? patch.dead : null,
        },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
        removed: patch.removed !== undefined ? patch.removed : removed,
      })
    );

  push({
    prevLine: 1,
    currLine: 2,
    note: `List ${values.join(" → ")} → NULL — delete key ${key}`,
    phaseLabel: "Enter",
    hot: [head],
  });

  if (heap[head]?.val === String(key)) {
    removed = head;
    const next = heap[head].next;
    push({
      prevLine: 2,
      currLine: 3,
      note: `Head node id=${key} matches — remove from front`,
      phaseLabel: "Head match",
      hot: [head],
    });
    head = next;
    push({
      prevLine: 4,
      currLine: 5,
      note: "*head = head->next — advance head past deleted node",
      phaseLabel: "Advance head",
      cur: head,
      hot: [head].filter((x) => x !== null),
      removed,
    });
    return steps;
  }

  prev = head;
  cur = heap[head].next;
  push({
    prevLine: 7,
    currLine: 8,
    note: "Head does not match — walk with prev and cur",
    phaseLabel: "Scan",
    prev,
    cur,
    hot: [prev, cur].filter((x) => x !== null),
  });

  while (cur !== null && heap[cur].val !== String(key)) {
    prev = cur;
    cur = heap[cur].next;
    push({
      prevLine: 8,
      currLine: 9,
      note: `cur->id=${heap[prev]?.val} ≠ ${key} — advance`,
      phaseLabel: "Advance",
      prev,
      cur,
      hot: [prev, cur].filter((x) => x !== null),
    });
  }

  if (cur === null) {
    push({
      prevLine: 9,
      currLine: 10,
      note: `Key ${key} not found`,
      phaseLabel: "Not found",
      prev,
      cur: null,
      hot: [prev],
    });
    return steps;
  }

  removed = cur;
  const after = heap[cur].next;
  heap[prev].next = after;
  push({
    prevLine: 10,
    currLine: 11,
    note: `Unlink node@${cur} (id=${key}): prev->next = cur->next`,
    phaseLabel: "Unlink",
    prev,
    cur,
    hot: [prev, cur, after].filter((x) => x !== null),
    removed,
  });
  push({
    prevLine: 11,
    currLine: 12,
    note: "free(cur) — node removed from heap",
    phaseLabel: "Done",
    prev,
    cur: null,
    hot: [prev, head],
    removed,
  });
  return steps;
}

function simulateCreate(id) {
  const heap = [];
  const snippet = SNIPPETS.create;
  const steps = [];
  const nodeId = 0;

  steps.push(
    snap({
      func: "createNode",
      snippet,
      heap: [{ id: nodeId, val: String(id), next: null }],
      vars: { id, n: nodeId },
      hot: [nodeId],
      prevLine: 1,
      currLine: 2,
      note: "malloc(sizeof(Node)) — allocate on heap",
      phaseLabel: "Allocate",
    })
  );
  steps.push(
    snap({
      func: "createNode",
      snippet,
      heap: [{ id: nodeId, val: String(id), next: null }],
      vars: { id, n: nodeId },
      hot: [nodeId],
      prevLine: 3,
      currLine: 4,
      note: `n->id = ${id}; n->next = NULL`,
      phaseLabel: "Init fields",
    })
  );
  steps.push(
    snap({
      func: "createNode",
      snippet,
      heap: [{ id: nodeId, val: String(id), next: null }],
      vars: { id, n: nodeId },
      hot: [nodeId],
      prevLine: 4,
      currLine: 5,
      note: "Return pointer to new node",
      phaseLabel: "Return",
    })
  );
  return steps;
}

function simulateInsertTail(values, newVal) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS["insert-tail"];
  const steps = [];
  let head = 0;
  const newId = heap.length;

  const push = (patch) =>
    steps.push(
      snap({
        func: "insertAtEnd",
        snippet,
        heap: cloneHeap(heap),
        vars: { head, cur: patch.cur ?? null, n: newId },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({ prevLine: 1, currLine: 2, note: `Create node(${newVal}) with createNode`, phaseLabel: "New node", hot: [] });
  heap.push({ id: newId, val: String(newVal), next: null });

  let cur = head;
  push({ prevLine: 3, currLine: 4, note: "Start at head", phaseLabel: "Find tail", cur, hot: [cur] });

  while (heap[cur].next !== null) {
    cur = heap[cur].next;
    push({
      prevLine: 4,
      currLine: 5,
      note: "Walk cur until cur->next == NULL",
      phaseLabel: "Walk",
      cur,
      hot: [cur],
    });
  }

  heap[cur].next = newId;
  push({
    prevLine: 5,
    currLine: 6,
    note: `cur->next = new node — append ${newVal}`,
    phaseLabel: "Link",
    cur,
    hot: [cur, newId],
  });
  return steps;
}

function simulatePrint(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.print;
  const steps = [];
  let cur = 0;

  const push = (patch) =>
    steps.push(
      snap({
        func: "printList",
        snippet,
        heap: cloneHeap(heap),
        vars: { head: 0, cur: patch.cur ?? cur },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({ prevLine: 1, currLine: 2, note: "Enter for-loop: cur = head", phaseLabel: "Init", cur: 0, hot: [0] });

  while (cur !== null) {
    push({
      prevLine: 2,
      currLine: 3,
      note: `printf("%d -> ", ${heap[cur].val})`,
      phaseLabel: "Print",
      cur,
      hot: [cur],
    });
    cur = heap[cur].next;
    if (cur !== null) {
      push({
        prevLine: 2,
        currLine: 2,
        note: "cur = cur->next",
        phaseLabel: "Advance",
        cur,
        hot: [cur],
      });
    }
  }

  push({ prevLine: 3, currLine: 4, note: 'printf("NULL\\n")', phaseLabel: "Done", cur: null, hot: [] });
  return steps;
}

function simulateFree(values) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS.free;
  const steps = [];
  let head = 0;
  let freed = [];

  const push = (patch) =>
    steps.push(
      snap({
        func: "freeList",
        snippet,
        heap: cloneHeap(heap),
        vars: { head: patch.head ?? head, t: patch.t ?? null },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
        removed: patch.removed,
      })
    );

  push({ prevLine: 1, currLine: 2, note: "while (head) — free every node", phaseLabel: "Loop", hot: [head] });

  while (head !== null) {
    const t = heap[head].next;
    const victim = head;
    freed.push(victim);
    push({
      prevLine: 2,
      currLine: 3,
      note: `t = head->next — save link before free`,
      phaseLabel: "Save next",
      t,
      hot: [head, t].filter((x) => x !== null),
    });
    head = t;
    push({
      prevLine: 3,
      currLine: 4,
      note: `free node@${victim} (id=${heap[victim].val}); head = t`,
      phaseLabel: "Free",
      head,
      t,
      hot: [head].filter((x) => x !== null),
      removed: victim,
    });
  }

  push({ prevLine: 4, currLine: 5, note: "head is NULL — list fully freed", phaseLabel: "Done", head: null, hot: [] });
  return steps;
}

function simulateDeleteByTarget(values, targetVal) {
  const heap = buildLinear(values);
  const snippet = SNIPPETS["delete-target"];
  const steps = [];
  let head = 0;
  let target = heap.findIndex((n) => n.val === String(targetVal));
  if (target < 0) target = 1;

  const push = (patch) =>
    steps.push(
      snap({
        func: "deleteNode",
        snippet,
        heap: cloneHeap(heap),
        vars: {
          head,
          target,
          cur: patch.cur !== undefined ? patch.cur : head,
        },
        hot: patch.hot || [],
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
        removed: patch.removed !== undefined ? patch.removed : null,
      })
    );

  push({
    prevLine: 1,
    currLine: 2,
    note: `List ${values.join(" → ")} → NULL — delete node@${target} (id=${targetVal})`,
    phaseLabel: "Enter",
    hot: [head, target],
  });
  push({
    prevLine: 3,
    currLine: 4,
    note: `*cur == target — unlink node@${target}`,
    phaseLabel: "Match",
    cur: target,
    hot: [target],
  });
  if (target === head) {
    head = heap[target].next;
  } else {
    for (let i = 0; i < heap.length; i++) {
      if (heap[i].next === target) heap[i].next = heap[target].next;
    }
  }
  push({
    prevLine: 5,
    currLine: 6,
    note: `free(node@${target}); list now skips id=${targetVal}`,
    phaseLabel: "Free",
    cur: head,
    hot: [head].filter((x) => x !== null),
    removed: target,
  });
  push({ prevLine: 6, currLine: 7, note: "Done — target removed by address", phaseLabel: "Done", cur: head, hot: [head].filter((x) => x !== null) });
  return steps;
}

export function createListSession(meta) {
  const values = parseValues(meta);
  const op = inferOp(meta);
  let steps;
  let snippet = SNIPPETS[op] || SNIPPETS.traverse;

  switch (op) {
    case "reverse":
      steps = simulateReverse(values);
      break;
    case "middle":
      steps = simulateMiddle(values);
      break;
    case "cycle":
      steps = simulateCycle(values);
      break;
    case "merge":
      steps = simulateMerge();
      snippet = SNIPPETS.merge;
      break;
    case "remove-nth":
      steps = simulateRemoveNth(values.length >= 5 ? values : ["1", "2", "3", "4", "5"], 2);
      break;
    case "insert-head":
      steps = simulateInsertHead();
      break;
    case "insert-tail":
      steps = simulateInsertTail(values.length >= 3 ? values : ["1", "2", "3"], 4);
      snippet = SNIPPETS["insert-tail"];
      break;
    case "delete":
      steps = simulateDelete(["30", "20", "10"], Number(meta.listHighlight) || 20);
      snippet = SNIPPETS.delete;
      break;
    case "delete-target":
      steps = simulateDeleteByTarget(["10", "20", "30"], 20);
      snippet = SNIPPETS["delete-target"];
      break;
    case "create":
      steps = simulateCreate(10);
      snippet = SNIPPETS.create;
      break;
    case "print":
      steps = simulatePrint(values);
      snippet = SNIPPETS.print;
      break;
    case "free":
      steps = simulatePrint(values);
      steps = steps.concat(simulateFree(values));
      snippet = SNIPPETS.free;
      break;
    default:
      steps = simulateTraverse(values);
      snippet = SNIPPETS.traverse;
      break;
  }

  return { kind: "linked-list", steps, snippet, op, values };
}

function renderCodeRail(snippet, step) {
  const prev = step.prevLine;
  const curr = step.currLine;
  return `<div class="viz-code-rail studio-code-rail">
    <div class="viz-code-title">${escapeHtml(step.func || "list")}()</div>
    <pre class="viz-code">${snippet
      .map((ln) => {
        let cls = "viz-code-line";
        if (ln.id === prev) cls += " viz-line-prev";
        if (ln.id === curr) cls += " viz-line-curr";
        const arrows =
          (ln.id === prev ? '<span class="viz-arr-prev">➜</span>' : "") +
          (ln.id === curr ? '<span class="viz-arr-next">➜</span>' : "");
        return `<div class="${cls}"><span class="viz-arr-slot">${arrows}</span><span class="viz-ln">${ln.id}</span>${escapeHtml(ln.text)}</div>`;
      })
      .join("")}</pre>
    <div class="viz-code-legend">
      <span class="viz-legend-prev">➜ line just executed</span>
      <span class="viz-legend-next">➜ next line to execute</span>
    </div>
  </div>`;
}

function renderHeap(step, session) {
  const heap = step.heap || [];
  const hot = new Set(step.hot || []);
  const vars = step.vars || {};
  const ptrOn = {};
  Object.entries(vars).forEach(([name, target]) => {
    if (target !== null && target !== undefined && target !== -1) {
      if (!ptrOn[target]) ptrOn[target] = [];
      ptrOn[target].push(name);
    }
  });

  if (step.removed !== null && step.removed !== undefined) hot.add(step.removed);

  /* merge question: show both chains */
  if (session.op === "merge") {
    const row = (label, start) => {
      const ids = [];
      let p = start;
      const s = new Set();
      while (p !== null && !s.has(p)) {
        s.add(p);
        ids.push(p);
        p = heap.find((n) => n.id === p)?.next ?? null;
      }
      return `<div class="viz-ll-row-label">${escapeHtml(label)}</div><div class="viz-ll-canvas">${ids
        .map((id, i) => {
          const node = heap.find((n) => n.id === id);
          const tail = !node || node.next === null;
          return `${renderNode(id, heap, hot, ptrOn, step)}${!tail ? '<div class="viz-ll-edge">→</div>' : ""}`;
        })
        .join("")}<div class="viz-ll-null">NULL</div></div>`;
    };
    return row("List A", 0) + row("List B", 3);
  }

  /* show every heap node — critical mid-algorithm when links are temporarily split */
  const allNodes = heap
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((n) => renderNode(n.id, heap, hot, ptrOn, step))
    .join("");

  if (step.dummyNode) {
    return `<div class="viz-ll-row-label">with dummy head</div><div class="viz-ll-canvas"><div class="viz-ll-node viz-ll-dummy"><div class="viz-ll-node-head">dummy</div><div class="viz-ll-row"><span>next</span><span class="viz-ll-val">→ node@0</span></div></div><div class="viz-ll-edge">→</div>${allNodes}</div>`;
  }

  return `<div class="viz-ll-canvas">${allNodes}</div>`;
}

function renderNode(id, heap, hot, ptrOn, step) {
  const node = heap.find((n) => n.id === id);
  if (!node) return "";
  const badges = (ptrOn[id] || [])
    .map((name, i) => `<span class="viz-ll-ptr-badge viz-ptr-${["left", "right", "mid", "low", "high"][i % 5]}">${escapeHtml(name)}</span>`)
    .join("");
  const removed = step.removed === id;
  return `<div class="viz-ll-node ${hot.has(id) ? "viz-ll-hot" : ""} ${removed ? "viz-ll-removed" : ""}">
    <div class="viz-ll-ptr-slot">${badges}</div>
    <div class="viz-ll-node-head">node@${id}</div>
    <div class="viz-ll-row"><span>id</span><span class="viz-ll-val">${escapeHtml(node.val)}</span></div>
    <div class="viz-ll-row"><span>next</span><span class="viz-ll-val">${node.next === null ? "NULL" : `→ ${node.next}`}</span></div>
  </div>`;
}

function renderStack(step) {
  const vars = step.vars || {};
  return Object.entries(vars)
    .filter(([name]) => name !== "head" || !step.dummyNode)
    .map(([name, target]) => {
      let text = "NULL";
      if (target === -1) text = "→ dummy";
      else if (target !== null && target !== undefined) text = `→ node@${target}`;
      return `<div class="viz-var-row">
        <span class="viz-var-name">${escapeHtml(name)}</span>
        <span class="viz-var-type">Node*</span>
        <span class="viz-var-val viz-var-pointer">${escapeHtml(text)}</span>
      </div>`;
    })
    .join("");
}

export function renderListStudioRich(body, step, session) {
  const snippet = step.snippet || session.snippet || SNIPPETS.traverse;
  body.innerHTML = `
    <div class="viz-split studio-split">
      ${renderCodeRail(snippet, step)}
      <div class="viz-memory">
        <div class="viz-state-split">
          <div class="viz-stack-pane">
            <div class="viz-stack-label">STACK</div>
            <div class="viz-frame viz-frame-active">
              <div class="viz-frame-head">${escapeHtml(step.func || "list")}()</div>
              ${renderStack(step)}
            </div>
          </div>
          <div class="viz-mem-pane">
            <div class="viz-stack-label">HEAP · linked nodes</div>
            ${renderHeap(step, session)}
            ${step.mergeOut ? `<p class="viz-ll-merge-out">Merged: ${escapeHtml(step.mergeOut)}</p>` : ""}
          </div>
        </div>
      </div>
    </div>`;
}
