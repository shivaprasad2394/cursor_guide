#!/usr/bin/env python3
"""Enrich question markdown: clearer descriptions + visualization metadata."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"
GUIDE = Path("/home/shivaprasad/chandu/husband/lord_claude/interview_all_guide_v2.md")

sys.path.insert(0, str(ROOT / "scripts"))
from import_guide import parse_sections, slugify  # noqa: E402


def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$", text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if val.startswith('"') and val.endswith('"'):
            val = val[1:-1]
        elif val.startswith("'") and val.endswith("'"):
            val = val[1:-1]
        meta[key] = val
    return meta, m.group(2)


def yaml_quote(s: str) -> str:
    return json.dumps(s)


def goal_from_title(title: str) -> str:
    return re.sub(r"^\d+[,\d\s]*\.\s*", "", title).strip()


def pattern_label(pattern: str) -> str:
    p = pattern.strip()
    if not p:
        return "See algorithm steps"
    if p.lower().startswith("avl"):
        return "AVL tree"
    return p[0].upper() + p[1:]


def build_at_a_glance(q: dict) -> str:
    goal = goal_from_title(q["title"])
    pattern = pattern_label(q.get("pattern", ""))
    complexity = q.get("complexity") or "See algorithm"
    expected = (q.get("expectedOutput") or "").strip().split("\n")[0]
    lines = [
        "## At a glance",
        "",
        f"- **Goal:** {goal}",
        f"- **Pattern:** {pattern}",
        f"- **Complexity:** {complexity}",
    ]
    if expected:
        lines.append(f"- **Expected output:** `{expected}`")
    lines.extend(["", "## Description", ""])
    desc = q.get("description", "").strip()
    if desc and desc.lower() != goal.lower():
        lines.append(desc)
    else:
        lines.append(f"Implement **{goal}** using the pattern above. Write the helper function(s); `main()` is provided.")
    if q.get("example"):
        lines.extend(["", "**Walkthrough hint:**", ""])
        hint = q["example"].strip().split("\n")[0]
        if len(hint) > 120:
            hint = hint[:117] + "…"
        lines.append(hint)
    return "\n".join(lines)


def extract_string_literal(text: str) -> str | None:
    m = re.search(r'str\s*=\s*"([^"]+)"', text)
    if m:
        return m.group(1)
    m = re.search(r'"([^"]{1,40})"', text)
    return m.group(1) if m else None


def gen_two_pointer_trace(s: str) -> list[dict]:
    steps = []
    left, right = 0, len(s) - 1
    while left <= right:
        note = f"{s[left]} ↔ {s[right]}"
        if left == right:
            note = "pointers meet — done"
        steps.append({"left": left, "right": right, "note": note})
        if left >= right:
            break
        left += 1
        right -= 1
    return steps


def extract_array_from_code(starter: str) -> list[int]:
    m = re.search(r"\{([^}]+)\}", starter)
    if not m:
        return []
    vals = []
    for part in m.group(1).split(","):
        part = part.strip()
        if part.isdigit() or (part.startswith("-") and part[1:].isdigit()):
            vals.append(int(part))
    return vals


def gen_binary_search_trace(arr: list[int], target: int) -> list[dict]:
    if not arr:
        return []
    steps = []
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        val = arr[mid]
        if val == target:
            note = f"arr[{mid}]={val} — found target {target}"
        elif val < target:
            note = f"arr[{mid}]={val} < {target} → search right half"
        else:
            note = f"arr[{mid}]={val} > {target} → search left half"
        steps.append({"low": left, "high": right, "mid": mid, "note": note})
        if val == target:
            break
        if val < target:
            left = mid + 1
        else:
            right = mid - 1
    return steps


def extract_bst_insert_keys(starter: str) -> list[int]:
    m = re.search(r"keys\[\]\s*=\s*\{([^}]+)\}", starter)
    if m:
        return [int(x.strip()) for x in m.group(1).split(",") if x.strip().isdigit()]
    return []


def infer_viz(q: dict, body: str) -> dict:
    pattern = (q.get("pattern") or "").lower()
    section = (q.get("section") or "").lower()
    title = (q.get("title") or "").lower()
    starter = ""
    sm = re.search(r"## Starter Code\s*\n+```c\n([\s\S]*?)```", body)
    if sm:
        starter = sm.group(1)

    viz: dict = {"visualization": "none"}
    example = q.get("example") or ""

    if "two-pointer" in pattern or "two pointer" in pattern:
        s = extract_string_literal(example) or extract_string_literal(starter) or "hello"
        viz = {
            "visualization": "two-pointer",
            "tape": s,
            "trace": gen_two_pointer_trace(s),
        }
    elif "binary search" in title or "binsearch" in (q.get("expectedOutput") or "").lower():
        arr = extract_array_from_code(starter) or [1, 3, 5, 7, 9, 11]
        tm = re.search(r"binSearch\((-?\d+)\)", q.get("expectedOutput") or starter)
        target = int(tm.group(1)) if tm else arr[len(arr) // 2]
        viz = {
            "visualization": "binary-search",
            "tape": ",".join(str(x) for x in arr),
            "target": target,
            "trace": gen_binary_search_trace(arr, target),
        }
    elif section in ("binary search tree", "avl tree") or "bst" in title or "avl" in title:
        keys = extract_bst_insert_keys(starter)
        if not keys and "30" in example:
            keys = [30, 20, 10]
        if keys:
            viz = {
                "visualization": "tree",
                "treeKeys": ",".join(str(k) for k in keys[:6]),
            }
        elif section == "avl tree":
            viz = {"visualization": "tree", "treeKeys": "30,20,10"}
    elif section == "linked list" or "linked list" in pattern:
        viz = {"visualization": "linked-list", "listNodes": "1,2,3,4,5", "listHighlight": 2}
    elif "ring buffer" in title or "circular" in title:
        viz = {"visualization": "array-cells", "tape": "0,1,2,3,4,5,6,7", "arrayLabel": "ring buffer slots"}

    if viz.get("visualization") == "none":
        s = extract_string_literal(example) or extract_string_literal(starter) or ""
        viz = {
            "visualization": "generic",
            "vizCategory": section or pattern or "general",
        }
        if s:
            viz["tape"] = s[:80]

    return viz


def rebuild_file(meta: dict, body: str, at_a_glance: str) -> str:
    body = re.sub(r"## At a glance[\s\S]*?(?=\n## (?:Description|Algorithm|Example|Starter))", "", body, count=1)
    body = re.sub(r"## Description\s*\n[\s\S]*?(?=\n## )", "", body, count=1)

    insert_at = body.find("## Algorithm")
    if insert_at == -1:
        insert_at = body.find("## Example Trace")
    if insert_at == -1:
        insert_at = body.find("## Starter Code")
    if insert_at == -1:
        insert_at = 0

    new_body = at_a_glance + "\n\n" + body[insert_at:].lstrip()

    fm = ["---"]
    order = [
        "id", "title", "pattern", "difficulty", "visualization", "vizCategory",
        "tape", "target", "treeKeys", "listNodes", "listHighlight", "arrayLabel",
        "stdin", "complexity", "expectedOutput", "trace",
    ]
    written = set()
    for key in order:
        if key in meta:
            written.add(key)
            val = meta[key]
            if key == "expectedOutput":
                fm.append(f"expectedOutput: {json.dumps(val)}")
            elif key == "trace":
                fm.append("trace:")
                for step in val:
                    fm.append(f"  - {json.dumps(step)}")
            elif key in ("target",) and isinstance(val, int):
                fm.append(f"{key}: {val}")
            else:
                fm.append(f'{key}: {yaml_quote(str(val))}')
    for key, val in meta.items():
        if key in written:
            continue
        fm.append(f'{key}: {yaml_quote(str(val))}')
    fm.append("---")
    return "\n".join(fm) + "\n" + new_body


def main():
    guide_qs = {}
    if GUIDE.exists():
        for q in parse_sections(GUIDE.read_text(encoding="utf-8")):
            guide_qs[q["id"]] = q

    avl_manual = {
        "q90-avl-height-and-balance-factor": {
            "description": "An AVL tree stores **height** in each node. **Balance factor (BF)** = height(left) − height(right). Balanced when BF is −1, 0, or +1.",
            "pattern": "avl tree",
            "section": "avl tree",
            "title": "AVL — node height and balance factor",
            "complexity": "O(1) per node, O(n) to refresh whole tree",
            "expectedOutput": "height(30)=3 bf(30)=0 bf(20)=1 bf(10)=0\n",
            "example": "Tree: 30 / 20 / 10",
        },
        "q91-avl-rotate-left-and-right": {
            "description": "Perform **single rotations** to rebalance an AVL subtree. **Right rotation** fixes left-heavy (LL); **left rotation** fixes right-heavy (RR).",
            "pattern": "avl tree",
            "section": "avl tree",
            "title": "AVL — single rotations (left and right)",
            "complexity": "O(1) per rotation",
            "expectedOutput": "",
            "example": "LL: rotate right at unbalanced node",
        },
        "q92-avl-insert-ll-rebalance": {
            "description": "Insert keys into an AVL tree; after each insert, update heights and rotate when |BF| > 1. Insert **30, 20, 10** triggers an **LL** case → **rotate right** at root.",
            "pattern": "avl tree",
            "section": "avl tree",
            "title": "AVL insert with LL rebalance",
            "complexity": "O(log n) per insert",
            "expectedOutput": "",
            "example": "After insert 10: root becomes 20",
        },
        "q93-avl-insert-rr-rebalance": {
            "description": "Same as LL insert, but keys **10, 20, 30** trigger **RR** → **rotate left** at root. After rebalance, root is **20**.",
            "pattern": "avl tree",
            "section": "avl tree",
            "title": "AVL insert with RR rebalance",
            "complexity": "O(log n) per insert",
            "expectedOutput": "",
            "example": "After insert 30: root becomes 20",
        },
    }
    guide_qs.update(avl_manual)

    updated = 0
    for path in sorted(QUESTIONS.glob("q*.md")):
        raw = path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(raw)
        qid = meta.get("id", path.stem)
        q = guide_qs.get(qid)
        if not q:
            continue

        q = dict(q)
        q["id"] = qid
        if q.get("expectedOutput"):
            meta["expectedOutput"] = q["expectedOutput"]
        elif meta.get("expectedOutput"):
            # Undo over-escaping from prior parse
            eo = meta["expectedOutput"]
            if '\\"' in eo:
                try:
                    meta["expectedOutput"] = json.loads(f'"{eo}"')
                except json.JSONDecodeError:
                    pass
        at_a_glance = build_at_a_glance(q)
        viz = infer_viz(q, body)
        meta.update(viz)
        if q.get("complexity"):
            meta["complexity"] = q["complexity"]
        if q.get("pattern"):
            meta["pattern"] = q["pattern"]
        if q.get("title"):
            meta["title"] = re.sub(r"^\d+[,\d\s]*\.\s*", "", q["title"])
        path.write_text(rebuild_file(meta, body, at_a_glance), encoding="utf-8")
        updated += 1

    print(f"Enriched {updated} question files")


if __name__ == "__main__":
    main()
