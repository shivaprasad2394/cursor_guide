/**
 * avl-viz.js — rich AVL tree Execution Studio (height, BF, rotations).
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cloneHeap(heap) {
  return heap.map((n) => ({ ...n }));
}

function snap(base) {
  return { ...base, heap: cloneHeap(base.heap) };
}

function inferOp(meta) {
  const id = String(meta.id || "");
  const t = `${id} ${meta.title || ""}`.toLowerCase();
  if (/q90|height-and-balance/.test(id)) return "height-bf";
  if (/q91|rotate-left/.test(id)) return "rotate";
  if (/q93|rr-rebalance/.test(id)) return "insert-rr";
  if (/q92|ll-rebalance/.test(id)) return "insert-ll";
  if (/height-and-balance|node height/.test(t)) return "height-bf";
  if (/rotate/.test(t)) return "rotate";
  if (/rr/.test(t)) return "insert-rr";
  if (/ll/.test(t)) return "insert-ll";
  return "insert-ll";
}

function parseKeys(meta, fallback) {
  return String(meta.treeKeys || fallback)
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

function nodeHeight(heap, idx) {
  return idx === null || idx === undefined ? 0 : heap[idx].height;
}

function balanceFactor(heap, idx) {
  if (idx === null || idx === undefined) return 0;
  const n = heap[idx];
  return nodeHeight(heap, n.left) - nodeHeight(heap, n.right);
}

function bfLabels(heap, root) {
  const labels = {};
  const walk = (idx) => {
    if (idx === null || idx === undefined) return;
    labels[idx] = balanceFactor(heap, idx);
    walk(heap[idx].left);
    walk(heap[idx].right);
  };
  walk(root);
  return labels;
}

function treeLevels(root, heap) {
  if (root === null || root === undefined) return [];
  const levels = [];
  let q = [root];
  while (q.length) {
    levels.push(q.map((idx) => (idx === null || idx === undefined ? null : heap[idx].id)));
    q = q.flatMap((idx) =>
      idx === null || idx === undefined ? [null, null] : [heap[idx].left, heap[idx].right]
    );
    if (q.every((x) => x === null || x === undefined)) break;
  }
  return levels;
}

function idxById(heap, id) {
  return heap.findIndex((n) => n.id === id);
}

const SNIPPETS = {
  "height-bf": [
    { id: 1, text: "int nodeHeight(AvlNode *n) {" },
    { id: 2, text: "    return n ? n->height : 0;" },
    { id: 3, text: "}" },
    { id: 4, text: "int balanceFactor(AvlNode *n) {" },
    { id: 5, text: "    if (!n) return 0;" },
    { id: 6, text: "    return nodeHeight(n->left) - nodeHeight(n->right);" },
    { id: 7, text: "}" },
  ],
  rotate: [
    { id: 1, text: "AvlNode *rotateRight(AvlNode *y) {" },
    { id: 2, text: "    AvlNode *x = y->left, *t2 = x->right;" },
    { id: 3, text: "    x->right = y;  y->left = t2;" },
    { id: 4, text: "    updateHeight(y); updateHeight(x);" },
    { id: 5, text: "    return x;" },
    { id: 6, text: "}" },
  ],
  "insert-ll": [
    { id: 1, text: "AvlNode *avlInsert(AvlNode *node, int id) {" },
    { id: 2, text: "    if (!node) return createAvlNode(id);" },
    { id: 3, text: "    /* BST insert left or right */" },
    { id: 4, text: "    updateHeight(node);" },
    { id: 5, text: "    int bf = balanceFactor(node);" },
    { id: 6, text: "    if (bf > 1 && id < node->left->id) return rotateRight(node); // LL" },
    { id: 7, text: "    return node;" },
    { id: 8, text: "}" },
  ],
  "insert-rr": [
    { id: 1, text: "AvlNode *avlInsert(AvlNode *node, int id) {" },
    { id: 2, text: "    if (!node) return createAvlNode(id);" },
    { id: 3, text: "    /* BST insert left or right */" },
    { id: 4, text: "    updateHeight(node);" },
    { id: 5, text: "    int bf = balanceFactor(node);" },
    { id: 6, text: "    if (bf < -1 && id > node->right->id) return rotateLeft(node); // RR" },
    { id: 7, text: "    return node;" },
    { id: 8, text: "}" },
  ],
};

