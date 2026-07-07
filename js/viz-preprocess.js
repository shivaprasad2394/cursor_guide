/**
 * Strip typedef lines for the Execution Studio live tracer only.
 * Registers struct field layouts so ctracer can run linked-list code.
 */
function parseStructFields(body) {
  const fields = [];
  for (const part of body.split(";")) {
    const s = part.trim();
    if (!s) continue;
    let m = s.match(/^int\s+(\w+)\s*$/);
    if (m) {
      fields.push({ name: m[1], type: "int" });
      continue;
    }
    m = s.match(/^(?:struct\s+\w+\s+|\w+\s+)\*\s*(\w+)\s*$/);
    if (m) {
      fields.push({ name: m[1], type: "ptr" });
    }
  }
  return fields;
}

/** @returns {{ source: string, structDefs: Map<string, { tag: string, fields: object[] }> }} */
export function preprocessVizSource(source) {
  const structDefs = new Map();
  const sourceOut = source.replace(
    /typedef\s+struct\s+(?:(\w+)\s+)?\{([^}]*)\}\s*(\w+)\s*;/g,
    (_, tag, body, alias) => {
      structDefs.set(alias, { tag: tag || alias, fields: parseStructFields(body) });
      return `/* viz: typedef ${alias} stripped */`;
    }
  );
  return { source: sourceOut, structDefs };
}
