/* Quick smoke test: run the mini C tracer over every question's solution
 * and report which ones trace live vs fall back to the pattern demo. */
import { readFileSync, readdirSync } from "node:fs";
import { traceC } from "../js/ctracer.js";

const dir = new URL("../questions/", import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();

let ok = 0;
let fail = 0;
const failures = [];

for (const f of files) {
  const raw = readFileSync(dir + f, "utf8");
  const m = raw.match(/## Solution\s*\n+```c\n([\s\S]*?)```/i);
  if (!m) { failures.push([f, "no solution block"]); fail += 1; continue; }
  try {
    const trace = traceC(m[1]);
    if (!trace.steps.length) throw new Error("no steps");
    ok += 1;
    if (process.argv.includes("-v")) {
      console.log(`OK   ${f}  steps=${trace.steps.length} out=${JSON.stringify(trace.output.slice(0, 40))}`);
    }
  } catch (e) {
    fail += 1;
    failures.push([f, String(e.message).slice(0, 80)]);
  }
}

console.log(`\ntraced live: ${ok} / ${files.length}  (fallback to pattern demo: ${fail})`);
for (const [f, why] of failures) console.log(`  FALLBACK ${f}: ${why}`);