function simulateHeightBf() {
  const heap = [
    { id: 10, height: 1, left: null, right: null },
    { id: 20, height: 2, left: 0, right: null },
    { id: 30, height: 3, left: 1, right: null },
  ];
  const root = 2;
  const snippet = SNIPPETS["height-bf"];
  const steps = [];

  const push = (patch) =>
    steps.push(
      snap({
        func: "balanceFactor",
        snippet,
        heap,
        root,
        hot: patch.hot || [],
        pivot: patch.pivot ?? null,
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({
    prevLine: 1,
    currLine: 2,
    note: "Left-skewed tree: 30 → 20 → 10. Each node stores a height field.",
    phaseLabel: "Tree setup",
    hot: [0, 1, 2],
  });
  push({
    prevLine: 2,
    currLine: 3,
    note: "nodeHeight(NULL)=0; nodeHeight(&n10)=1",
    phaseLabel: "Height at leaf",
    hot: [0],
  });
  push({
    prevLine: 4,
    currLine: 5,
    note: "balanceFactor(&n10) = h(left)−h(right) = 0−0 = 0",
    phaseLabel: "BF at 10",
    hot: [0],
  });
  push({
    prevLine: 4,
    currLine: 6,
    note: "balanceFactor(&n20) = 1−0 = +1 (left taller — still OK, |BF|≤1)",
    phaseLabel: "BF at 20",
    hot: [1],
  });
  push({
    prevLine: 4,
    currLine: 6,
    note: "balanceFactor(&n30) = 2−0 = +2 (left subtree taller — would need rebalance on insert)",
    phaseLabel: "BF at root",
    hot: [2],
  });
  return steps;
}

function simulateRotate() {
  const heap = [
    { id: 10, height: 1, left: null, right: null },
    { id: 20, height: 2, left: 0, right: null },
    { id: 30, height: 3, left: 1, right: null },
  ];
  let root = 2;
  const snippet = SNIPPETS.rotate;
  const steps = [];

  const push = (patch) =>
    steps.push(
      snap({
        func: "rotateRight",
        snippet,
        heap: cloneHeap(heap),
        root: patch.root ?? root,
        hot: patch.hot || [],
        pivot: patch.pivot ?? null,
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  push({
    prevLine: 1,
    currLine: 2,
    note: "LL shape: BF(30)=+2 — left-left heavy. Fix with rotateRight at 30.",
    phaseLabel: "Before",
    hot: [2],
    pivot: 2,
  });
  push({
    prevLine: 2,
    currLine: 3,
    note: "x=20, t2=NULL. Rewire: x->right=30, 30->left=t2",
    phaseLabel: "Rewire",
    hot: [1, 2],
    pivot: 2,
  });

  /* after rotation */
  heap.length = 0;
  heap.push({ id: 10, height: 1, left: null, right: null });
  heap.push({ id: 20, height: 2, left: 0, right: 2 });
  heap.push({ id: 30, height: 1, left: null, right: null });
  root = 1;

  push({
    prevLine: 4,
    currLine: 5,
    note: "updateHeight on 30 and 20. New root=20, left=10, right=30 — balanced!",
    phaseLabel: "After rotate",
    hot: [0, 1, 2],
    root: 1,
  });
  return steps;
}

function simulateInsertLL() {
  const snippet = SNIPPETS["insert-ll"];
  const steps = [];
  let heap = [];
  let root = null;

  const push = (patch) =>
    steps.push(
      snap({
        func: "avlInsert",
        snippet,
        heap: cloneHeap(heap),
        root,
        hot: patch.hot || [],
        pivot: patch.pivot ?? null,
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  /* insert 30 */
  heap = [{ id: 30, height: 1, left: null, right: null }];
  root = 0;
  push({ prevLine: 1, currLine: 2, note: "Insert 30 into empty tree → new root", phaseLabel: "Insert 30", hot: [0] });

  /* insert 20 */
  heap.push({ id: 20, height: 1, left: null, right: null });
  heap[0].left = 1;
  heap[0].height = 2;
  root = 0;
  push({
    prevLine: 3,
    currLine: 4,
    note: "Insert 20 left of 30. updateHeight(30)=2, BF(30)=+1 — still balanced",
    phaseLabel: "Insert 20",
    hot: [0, 1],
  });

  /* insert 10 — unbalanced */
  heap.push({ id: 10, height: 1, left: null, right: null });
  heap[1].left = 2;
  heap[1].height = 2;
  heap[0].height = 3;
  push({
    prevLine: 4,
    currLine: 5,
    note: "Insert 10. BF(30)=+2, LL case (new key in left-left) → rotateRight(30)",
    phaseLabel: "Insert 10",
    hot: [0, 1, 2],
    pivot: 0,
  });

  /* after rebalance */
  heap = [
    { id: 10, height: 1, left: null, right: null },
    { id: 20, height: 2, left: 0, right: 2 },
    { id: 30, height: 1, left: null, right: null },
  ];
  root = 1;
  push({
    prevLine: 5,
    currLine: 6,
    note: "After rotateRight: root=20, height=2. All |BF|≤1 — AVL restored",
    phaseLabel: "Rebalanced",
    hot: [0, 1, 2],
  });
  return steps;
}

function simulateInsertRR() {
  const snippet = SNIPPETS["insert-rr"];
  const steps = [];
  let heap = [];
  let root = null;

  const push = (patch) =>
    steps.push(
      snap({
        func: "avlInsert",
        snippet,
        heap: cloneHeap(heap),
        root,
        hot: patch.hot || [],
        pivot: patch.pivot ?? null,
        prevLine: patch.prevLine,
        currLine: patch.currLine,
        note: patch.note,
        phaseLabel: patch.phaseLabel,
      })
    );

  heap = [{ id: 10, height: 1, left: null, right: null }];
  root = 0;
  push({ prevLine: 1, currLine: 2, note: "Insert 10 into empty tree", phaseLabel: "Insert 10", hot: [0] });

  heap.push({ id: 20, height: 1, left: null, right: null });
  heap[0].right = 1;
  heap[0].height = 2;
  push({
    prevLine: 3,
    currLine: 4,
    note: "Insert 20 right of 10. BF(10)=−1 — still balanced",
    phaseLabel: "Insert 20",
    hot: [0, 1],
  });

  heap.push({ id: 30, height: 1, left: null, right: null });
  heap[1].right = 2;
  heap[1].height = 2;
  heap[0].height = 3;
  push({
    prevLine: 4,
    currLine: 5,
    note: "Insert 30. BF(10)=−2, RR case (new key in right-right) → rotateLeft(10)",
    phaseLabel: "Insert 30",
    hot: [0, 1, 2],
    pivot: 0,
  });

  heap = [
    { id: 10, height: 1, left: null, right: null },
    { id: 20, height: 2, left: 0, right: 2 },
    { id: 30, height: 1, left: null, right: null },
  ];
  root = 1;
  push({
    prevLine: 5,
    currLine: 6,
    note: "After rotateLeft: root=20, height=2. AVL invariant restored",
    phaseLabel: "Rebalanced",
    hot: [0, 1, 2],
  });
  return steps;
}

export function createAvlSession(meta) {
  const op = inferOp(meta);
  let steps;
  switch (op) {
    case "height-bf":
      steps = simulateHeightBf();
      break;
    case "rotate":
      steps = simulateRotate();
      break;
    case "insert-rr":
      steps = simulateInsertRR();
      break;
    case "insert-ll":
    default:
      steps = simulateInsertLL();
      break;
  }
  return { kind: "avl-tree", steps, snippet: SNIPPETS[op] || SNIPPETS["insert-ll"], op };
}

function renderCodeRail(snippet, step) {
  const prev = step.prevLine;
  const curr = step.currLine;
  return `<div class="viz-code-rail studio-code-rail">
    <div class="viz-code-title">${escapeHtml(step.func || "avl")}()</div>
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

function renderAvlCanvas(step) {
  const heap = step.heap || [];
  const root = step.root;
  const hot = new Set(step.hot || []);
  const pivot = step.pivot;
  const bfs = bfLabels(heap, root);
  const levels = treeLevels(root, heap);

  if (!levels.length) {
    return `<div class="viz-tree-empty">Empty tree</div>`;
  }

  const idToIdx = {};
  heap.forEach((n, i) => {
    idToIdx[n.id] = i;
  });

  const rows = levels
    .map((level) => {
      const cells = level
        .map((id) => {
          if (id === null) return `<span class="viz-tree-node viz-tree-null">·</span>`;
          const idx = idToIdx[id];
          const n = heap[idx];
          const bf = bfs[idx] ?? 0;
          const bfCls = Math.abs(bf) > 1 ? "viz-avl-unbalanced" : Math.abs(bf) === 1 ? "viz-avl-tilt" : "";
          const hotCls = hot.has(idx) ? "viz-avl-hot" : "";
          const pivotCls = pivot === idx ? "viz-avl-pivot" : "";
          const bfStr = bf > 0 ? `+${bf}` : String(bf);
          return `<span class="viz-tree-node viz-avl-node ${bfCls} ${hotCls} ${pivotCls}">
            <span class="viz-avl-id">${id}</span>
            <span class="viz-avl-meta">h=${n.height} BF=${bfStr}</span>
          </span>`;
        })
        .join("");
      return `<div class="viz-tree-row">${cells}</div>`;
    })
    .join("");

  return `<div class="viz-tree-canvas viz-avl-canvas">${rows}
    <div class="viz-avl-legend">
      <span class="viz-avl-legend-item"><span class="viz-avl-swatch viz-avl-tilt"></span>|BF|=1 OK</span>
      <span class="viz-avl-legend-item"><span class="viz-avl-swatch viz-avl-unbalanced"></span>|BF|&gt;1 rebalance</span>
      <span class="viz-avl-legend-item"><span class="viz-avl-swatch viz-avl-pivot"></span>rotation pivot</span>
    </div>
  </div>`;
}

export function renderAvlStudioRich(body, step, session) {
  const snippet = step.snippet || session.snippet || SNIPPETS["insert-ll"];
  body.innerHTML = `
    <div class="viz-split studio-split">
      ${renderCodeRail(snippet, step)}
      <div class="viz-memory">
        <div class="viz-state-split">
          <div class="viz-stack-pane">
            <div class="viz-stack-label">STATE</div>
            <div class="viz-frame">
              <div class="viz-frame-head">${escapeHtml(step.func || "avl")}()</div>
              <div class="viz-var-row"><span class="viz-var-name">root</span><span class="viz-var-val">${step.root !== null && step.root !== undefined ? `→ node id ${heapRootId(step)}` : "NULL"}</span></div>
              <div class="viz-var-row"><span class="viz-var-name">phase</span><span class="viz-var-val">${escapeHtml(step.phaseLabel || "")}</span></div>
            </div>
          </div>
          <div class="viz-mem-pane">
            <div class="viz-stack-label">HEAP · AVL tree</div>
            ${renderAvlCanvas(step)}
          </div>
        </div>
      </div>
    </div>`;
}

function heapRootId(step) {
  const heap = step.heap || [];
  const root = step.root;
  return root !== null && root !== undefined ? heap[root]?.id : "?";
}
