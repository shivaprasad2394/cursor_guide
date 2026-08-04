#!/usr/bin/env python3
import re
import subprocess
import tempfile
import os
import sys

QUESTIONS = [
    "q126-remove-linked-list-elements",
    "q127-insert-node-at-position",
    "q128-merge-sorted-lists-with-comparator",
    "q129-partition-list-block-local",
    "q130-copy-list-with-random-pointer",
    "q131-intrusive-circular-doubly-linked-list",
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def extract_solution(path):
    text = open(path, encoding="utf-8").read()
    m = re.search(r"## Solution\s*\n\s*```c\s*\n(.*?)```", text, re.S)
    if not m:
        raise SystemExit(f"no solution in {path}")
    return m.group(1)


def extract_expected(path):
    text = open(path, encoding="utf-8").read()
    m = re.search(r'^expectedOutput:\s*"((?:[^"\\]|\\.)*)"', text, re.M)
    if not m:
        raise SystemExit(f"no expectedOutput in {path}")
    return bytes(m.group(1), "utf-8").decode("unicode_escape")


def main():
    failed = False
    for q in QUESTIONS:
        path = os.path.join(ROOT, "questions", f"{q}.md")
        code = extract_solution(path)
        expected = extract_expected(path)
        fd, tmp = tempfile.mkstemp(suffix=".c")
        os.write(fd, code.encode())
        os.close(fd)
        out_bin = tmp + ".out"
        try:
            comp = subprocess.run(
                [
                    "gcc",
                    "-std=c11",
                    "-Wall",
                    "-Wextra",
                    "-Werror",
                    "-pedantic",
                    tmp,
                    "-o",
                    out_bin,
                ],
                capture_output=True,
                text=True,
            )
            if comp.returncode != 0:
                print(f"FAIL compile {q}:\n{comp.stderr}")
                failed = True
                continue
            run = subprocess.run([out_bin], capture_output=True, text=True)
            if run.returncode != 0:
                print(f"FAIL run {q}: exit {run.returncode}\n{run.stderr}")
                failed = True
                continue
            if run.stdout != expected:
                print(f"FAIL output {q}")
                print("expected:", repr(expected))
                print("got     :", repr(run.stdout))
                failed = True
                continue
            print(f"OK {q}")
        finally:
            for p in (tmp, out_bin):
                try:
                    os.unlink(p)
                except OSError:
                    pass
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
