#!/usr/bin/env python3
"""Import interview_all_guide_v2.md into c-interview-prep questions."""

import json
import re
from pathlib import Path

GUIDE = Path("/home/shivaprasad/chandu/husband/lord_claude/interview_all_guide_v2.md")
OUT_DIR = Path("/home/shivaprasad/Workspace/c-interview-prep/questions")

SECTION_DIFFICULTY = {
    "strings": "easy",
    "arrays": "medium",
    "bit manipulation": "easy",
    "math / number": "easy",
    "linked list": "medium",
    "binary search tree": "hard",
    "queues & stacks": "medium",
    "parsing & formatting": "medium",
    "buffers & driver patterns": "hard",
    "memory, dma, mmap & reimplementing libc": "hard",
}


def slugify(text: str) -> str:
    text = re.sub(r"^\d+[,\d\s]*\.\s*", "", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:80]


def extract_main(c_code: str) -> str | None:
    m = re.search(r"\bint\s+main\s*\([^)]*\)\s*\{", c_code)
    if not m:
        return None
    start = m.start()
    i = m.end() - 1
    depth = 0
    while i < len(c_code):
        ch = c_code[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return c_code[start : i + 1]
        i += 1
    return None


def format_main(main_code: str) -> str:
    """Expand one-line mains slightly for readability."""
    if main_code.count("\n") > 3:
        return main_code
    body = main_code
    body = re.sub(r";\s*", ";\n    ", body)
    body = re.sub(r"\{\s*", "{\n    ", body)
    body = re.sub(r"\s*\}\s*$", "\n}", body)
    body = re.sub(r"\n\s*\n", "\n", body)
    return body


def extract_scaffolding(c_code: str, main_start: int) -> list[str]:
    header = c_code[:main_start]
    lines = []
    i = 0
    raw_lines = header.splitlines()
    while i < len(raw_lines):
        line = raw_lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith("/*") or stripped.startswith("*") or stripped.startswith("//"):
            i += 1
            continue
        if stripped.startswith("#include") or stripped.startswith("#define"):
            lines.append(line.rstrip())
            i += 1
            continue
        if stripped.startswith("typedef") or stripped.startswith("struct ") or stripped.startswith("enum "):
            block = [line]
            brace = line.count("{") - line.count("}")
            i += 1
            while i < len(raw_lines) and (brace > 0 or ";" not in block[-1]):
                block.append(raw_lines[i])
                brace += raw_lines[i].count("{") - raw_lines[i].count("}")
                i += 1
            lines.extend(l.rstrip() for l in block)
            continue
        i += 1
    return lines


def build_starter(solution: str) -> str:
    main = extract_main(solution)
    if not main:
        return solution
    main_start = solution.index(main)
    scaffolding = extract_scaffolding(solution, main_start)
    main_fmt = format_main(main)
    parts = []
    if scaffolding:
        parts.extend(scaffolding)
        parts.append("")
    parts.append("/* TODO: implement the helper function(s) your main needs */")
    parts.append("")
    parts.append(main_fmt)
    return "\n".join(parts)


def yaml_escape(s: str) -> str:
    if not s:
        return '""'
    if "\n" in s or ":" in s or '"' in s:
        return "|\n" + "\n".join("  " + line for line in s.splitlines())
    return f'"{s}"'


def parse_sections(text: str) -> list[dict]:
    section_starts = [
        (m.start(), m.group(1).strip().lower())
        for m in re.finditer(r"^## Section \d+ — (.+)$", text, re.MULTILINE)
    ]
    heading_starts = [
        (m.start(), m.group(1).strip()) for m in re.finditer(r"^### (.+)$", text, re.MULTILINE)
    ]

    def section_at(pos: int) -> str:
        current = "general"
        for start, name in section_starts:
            if start <= pos:
                current = name
            else:
                break
        return current

    questions = []
    for idx, (pos, title) in enumerate(heading_starts):
        end = heading_starts[idx + 1][0] if idx + 1 < len(heading_starts) else len(text)
        chunk = text[pos:end]
        current_section = section_at(pos)

        num_m = re.match(r"^(\d+)", title)
        num = int(num_m.group(1)) if num_m else len(questions) + 1
        qid = f"q{num:02d}-{slugify(title)}"

        c_blocks = re.findall(r"```c\n([\s\S]*?)```", chunk)
        if not c_blocks:
            continue
        solution = c_blocks[-1].strip()

        sample_m = re.search(r"\*\*Sample output:\*\*\s*\n+```(?:text)?\n([\s\S]*?)```", chunk)
        expected = sample_m.group(1).strip() if sample_m else ""
        expected = expected.replace("(nil)", "0x0")

        pattern_m = re.search(r"\*\*Pattern:\*\*\s*(.+)", chunk)
        pattern = pattern_m.group(1).strip().lower() if pattern_m else current_section.split("&")[0].strip()

        complexity_m = re.search(r"\*\*Complexity:\*\*\s*(.+)", chunk)
        complexity = complexity_m.group(1).strip() if complexity_m else ""

        def_m = re.search(r"\*\*Definition:\*\*\s*(.+)", chunk)
        prob_m = re.search(r"\*\*Problem:\*\*\s*(.+)", chunk)
        description = (def_m or prob_m).group(1).strip() if (def_m or prob_m) else re.sub(r"^\d+[,\d\s]*\.\s*", "", title)

        algo_parts = []
        for label in ("Algorithm", "Approach / Logic"):
            am = re.search(rf"\*\*{re.escape(label)}:?\*\*\s*\n+```text\n([\s\S]*?)```", chunk)
            if am:
                algo_parts.append(am.group(1).strip())
        if not algo_parts:
            am = re.search(r"\*\*Approach / Logic:\*\*\s*\n((?:-[^\n]+\n?)+)", chunk)
            if am:
                algo_parts.append(am.group(1).strip())
        if not algo_parts:
            pre_c = chunk.split("```c")[0]
            texts = re.findall(r"```text\n([\s\S]*?)```", pre_c)
            for t in texts:
                if re.search(r"step\d|step1|walk |O\(", t, re.I):
                    algo_parts.append(t.strip())
                    break

        examples = re.findall(r"\*\*Example\*\*\s*\n+```text\n([\s\S]*?)```", chunk)
        example_text = "\n\n".join(ex.strip() for ex in examples[:2])

        diff = SECTION_DIFFICULTY.get(current_section, "medium")

        questions.append(
            {
                "id": qid,
                "title": title,
                "section": current_section,
                "pattern": pattern[:40],
                "difficulty": diff,
                "complexity": complexity,
                "description": description,
                "algorithm": "\n\n".join(algo_parts),
                "example": example_text,
                "expectedOutput": expected + ("\n" if expected and not expected.endswith("\n") else ""),
                "starter": build_starter(solution),
                "solution": solution,
            }
        )

    return questions


def write_question(q: dict) -> str:
    filename = f"{q['id']}.md"
    meta = {
        "id": q["id"],
        "title": re.sub(r"^\d+[,\d\s]*\.\s*", "", q["title"]),
        "pattern": q["pattern"],
        "difficulty": q["difficulty"],
        "visualization": "none",
        "stdin": "",
    }
    if q["complexity"]:
        meta["complexity"] = q["complexity"]
    if q["expectedOutput"]:
        meta["expectedOutput"] = q["expectedOutput"].rstrip("\n") + "\n"

    fm_lines = ["---"]
    for k, v in meta.items():
        if k == "expectedOutput":
            fm_lines.append(f"expectedOutput: {yaml_escape(v)}")
        elif isinstance(v, str) and "\n" in v:
            fm_lines.append(f"{k}: {yaml_escape(v)}")
        else:
            fm_lines.append(f'{k}: "{v}"' if isinstance(v, str) else f"{k}: {v}")
    fm_lines.append("---")

    body = ["", "## Description", "", q["description"], ""]
    if q["algorithm"]:
        body.extend(["## Algorithm", "", "```text", q["algorithm"], "```", ""])
    if q["example"]:
        body.extend(["## Example Trace", "", "```text", q["example"], "```", ""])
    body.extend(["## Starter Code", "", "```c", q["starter"], "```", ""])
    body.extend(["## Solution", "", "```c", q["solution"], "```", ""])

    content = "\n".join(fm_lines) + "\n" + "\n".join(body)
    (OUT_DIR / filename).write_text(content, encoding="utf-8")
    return filename


def main():
    text = GUIDE.read_text(encoding="utf-8")
    questions = parse_sections(text)

    for old in OUT_DIR.glob("q*.md"):
        old.unlink()
    for old in ("reverse-string-in-place.md", "find-single-xor.md", "binary-search.md"):
        p = OUT_DIR / old
        if p.exists():
            p.unlink()

    index = {"questions": []}
    for q in questions:
        fname = write_question(q)
        index["questions"].append(
            {
                "id": q["id"],
                "file": fname,
                "title": re.sub(r"^\d+[,\d\s]*\.\s*", "", q["title"]),
                "pattern": q["pattern"],
                "difficulty": q["difficulty"],
                "section": q["section"],
            }
        )

    (OUT_DIR / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(questions)} questions in {OUT_DIR}")


if __name__ == "__main__":
    main()
