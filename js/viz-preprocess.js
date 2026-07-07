/**
 * Prepare C source for the Execution Studio live tracer.
 * Strips typedefs and rewrites constructs the mini-interpreter cannot parse
 * (struct dot access, 2D arrays, pointer-to-array params) into equivalent 1D C.
 */

function parseStructFields(body) {
  const fields = [];
  for (const part of body.split(";")) {
    const s = part.trim();
    if (!s) continue;
    const intFields = s.match(/^int\s+(.+)$/);
    if (intFields) {
      intFields[1].split(",").forEach((name) => {
        const n = name.trim();
        if (n) fields.push({ name: n, type: "int" });
      });
      continue;
    }
    const ptr = s.match(/^(?:struct\s+\w+\s+|\w+\s+)\*\s*(\w+)\s*$/);
    if (ptr) fields.push({ name: ptr[1], type: "ptr" });
  }
  return fields;
}

function stripTypedefStructs(source, structDefs) {
  return source.replace(
    /typedef\s+struct\s+(?:(\w+)\s+)?\{([^}]*)\}\s*(\w+)\s*;/g,
    (_, tag, body, alias) => {
      structDefs.set(alias, { tag: tag || alias, fields: parseStructFields(body) });
      return `/* viz: typedef ${alias} stripped */`;
    }
  );
}

/** Interval {s,e} → parallel int arrays (iv_s / iv_e). */
function rewriteIntervals(source) {
  if (!/\bInterval\b/.test(source)) return source;

  let out = source;

  // Interval iv[] = {{1,2},{2,3},...};
  out = out.replace(
    /Interval\s+(\w+)\s*\[\s*\]\s*=\s*\{(\{[^}]+\}(?:\s*,\s*\{[^}]+\})*)\}/g,
    (_, name, pairs) => {
      const parsed = [...pairs.matchAll(/\{\s*(-?\d+)\s*,\s*(-?\d+)\s*\}/g)];
      const s = parsed.map((m) => m[1]).join(", ");
      const e = parsed.map((m) => m[2]).join(", ");
      return `int ${name}_s[] = {${s}}; int ${name}_e[] = {${e}}`;
    }
  );

  // Interval out[4];
  out = out.replace(/Interval\s+(\w+)\s*\[(\d+)\s*\]/g, (_, name, n) => {
    return `int ${name}_s[${n}]; int ${name}_e[${n}]`;
  });

  // Interval name[] params / locals without init
  out = out.replace(/\bInterval\s+(\w+)\s*\[\s*\]/g, (_, name) => {
    return `int ${name}_s[], int ${name}_e[]`;
  });

  // out[m++] = in[i];  (before other struct rewrites)
  out = out.replace(
    /(\w+)\[\s*(\w+)\s*\+\+\s*\]\s*=\s*(\w+)\[([^\]]+)\]\s*;/g,
    (_, dstArr, dstIdxVar, srcArr, srcIdx) =>
      `${dstArr}_s[${dstIdxVar}] = ${srcArr}_s[${srcIdx}]; ${dstArr}_e[${dstIdxVar}] = ${srcArr}_e[${srcIdx}]; ${dstIdxVar}++;`
  );

  // struct copy out[0] = in[0];
  out = out.replace(/\bout\[0\]\s*=\s*in\[0\]\s*;/g, "out_s[0] = in_s[0]; out_e[0] = in_e[0];");

  // member access: name[idx].s / .e
  out = out.replace(/(\w+)\[([^\]]+)\]\.s\b/g, "$1_s[$2]");
  out = out.replace(/(\w+)\[([^\]]+)\]\.e\b/g, "$1_e[$2]");

  // mergeIntervals(in, 4, out)
  out = out.replace(
    /\bmergeIntervals\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/g,
    "mergeIntervals($1_s, $1_e, $2, $3_s, $3_e)"
  );
  out = out.replace(/\bminRemove\s*\(\s*(\w+)\s*,/g, "minRemove($1_s, $1_e,");

  // function signatures
  out = out.replace(
    /int\s+minRemove\s*\(\s*int\s+\w+_s\[\]\s*,\s*int\s+\w+_e\[\]\s*,\s*int\s+n\s*\)/g,
    "int minRemove(int iv_s[], int iv_e[], int n)"
  );
  out = out.replace(
    /int\s+mergeIntervals\s*\(\s*int\s+\w+_s\[\]\s*,\s*int\s+\w+_e\[\]\s*,\s*int\s+n\s*,\s*int\s+\w+_s\[\]\s*,\s*int\s+\w+_e\[\]\s*\)/g,
    "int mergeIntervals(int in_s[], int in_e[], int n, int out_s[], int out_e[])"
  );

  return out;
}

