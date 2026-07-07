#!/usr/bin/env python3
"""Normalize Starter Code and Solution C blocks in question markdown files."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "questions"


def split_c_statements(text: str) -> list[str]:
    stmts: list[str] = []
    i = 0
    start = 0
    depth = 0
    parens = 0
    in_str = False
    escape = False
    while i < len(text):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
        elif ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        elif ch == "(":
            parens += 1
        elif ch == ")":
            parens -= 1
        elif ch == ";" and depth == 0 and parens == 0:
            part = text[start : i + 1].strip()
            if part:
                stmts.append(part)
            start = i + 1
        i += 1
    tail = text[start:].strip()
    if tail:
        stmts.append(tail)
    return stmts


def is_block_brace(stmt: str, idx: int) -> bool:
    before = stmt[:idx].rstrip()
    return before.endswith(")") or before.endswith("else")


def format_statement(stmt: str, indent: int) -> list[str]:
    stmt = stmt.strip()
    if not stmt:
        return []
    pad = "    " * indent
    brace_idx = stmt.find("{")
    if brace_idx >= 0 and is_block_brace(stmt, brace_idx):
        idx = brace_idx
        head = stmt[: idx + 1].rstrip()
        rest = stmt[idx + 1 :]
        depth = 1
        j = 0
        while j < len(rest) and depth:
            if rest[j] == "{":
                depth += 1
            elif rest[j] == "}":
                depth -= 1
            j += 1
        inner = rest[: j - 1]
        tail = rest[j:].lstrip()
        if tail.startswith(";"):
            tail = tail[1:].strip()
        lines = [pad + head]
        if inner.strip():
            lines.extend(format_body(inner, indent + 1))
        lines.append(pad + "}")
        if tail:
            lines.extend(format_body(tail, indent))
        return lines
    return [pad + stmt]


def format_body(body: str, indent: int = 1) -> list[str]:
    lines: list[str] = []
    for stmt in split_c_statements(body):
        lines.extend(format_statement(stmt, indent))
    return lines


def normalize_spaces(code: str) -> str:
    code = code.replace("\t", "    ")
    code = re.sub(r"\r\n?", "\n", code)
    code = re.sub(r"\bfor\s*\(", "for (", code)
    code = re.sub(r"\bwhile\s*\(", "while (", code)
    code = re.sub(r"\bif\s*\(", "if (", code)
    return code


def fix_split_for_loops(code: str) -> str:
    return re.sub(
        r"for\s*\(([^;\n]+);\s*\n\s*([^;\n]+);\s*\n\s*([^)]+)\)\s*",
        r"for (\1; \2; \3) ",
        code,
    )


def fix_broken_string_lines(code: str) -> str:
    lines = code.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if 'printf("' in line and line.count('"') % 2 == 1 and i + 1 < len(lines):
            merged = line
            j = i + 1
            while j < len(lines) and merged.count('"') % 2 == 1:
                merged = merged.rstrip() + " " + lines[j].strip()
                j += 1
            out.append(merged)
            i = j
            continue
        out.append(line)
        i += 1
    return "\n".join(out)


def fix_missing_semicolons(body: str) -> str:
    return re.sub(
        r"\}\s*(?=(?:return|for|while|if|printf|/\*|[A-Za-z_][A-Za-z0-9_]*\s*=))",
        r"}; ",
        body,
    )


def reformat_main(code: str) -> str:
    out: list[str] = []
    pos = 0
    pattern = re.compile(r"int main\s*\(\s*void\s*\)\s*\{")
    while True:
        m = pattern.search(code, pos)
        if not m:
            out.append(code[pos:])
            break
        out.append(code[pos : m.start()])
        body_start = m.end()
        depth = 1
        i = body_start
        while i < len(code) and depth:
            if code[i] == "{":
                depth += 1
            elif code[i] == "}":
                depth -= 1
            i += 1
        body = code[body_start : i - 1]
        body = fix_missing_semicolons(body.strip())
        lines = format_body(body, indent=1)
        out.append("int main(void) {\n")
        out.append("\n".join(lines))
        if lines:
            out.append("\n")
        out.append("}\n")
        pos = i
    return "".join(out)


def fix_array_init_semicolons(code: str) -> str:
    return re.sub(
        r"(\[[^\]]*\]\s*=\s*\{[\s\S]*?\})\s*\n\s*(?=for|while|if|printf|return)",
        r"\1;\n",
        code,
    )


def format_c_code(code: str) -> str:
    code = normalize_spaces(code.strip())
    code = fix_broken_string_lines(code)
    code = fix_split_for_loops(code)
    code = fix_array_init_semicolons(code)
    code = reformat_main(code)
    code = re.sub(r"\n{3,}", "\n\n", code)
    return code.rstrip() + "\n"


def replace_code_sections(text: str) -> tuple[str, int]:
    changes = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changes
        heading = match.group(1)
        body = match.group(2)
        formatted = format_c_code(body)
        old = body.rstrip() + "\n"
        if formatted != old:
            changes += 1
        return f"## {heading}\n\n```c\n{formatted}```"

    updated = re.sub(
        r"## (Starter Code|Solution)\s*\n+```c\n([\s\S]*?)```",
        repl,
        text,
    )
    return updated, changes


def main() -> None:
    total_files = 0
    total_changes = 0
    for path in sorted(QUESTIONS.glob("q*.md")):
        raw = path.read_text(encoding="utf-8")
        updated, changes = replace_code_sections(raw)
        if changes:
            path.write_text(updated, encoding="utf-8")
            total_files += 1
            total_changes += changes
            print(f"{path.name}: {changes} block(s)")
    print(f"Done. Updated {total_files} files ({total_changes} code blocks).")


if __name__ == "__main__":
    main()
