import { readFileSync } from "fs";
import { traceC } from "../js/ctracer.js";
import { preprocessVizSource } from "../js/viz-preprocess.js";

function traceSolution(file) {
  const md = readFileSync(`./questions/${file}`, "utf8");
  const m = md.match(/## Solution\s*\n+```c\n([\s\S]*?)```/);
  if (!m) throw new Error("no solution");
  const code = m[1].trim();
  const { source, structDefs, fnPtrTypes, enumConstants } = preprocessVizSource(code);
  return traceC(code, {
    vizStructs: structDefs.size > 0,
    structDefs,
    fnPtrTypes: [...fnPtrTypes],
    enumConstants,
    preprocessedSource: source,
    maxSteps: 5000,
  });
}

const inline = `
enum { RED = 1, GREEN = 2 };
int cmp(const void *a, const void *b) {
  return *(int *)a - *(int *)b;
}
int main(void) {
  int arr[] = { 3, 1, 2 };
  qsort(arr, 3, sizeof(int), cmp);
  printf("%d %d %d\\n", arr[0], arr[1], arr[2]);
  switch (GREEN) {
    case RED: printf("red\\n"); break;
    case GREEN: printf("green\\n"); break;
    default: printf("other\\n"); break;
  }
  return 0;
}
`;

for (const [label, fn] of [
  ["inline switch+enum+qsort", () => {
    const { source, structDefs, fnPtrTypes, enumConstants } = preprocessVizSource(inline);
    return traceC(inline, {
      structDefs,
      fnPtrTypes: [...fnPtrTypes],
      enumConstants,
      preprocessedSource: source,
      maxSteps: 2000,
    });
  }],
  ["q84-custom-snprintf", () => traceSolution("q84-custom-snprintf-bounded-returns-would-be-length.md")],
  ["q76-dma-ring", () => traceSolution("q76-dma-descriptor-ring-nic-hardware-driver-style.md")],
]) {
  try {
    const t = fn();
    console.log(label, "OK", "steps=", t.steps.length, "out=", JSON.stringify(t.output.trim().slice(0, 120)));
  } catch (e) {
    console.error(label, "FAIL", e.message);
    process.exitCode = 1;
  }
}
