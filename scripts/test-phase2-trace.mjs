import { readFileSync } from "fs";
import { traceC } from "../js/ctracer.js";
import { preprocessVizSource } from "../js/viz-preprocess.js";

function traceSolution(file) {
  const md = readFileSync(`./questions/${file}`, "utf8");
  const m = md.match(/## Solution\s*\n+```c\n([\s\S]*?)```/);
  if (!m) throw new Error("no solution");
  const code = m[1].trim();
  const { source, structDefs, fnPtrTypes } = preprocessVizSource(code);
  if (/^\s*\(\(type\s*\*/m.test(source)) {
    throw new Error("container_of macro body leaked into preprocessed source");
  }
  return traceC(code, {
    vizStructs: structDefs.size > 0,
    structDefs,
    fnPtrTypes: [...fnPtrTypes],
    preprocessedSource: source,
    maxSteps: 4000,
  });
}

for (const f of [
  "q131-intrusive-circular-doubly-linked-list.md",
  "q126-remove-linked-list-elements.md",
  "q125-remove-first-n-nodes-doubly-linked-list.md",
]) {
  try {
    const t = traceSolution(f);
    console.log(f, "OK", "steps=", t.steps.length, "out=", JSON.stringify(t.output.trim().slice(0, 80)));
  } catch (e) {
    console.error(f, "FAIL", e.message);
    process.exitCode = 1;
  }
}
