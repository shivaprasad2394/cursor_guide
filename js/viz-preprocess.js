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
    const scalar = s.match(
      /^(?:unsigned\s+|signed\s+)?(?:u?int\d*_t|size_t|char|short|long|int|bool)\s+(\w+)\s*$/
    );
    if (scalar) {
      fields.push({ name: scalar[1], type: "int" });
      continue;
    }
    const intFields = s.match(/^int\s+(.+)$/);
    if (intFields) {
      intFields[1].split(",").forEach((name) => {
        const n = name.trim();
        if (n) fields.push({ name: n, type: "int" });
      });
      continue;
    }
    const embedded = s.match(/^struct\s+(\w+)\s+(\w+)\s*$/);
    if (embedded) {
      fields.push({ name: embedded[2], type: "embedded", structName: embedded[1] });
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

function stripPlainStructs(source, structDefs) {
  return source.replace(/struct\s+(\w+)\s*\{([^}]*)\}\s*;/g, (_, name, body) => {
    if (!structDefs.has(name)) {
      structDefs.set(name, { tag: name, fields: parseStructFields(body) });
    }
    return `/* viz: struct ${name} stripped */`;
  });
}

function stripFnPtrTypedefs(source, fnPtrTypes) {
  return source.replace(/typedef\s+([^{;]+\(\*\s*(\w+)\s*\)\([^)]*\))\s*;/g, (_, _sig, alias) => {
    fnPtrTypes.add(alias);
    return `/* viz: fnptr ${alias} stripped */`;
  });
}

function stripUnions(source) {
  return source.replace(/(?:typedef\s+)?union\s+(?:\w+\s+)?\{[^}]*\}\s*(?:\w+\s*)?;/g, "/* viz: union stripped */");
}

function stripEnums(source, enumConstants) {
  let nextVal = 0;
  return source.replace(/(?:typedef\s+)?enum\s+(?:\w+\s+)?\{([^}]*)\}\s*(?:\w+\s*)?;/g, (_, body) => {
    for (const part of body.split(",")) {
      const s = part.trim();
      if (!s) continue;
      const m = s.match(/^(\w+)(?:\s*=\s*(-?\d+))?$/);
      if (!m) continue;
      if (m[2] !== undefined) {
        nextVal = Number(m[2]);
      }
      enumConstants.set(m[1], nextVal);
      nextVal += 1;
    }
    return "/* viz: enum stripped */";
  });
}

function stripSimpleMacros(source) {
  let out = source;
  out = out.replace(/#define\s+EXIT_SUCCESS\s+\d+\s*\n?/g, "");
  out = out.replace(/#define\s+EXIT_FAILURE\s+\d+\s*\n?/g, "");
  /* single-line and backslash-continued container_of definitions */
  out = out.replace(/#define\s+container_of\s*\([^)]*\)\s*\\\s*\n\s*[^\n]+\n?/g, "");
  out = out.replace(/#define\s+container_of\s*\([^)]*\)[^\n\\]*\n?/g, "");
  /* orphan macro body if a prior partial strip left it behind */
  out = out.replace(
    /^\s*\(\(type\s*\*\)\(\(char\s*\*\)\(ptr\)\s*-\s*offsetof\(type,\s*member\)\)\)\s*$/gm,
    ""
  );
  return out;
}

function expandContainerOf(source) {
  return source.replace(
    /container_of\s*\(\s*([^,]+)\s*,\s*(?:struct\s+)?(\w+)\s*,\s*(\w+)\s*\)/g,
    'viz_container_of($1, "$2", "$3")'
  );
}

/** Interval {s,e} → parallel int arrays (iv_s / iv_e). */
function rewriteIntervals(source) {
  if (!/\bInterval\b/.test(source)) return source;

  let out = source;

  out = out.replace(
    /Interval\s+(\w+)\s*\[\s*\]\s*=\s*\{(\{[^}]+\}(?:\s*,\s*\{[^}]+\})*)\}/g,
    (_, name, pairs) => {
      const parsed = [...pairs.matchAll(/\{\s*(-?\d+)\s*,\s*(-?\d+)\s*\}/g)];
      const s = parsed.map((m) => m[1]).join(", ");
      const e = parsed.map((m) => m[2]).join(", ");
      return `int ${name}_s[] = {${s}}; int ${name}_e[] = {${e}}`;
    }
  );

  out = out.replace(/Interval\s+(\w+)\s*\[(\d+)\s*\]/g, (_, name, n) => {
    return `int ${name}_s[${n}]; int ${name}_e[${n}]`;
  });

  out = out.replace(/\bInterval\s+(\w+)\s*\[\s*\]/g, (_, name) => {
    return `int ${name}_s[], int ${name}_e[]`;
  });

  out = out.replace(
    /(\w+)\[\s*(\w+)\s*\+\+\s*\]\s*=\s*(\w+)\[([^\]]+)\]\s*;/g,
    (_, dstArr, dstIdxVar, srcArr, srcIdx) =>
      `${dstArr}_s[${dstIdxVar}] = ${srcArr}_s[${srcIdx}]; ${dstArr}_e[${dstIdxVar}] = ${srcArr}_e[${srcIdx}]; ${dstIdxVar}++;`
  );

  out = out.replace(/\bout\[0\]\s*=\s*in\[0\]\s*;/g, "out_s[0] = in_s[0]; out_e[0] = in_e[0];");

  out = out.replace(/(\w+)\[([^\]]+)\]\.s\b/g, "$1_s[$2]");
  out = out.replace(/(\w+)\[([^\]]+)\]\.e\b/g, "$1_e[$2]");

  out = out.replace(
    /\bmergeIntervals\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/g,
    "mergeIntervals($1_s, $1_e, $2, $3_s, $3_e)"
  );
  out = out.replace(/\bminRemove\s*\(\s*(\w+)\s*,/g, "minRemove($1_s, $1_e,");

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

function rewritePointerToArray(source) {
  let out = source;
  out = out.replace(/void\s+printRow\s*\(\s*int\s*\(\s*\*row\s*\)\s*\[\s*3\s*\]\s*\)/g, "void printRow(int *row)");
  out = out.replace(/\(\s*\*row\s*\)\s*\[\s*(\w+)\s*\]/g, "row[$1]");
  out = out.replace(/int\s*\(\s*\*prow\s*\)\s*\[\s*3\s*\]\s*=\s*grid\s*\+\s*1/g, "int *prow = grid + 3");
  return out;
}

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

/** @returns {{ source: string, structDefs: Map, fnPtrTypes: Set<string>, enumConstants: Map<string, number>, simplified: boolean }} */
export function preprocessVizSource(source) {
  const structDefs = new Map();
  const fnPtrTypes = new Set();
  const enumConstants = new Map();
  let out = source;
  const original = source;

  out = stripSimpleMacros(out);
  out = stripEnums(out, enumConstants);
  out = stripUnions(out);
  out = stripFnPtrTypedefs(out, fnPtrTypes);
  out = stripTypedefStructs(out, structDefs);
  out = stripPlainStructs(out, structDefs);
  out = expandContainerOf(out);
  out = rewriteIntervals(out);
  out = flattenNestedRowInits(out);
  out = rewrite2DArrays(out);
  out = rewriteCharGridStringInits(out);
  out = rewritePointerToArray(out);

  out = out.replace(/\}\s*;\s*\n\s*return\s+-1\s*;/g, "}\n    return -1;");

  return {
    source: out,
    structDefs,
    fnPtrTypes,
    enumConstants,
    simplified: out !== original,
  };
}