/** Flatten nested {{row},{row}} initializers before 1D flatten. */
function flattenNestedRowInits(source) {
  return source.replace(
    /=\s*\{(\{[^}]+\}(?:\s*,\s*\{[^}]+\})*)\}/g,
    (full, rows) => {
      const nums = [...rows.matchAll(/\{\s*([^}]+)\s*\}/g)].flatMap((m) =>
        m[1].split(",").map((s) => s.trim())
      );
      if (!nums.length) return full;
      return `= {${nums.join(", ")}}`;
    }
  );
}

/** Flatten T name[rows][cols] declarations and rewrite name[r][c] indexing. */
function rewrite2DArrays(source) {
  const grids = new Map();
  let out = source;

  out = out.replace(
    /((?:const\s+)?(?:unsigned\s+)?(?:char|int|short|long)\s+)(\w+)\s*\[\s*(\d+)\s*\]\s*\[\s*(\d+)\s*\]/g,
    (full, typePrefix, name, rows, cols) => {
      grids.set(name, { cols: Number(cols), rows: Number(rows) });
      return `${typePrefix}${name}[${Number(rows) * Number(cols)}]`;
    }
  );

  // params: char g[][8] or const int g[][8]
  out = out.replace(
    /((?:const\s+)?(?:unsigned\s+)?(?:char|int|short|long)\s+)(\w+)\s*\[\s*\]\s*\[\s*(\d+)\s*\]/g,
    (full, typePrefix, name, cols) => {
      if (!grids.has(name)) grids.set(name, { cols: Number(cols), rows: null });
      return `${typePrefix}${name}[]`;
    }
  );

  for (const [name, meta] of grids) {
    const cols = meta.cols;
    const re = new RegExp(`\\b${name}\\s*\\[\\s*([^\\]]+)\\s*\\]\\s*\\[\\s*([^\\]]+)\\s*\\]`, "g");
    out = out.replace(re, (_, r, c) => {
      if (/^\d+$/.test(r.trim()) && /^\d+$/.test(c.trim())) {
        return `${name}[${Number(r) * cols + Number(c)}]`;
      }
      return `${name}[(${r}) * ${cols} + (${c})]`;
    });
  }

  return out;
}

/** q106-style pointer-to-array params and 2D grid row access. */
function rewritePointerToArray(source) {
  let out = source;
  out = out.replace(/void\s+printRow\s*\(\s*int\s*\(\s*\*row\s*\)\s*\[\s*3\s*\]\s*\)/g, "void printRow(int *row)");
  out = out.replace(/\(\s*\*row\s*\)\s*\[\s*(\w+)\s*\]/g, "row[$1]");
  out = out.replace(/int\s*\(\s*\*prow\s*\)\s*\[\s*3\s*\]\s*=\s*grid\s*\+\s*1/g, "int *prow = grid + 3");
  return out;
}

/** Expand string-literal rows in char grid initializers to flat char bytes. */
function rewriteCharGridStringInits(source) {
  return source.replace(
    /char\s+(\w+)\s*\[\s*(\d+)\s*\]\s*=\s*\{([^}]+)\}/gs,
    (full, name, size, body) => {
      if (!/"[^"]*"/.test(body)) return full;
      const rows = body.match(/"([^"]*)"/g);
      if (!rows) return full;
      const chars = [];
      for (const row of rows) {
        const s = row.slice(1, -1);
        for (const ch of s) chars.push(`'${ch === "'" ? "\\'" : ch}'`);
      }
      while (chars.length < Number(size)) chars.push("'\\0'");
      return `char ${name}[${size}] = {${chars.join(", ")}}`;
    }
  );
}

/** @returns {{ source: string, structDefs: Map<string, { tag: string, fields: object[] }>, simplified: boolean }} */
export function preprocessVizSource(source) {
  const structDefs = new Map();
  let out = source;
  const original = source;

  out = stripTypedefStructs(out, structDefs);
  out = rewriteIntervals(out);
  out = flattenNestedRowInits(out);
  out = rewrite2DArrays(out);
  out = rewriteCharGridStringInits(out);
  out = rewritePointerToArray(out);

  // q119 solution had a stray semicolon/brace — normalize while simplifying
  out = out.replace(/\}\s*;\s*\n\s*return\s+-1\s*;/g, "}\n    return -1;");

  return {
    source: out,
    structDefs,
    simplified: out !== original,
  };
}
