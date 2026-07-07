#!/usr/bin/env python3
"""Quick sanity checks before deploy."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"


def main() -> int:
    errors: list[str] = []
    index = json.loads((QUESTIONS / "index.json").read_text(encoding="utf-8"))
    entries = index["questions"]
    ids = [q["id"] for q in entries]
    files = {q["file"] for q in entries}

    if len(ids) != len(set(ids)):
        errors.append("duplicate question ids in index.json")

    for q in entries:
        path = QUESTIONS / q["file"]
        if not path.exists():
            errors.append(f"missing file: {q['file']}")
            continue
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---"):
            errors.append(f"{q['file']}: missing frontmatter")
        if text.count("---") < 2:
            errors.append(f"{q['file']}: broken frontmatter")
        for heading in ("Starter Code", "Solution"):
            if not re.search(rf"## {heading}\s*\n+```c\n", text):
                errors.append(f"{q['file']}: missing {heading} block")

    orphans = [p.name for p in QUESTIONS.glob("q*.md") if p.name not in files]
    if orphans:
        errors.append(f"orphan markdown files: {', '.join(orphans)}")

    pointers = [q for q in entries if q.get("section") == "pointers"]
    if len(pointers) != 8:
        errors.append(f"expected 8 pointer questions, got {len(pointers)}")

    print(f"OK: {len(entries)} questions indexed")
    print(f"OK: pointers section has {len(pointers)} questions")
    if errors:
        print("FAIL:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
