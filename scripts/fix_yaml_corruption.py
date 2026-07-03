#!/usr/bin/env python3
"""Fix corrupted YAML frontmatter in question files."""

import re
from pathlib import Path

QUESTIONS = Path(__file__).resolve().parents[1] / "questions"

ORPHAN_TRACE = re.compile(
    r'^- \{"left": "[^"]*",\\?"right":[^\n]*\}\s*$',
    re.MULTILINE,
)


def fix_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    cleaned = ORPHAN_TRACE.sub("", text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    if cleaned == text:
        return False
    path.write_text(cleaned, encoding="utf-8")
    return True


def main():
    fixed = 0
    for path in sorted(QUESTIONS.glob("q*.md")):
        if fix_file(path):
            fixed += 1
            print(f"fixed {path.name}")
    print(f"Done. Fixed {fixed} files.")


if __name__ == "__main__":
    main()
