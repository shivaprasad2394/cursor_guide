import { readFileSync } from "fs";
import { traceC } from "./js/ctracer.js";
import { preprocessVizSource } from "./js/viz-preprocess.js";

const md = readFileSync("./questions/q56-deletenode-remove-first-node-matching-key.md", "utf8");
const m = md.match(/## Solution\s*\n+```c\n([\s\S]*?)```/);
const code = m[1].trim();
const { source, structDefs } = preprocessVizSource(code);
try {
  const t = traceC(code, { vizStructs: true, structDefs, preprocessedSource: source });
  console.log("steps:", t.steps.length, "output:", JSON.stringify(t.output));
} catch (e) {
  console.error("FAIL:", e.message);
  process.exit(1);
}
