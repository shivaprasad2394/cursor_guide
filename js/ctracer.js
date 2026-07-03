/**
 * ctracer.js — executes a practical subset of C in the browser and records
 * a step-by-step trace (line, stack variables, arrays, output) for the
 * Execution Studio visualizer.
 *
 * Supported: int/char/long scalars, arrays, char* strings, pointers into
 * arrays, address-of scalars, arithmetic/bitwise/logical ops, if/while/
 * for/do-while, user functions + recursion, printf/putchar/puts, common
 * <string.h> and <ctype.h> helpers, sizeof, casts.
 *
 * Unsupported constructs (structs, typedef, switch, sscanf, …) throw
 * CUnsupported so the caller can fall back to the pattern demo.
 */

export class CUnsupported extends Error {}
class StopTrace extends Error {}

const TYPES = new Set([
  "int", "char", "long", "short", "unsigned", "signed", "const", "void",
  "float", "double", "size_t", "bool",
  "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  "int8_t", "int16_t", "int32_t", "int64_t",
]);

const UNSUPPORTED_KEYWORDS = new Set(["struct", "typedef", "enum", "union", "switch", "goto"]);

/* ── Tokenizer ────────────────────────────────────────────── */

function escChar(ch) {
  const map = { n: "\n", t: "\t", r: "\r", 0: "\0", "\\": "\\", "'": "'", '"': '"' };
  return map[ch] !== undefined ? map[ch] : ch;
}

function tokenize(src) {
  const toks = [];
  let i = 0;
  let line = 1;
  const n = src.length;

  while (i < n) {
    const c = src[i];
    if (c === "\n") { line += 1; i += 1; continue; }
    if (c === " " || c === "\t" || c === "\r") { i += 1; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i += 1; continue; }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line += 1; i += 1; }
      i += 2;
      continue;
    }
    if (c === "#") { while (i < n && src[i] !== "\n") i += 1; continue; }

    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j += 1;
      toks.push({ t: "id", v: src.slice(i, j), line });
      i = j;
      continue;
    }

    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < n && /[0-9xXa-fA-F.]/.test(src[j])) j += 1;
      let raw = src.slice(i, j);
      while (j < n && /[uUlL]/.test(src[j])) j += 1;
      toks.push({ t: "num", v: Number(raw), line });
      i = j;
      continue;
    }

    if (c === '"') {
      let j = i + 1;
      let s = "";
      while (j < n && src[j] !== '"') {
        if (src[j] === "\\") { s += escChar(src[j + 1]); j += 2; }
        else { s += src[j]; j += 1; }
      }
      toks.push({ t: "str", v: s, line });
      i = j + 1;
      continue;
    }

    if (c === "'") {
      let j = i + 1;
      let ch;
      if (src[j] === "\\") { ch = escChar(src[j + 1]); j += 2; }
      else { ch = src[j]; j += 1; }
      toks.push({ t: "num", v: ch.charCodeAt(0), isChar: true, line });
      i = j + 1;
      continue;
    }

    const three = src.slice(i, i + 3);
    if (three === "<<=" || three === ">>=") { toks.push({ t: "op", v: three, line }); i += 3; continue; }
    const two = src.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "->"].includes(two)) {
      toks.push({ t: "op", v: two, line });
      i += 2;
      continue;
    }
    toks.push({ t: "op", v: c, line });
    i += 1;
  }
  toks.push({ t: "eof", v: "", line });
  return toks;
}

/* ── Parser ───────────────────────────────────────────────── */

class Parser {
  constructor(toks) {
    this.toks = toks;
    this.p = 0;
  }

  peek(k = 0) { return this.toks[this.p + k]; }
  next() { return this.toks[this.p++]; }
  at(v) { const t = this.peek(); return t.v === v && (t.t === "op" || t.t === "id"); }
  eat(v) { if (!this.at(v)) this.err(`expected '${v}' got '${this.peek().v}'`); return this.next(); }
  err(msg) { throw new CUnsupported(`parse: ${msg} (line ${this.peek().line})`); }

  isTypeStart() {
    const t = this.peek();
    return t.t === "id" && TYPES.has(t.v);
  }

  parseProgram() {
    const fns = [];
    const globals = [];
    while (this.peek().t !== "eof") {
      const t = this.peek();
      if (t.t === "id" && UNSUPPORTED_KEYWORDS.has(t.v)) {
        throw new CUnsupported(`'${t.v}' is not supported by the tracer`);
      }
      if (t.t === "id" && t.v === "static") { this.next(); continue; }
      if (!this.isTypeStart()) this.err(`unexpected '${t.v}' at top level`);

      const save = this.p;
      const type = this.parseType();
      const name = this.parseName();

      if (this.at("(")) {
        const fn = this.parseFunction(name, type);
        if (fn) fns.push(fn);
      } else {
        this.p = save;
        globals.push(this.parseDeclStmt());
      }
    }
    return { fns, globals };
  }

  parseType() {
    const words = [];
    while (this.isTypeStart()) words.push(this.next().v);
    let stars = 0;
    while (this.at("*")) { this.next(); stars += 1; }
    return { words, stars, isChar: words.includes("char") };
  }

  parseName() {
    const t = this.peek();
    if (t.t !== "id") this.err("expected identifier");
    return this.next().v;
  }

  parseFunction(name, type) {
    this.eat("(");
    const params = [];
    if (!this.at(")")) {
      while (true) {
        const ptype = this.parseType();
        if (ptype.words.length === 1 && ptype.words[0] === "void" && ptype.stars === 0 && this.at(")")) break;
        const pname = this.parseName();
        let isArr = false;
        if (this.at("[")) { this.next(); if (!this.at("]")) this.next(); this.eat("]"); isArr = true; }
        params.push({ name: pname, isChar: ptype.isChar, isPtr: ptype.stars > 0 || isArr });
        if (this.at(",")) { this.next(); continue; }
        break;
      }
    }
    this.eat(")");
    if (this.at(";")) { this.next(); return null; } // prototype
    const line = this.peek().line;
    const body = this.parseBlock();
    return { name, params, body, line, type };
  }

  parseBlock() {
    this.eat("{");
    const body = [];
    while (!this.at("}")) {
      if (this.peek().t === "eof") this.err("unexpected end of file");
      body.push(this.parseStmt());
    }
    this.eat("}");
    return { k: "block", body };
  }

  parseStmt() {
    const t = this.peek();
    const line = t.line;

    if (t.t === "id" && UNSUPPORTED_KEYWORDS.has(t.v)) {
      throw new CUnsupported(`'${t.v}' is not supported by the tracer`);
    }

    if (this.at("{")) return this.parseBlock();
    if (this.at(";")) { this.next(); return { k: "block", body: [] }; }

    if (t.t === "id") {
      switch (t.v) {
        case "if": {
          this.next(); this.eat("(");
          const cond = this.parseExpr();
          this.eat(")");
          const then = this.parseStmt();
          let els = null;
          if (this.at("else")) { this.next(); els = this.parseStmt(); }
          return { k: "if", cond, then, els, line };
        }
        case "while": {
          this.next(); this.eat("(");
          const cond = this.parseExpr();
          this.eat(")");
          const body = this.parseStmt();
          return { k: "while", cond, body, line };
        }
        case "do": {
          this.next();
          const body = this.parseStmt();
          this.eat("while"); this.eat("(");
          const cond = this.parseExpr();
          this.eat(")"); this.eat(";");
          return { k: "do", body, cond, line };
        }
        case "for": {
          this.next(); this.eat("(");
          let init = null;
          if (!this.at(";")) init = this.isTypeStart() ? this.parseDeclStmt(true) : { k: "expr", e: this.parseExpr(), line };
          if (this.at(";")) this.next();
          let cond = null;
          if (!this.at(";")) cond = this.parseExpr();
          this.eat(";");
          let step = null;
          if (!this.at(")")) step = this.parseExpr();
          this.eat(")");
          const body = this.parseStmt();
          return { k: "for", init, cond, step, body, line };
        }
        case "return": {
          this.next();
          let e = null;
          if (!this.at(";")) e = this.parseExpr();
          this.eat(";");
          return { k: "return", e, line };
        }
        case "break": { this.next(); this.eat(";"); return { k: "break", line }; }
        case "continue": { this.next(); this.eat(";"); return { k: "continue", line }; }
        default: break;
      }
    }

    if (this.isTypeStart()) return this.parseDeclStmt();

    const e = this.parseExpr();
    this.eat(";");
    return { k: "expr", e, line };
  }

  parseDeclStmt(inFor = false) {
    const line = this.peek().line;
    const base = this.parseType();
    const decls = [];
    while (true) {
      let stars = base.stars;
      while (this.at("*")) { this.next(); stars += 1; }
      const name = this.parseName();
      let isArray = false;
      let size = null;
      if (this.at("[")) {
        this.next();
        if (!this.at("]")) size = this.parseExpr();
        this.eat("]");
        if (this.at("[")) throw new CUnsupported("multi-dimensional arrays");
        isArray = true;
      }
      let init = null;
      if (this.at("=")) {
        this.next();
        if (this.at("{")) {
          this.next();
          const items = [];
          while (!this.at("}")) {
            items.push(this.parseAssign());
            if (this.at(",")) this.next();
          }
          this.eat("}");
          init = { k: "list", items };
        } else {
          init = this.parseAssign();
        }
      }
      decls.push({ name, isArray, size, init, isChar: base.isChar, isPtr: stars > 0 });
      if (this.at(",")) { this.next(); continue; }
      break;
    }
    if (!inFor) this.eat(";");
    return { k: "decl", decls, line };
  }

  /* expression precedence chain */
  parseExpr() {
    let e = this.parseAssign();
    while (this.at(",")) {
      this.next();
      const r = this.parseAssign();
      e = { k: "seq", l: e, r };
    }
    return e;
  }

  parseAssign() {
    const e = this.parseCond();
    const t = this.peek();
    if (t.t === "op" && ["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="].includes(t.v)) {
      this.next();
      const r = this.parseAssign();
      return { k: "assign", op: t.v, target: e, e: r };
    }
    return e;
  }

  parseCond() {
    const c = this.parseOr();
    if (this.at("?")) {
      this.next();
      const a = this.parseAssign();
      this.eat(":");
      const b = this.parseCond();
      return { k: "cond", c, a, b };
    }
    return c;
  }

  binChain(sub, ops) {
    let e = sub.call(this);
    while (this.peek().t === "op" && ops.includes(this.peek().v)) {
      const op = this.next().v;
      const r = sub.call(this);
      e = { k: "bin", op, l: e, r };
    }
    return e;
  }

  parseOr() { return this.binChain(this.parseAnd, ["||"]); }
  parseAnd() { return this.binChain(this.parseBitOr, ["&&"]); }
  parseBitOr() { return this.binChain(this.parseBitXor, ["|"]); }
  parseBitXor() { return this.binChain(this.parseBitAnd, ["^"]); }
  parseBitAnd() { return this.binChain(this.parseEq, ["&"]); }
  parseEq() { return this.binChain(this.parseRel, ["==", "!="]); }
  parseRel() { return this.binChain(this.parseShift, ["<", ">", "<=", ">="]); }
  parseShift() { return this.binChain(this.parseAdd, ["<<", ">>"]); }
  parseAdd() { return this.binChain(this.parseMul, ["+", "-"]); }
  parseMul() { return this.binChain(this.parseUnary, ["*", "/", "%"]); }

  looksLikeCast() {
    if (!this.at("(")) return false;
    let k = 1;
    let sawType = false;
    while (true) {
      const t = this.peek(k);
      if (t.t === "id" && TYPES.has(t.v)) { sawType = true; k += 1; continue; }
      if (t.t === "op" && t.v === "*") { k += 1; continue; }
      return sawType && t.t === "op" && t.v === ")";
    }
  }

  parseUnary() {
    const t = this.peek();
    if (t.t === "op" && ["!", "~", "-", "+", "*", "&"].includes(t.v)) {
      this.next();
      return { k: "un", op: t.v, e: this.parseUnary() };
    }
    if (t.t === "op" && (t.v === "++" || t.v === "--")) {
      this.next();
      return { k: "un", op: t.v, e: this.parseUnary(), pre: true };
    }
    if (t.t === "id" && t.v === "sizeof") {
      this.next();
      if (!this.at("(")) {
        return { k: "sizeofExpr", e: this.parseUnary() };
      }
      this.eat("(");
      if (this.isTypeStart()) {
        const ty = this.parseType();
        this.eat(")");
        return { k: "sizeofType", ty };
      }
      const e = this.parseExpr();
      this.eat(")");
      return { k: "sizeofExpr", e };
    }
    if (this.looksLikeCast()) {
      this.next();
      while (!this.at(")")) this.next();
      this.next();
      return this.parseUnary();
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let e = this.parsePrimary();
    while (true) {
      if (this.at("(")) {
        this.next();
        const args = [];
        if (!this.at(")")) {
          while (true) {
            args.push(this.parseAssign());
            if (this.at(",")) { this.next(); continue; }
            break;
          }
        }
        this.eat(")");
        if (e.k !== "id") this.err("indirect calls not supported");
        e = { k: "call", name: e.name, args };
        continue;
      }
      if (this.at("[")) {
        this.next();
        const idx = this.parseExpr();
        this.eat("]");
        e = { k: "idx", base: e, i: idx };
        continue;
      }
      if (this.peek().t === "op" && (this.peek().v === "++" || this.peek().v === "--")) {
        const op = this.next().v;
        e = { k: "un", op, e, post: true };
        continue;
      }
      if (this.at("->") || this.at(".")) throw new CUnsupported("struct member access");
      break;
    }
    return e;
  }

  parsePrimary() {
    const t = this.peek();
    if (t.t === "num") { this.next(); return { k: "num", v: t.v, isChar: !!t.isChar }; }
    if (t.t === "str") { this.next(); return { k: "str", v: t.v }; }
    if (t.t === "id") { this.next(); return { k: "id", name: t.v }; }
    if (this.at("(")) {
      this.next();
      const e = this.parseExpr();
      this.eat(")");
      return e;
    }
    this.err(`unexpected '${t.v}'`);
    return null;
  }
}

/* ── Interpreter ──────────────────────────────────────────── */

const isPtr = (v) => v !== null && typeof v === "object";

function toNum(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (isPtr(v)) return 1; // non-null pointer is truthy
  return 0;
}

class Interp {
  constructor(prog, source, maxSteps) {
    this.fns = new Map(prog.fns.map((f) => [f.name, f]));
    this.globals = new Map();
    this.frames = [];
    this.steps = [];
    this.output = "";
    this.arrays = [];
    this.maxSteps = maxSteps;
    this.truncated = false;
    this.stopNote = "";
    this.srcLines = source.split("\n");

    this.globals.set("NULL", { v: 0 });
    this.globals.set("INT_MAX", { v: 2147483647 });
    this.globals.set("INT_MIN", { v: -2147483648 });
    this.globals.set("UINT_MAX", { v: 4294967295 });
    this.globals.set("CHAR_BIT", { v: 8 });

    for (const g of prog.globals) this.execStmt(g, true);
  }

  makeArray(data, isChar, label) {
    const arr = { data, isChar, label: label || `arr${this.arrays.length}` };
    this.arrays.push(arr);
    return arr;
  }

  strToArray(s, label) {
    const data = [];
    for (const ch of s) data.push(ch.charCodeAt(0));
    data.push(0);
    return this.makeArray(data, true, label);
  }

  readCStr(v) {
    if (!isPtr(v) || !v.arr) return String(toNum(v));
    const { arr, off } = v;
    let s = "";
    for (let i = off; i < arr.data.length && arr.data[i] !== 0; i += 1) {
      s += String.fromCharCode(arr.data[i]);
    }
    return s;
  }

  frame() { return this.frames[this.frames.length - 1]; }

  lookup(name) {
    for (let i = this.frames.length - 1; i >= 0; i -= 1) {
      if (this.frames[i].vars.has(name)) return this.frames[i].vars.get(name);
    }
    if (this.globals.has(name)) return this.globals.get(name);
    throw new CUnsupported(`unknown identifier '${name}'`);
  }

  snap(line, phase, noteOverride) {
    if (this.steps.length >= this.maxSteps) {
      this.truncated = true;
      throw new StopTrace();
    }
    const note = noteOverride || (line ? (this.srcLines[line - 1] || "").trim().slice(0, 100) : "");
    const frames = this.frames.map((fr) => ({
      name: fr.name,
      vars: [...fr.vars.entries()].map(([name, box]) => {
        const v = box.v;
        let text;
        let ptr = null;
        if (isPtr(v) && v.arr) {
          const ai = this.arrays.indexOf(v.arr);
          text = `→ ${v.arr.label}[${v.off}]`;
          ptr = { arrIdx: ai, off: v.off, name };
        } else if (isPtr(v) && v.box) {
          text = "→ (ref)";
        } else if (box.isChar && typeof v === "number" && v > 0) {
          text = `'${String.fromCharCode(v)}' (${v})`;
        } else {
          text = String(v);
        }
        return { name, text, ptr };
      }),
    }));

    const arrays = this.arrays.map((arr, ai) => {
      const cells = arr.data.slice(0, 48).map((x) =>
        arr.isChar ? (x === 0 ? "\\0" : `'${String.fromCharCode(x)}'`) : String(x)
      );
      const ptrs = [];
      for (const fr of frames) {
        for (const v of fr.vars) {
          if (v.ptr && v.ptr.arrIdx === ai && v.ptr.off >= 0 && v.ptr.off < 48) {
            ptrs.push({ name: v.ptr.name, off: v.ptr.off });
          }
        }
      }
      return { label: arr.label, isChar: arr.isChar, cells, more: arr.data.length > 48, ptrs };
    });

    this.steps.push({
      line: line || 0,
      phase: phase || "run",
      note,
      frames,
      arrays,
      output: this.output,
    });
  }

  run() {
    const main = this.fns.get("main");
    if (!main) throw new CUnsupported("no main() found");
    try {
      this.callFn(main, []);
      this.snap(null, "done", "program finished — return 0");
    } catch (e) {
      if (e instanceof StopTrace) {
        this.steps.push({
          line: 0,
          phase: "done",
          note: this.stopNote || `trace capped at ${this.maxSteps} steps`,
          frames: [],
          arrays: this.steps.length ? this.steps[this.steps.length - 1].arrays : [],
          output: this.output,
        });
      } else {
        throw e;
      }
    }
    return { steps: this.steps, output: this.output, truncated: this.truncated };
  }

  callFn(fn, args) {
    if (this.frames.length > 48) {
      this.stopNote = "recursion too deep — trace stopped";
      this.truncated = true;
      throw new StopTrace();
    }
    const vars = new Map();
    fn.params.forEach((p, i) => {
      vars.set(p.name, { v: args[i] !== undefined ? args[i] : 0, isChar: p.isChar && !p.isPtr });
    });
    this.frames.push({ name: fn.name, vars });
    this.snap(fn.line, "call", `→ enter ${fn.name}(${fn.params.map((p) => p.name).join(", ")})`);
    const sig = this.execStmt(fn.body);
    this.frames.pop();
    return sig && sig.type === "return" ? sig.value : 0;
  }

  execStmt(stmt, quiet = false) {
    switch (stmt.k) {
      case "block": {
        for (const s of stmt.body) {
          const sig = this.execStmt(s);
          if (sig) return sig;
        }
        return null;
      }
      case "decl": {
        if (!quiet) this.snap(stmt.line, "declare");
        for (const d of stmt.decls) {
          let box;
          if (d.isArray) {
            let arr;
            if (d.init && d.init.k === "str") {
              arr = this.strToArray(d.init.v, d.name);
            } else if (d.init && d.init.k === "list") {
              const data = d.init.items.map((it) => toNum(this.evalExpr(it)));
              const size = d.size ? toNum(this.evalExpr(d.size)) : data.length;
              while (data.length < size) data.push(0);
              arr = this.makeArray(data, d.isChar, d.name);
            } else {
              const size = d.size ? toNum(this.evalExpr(d.size)) : 0;
              arr = this.makeArray(new Array(Math.max(size, 0)).fill(0), d.isChar, d.name);
            }
            box = { v: { arr, off: 0 }, isChar: false };
          } else if (d.isPtr) {
            let v = 0;
            if (d.init) {
              if (d.init.k === "str") v = { arr: this.strToArray(d.init.v, d.name), off: 0 };
              else v = this.evalExpr(d.init);
            }
            box = { v, isChar: false };
          } else {
            const v = d.init ? this.evalExpr(d.init) : 0;
            box = { v: typeof v === "number" ? v : v, isChar: d.isChar };
          }
          const target = this.frames.length ? this.frame().vars : this.globals;
          target.set(d.name, box);
        }
        return null;
      }
      case "expr": {
        this.snap(stmt.line, "exec");
        this.evalExpr(stmt.e);
        return null;
      }
      case "if": {
        this.snap(stmt.line, "branch");
        const c = toNum(this.evalExpr(stmt.cond));
        if (c) return this.execStmt(stmt.then);
        if (stmt.els) return this.execStmt(stmt.els);
        return null;
      }
      case "while": {
        while (true) {
          this.snap(stmt.line, "loop-test");
          if (!toNum(this.evalExpr(stmt.cond))) break;
          const sig = this.execStmt(stmt.body);
          if (sig) {
            if (sig.type === "break") break;
            if (sig.type === "continue") continue;
            return sig;
          }
        }
        return null;
      }
      case "do": {
        while (true) {
          const sig = this.execStmt(stmt.body);
          if (sig) {
            if (sig.type === "break") break;
            if (sig.type === "return") return sig;
          }
          this.snap(stmt.line, "loop-test");
          if (!toNum(this.evalExpr(stmt.cond))) break;
        }
        return null;
      }
      case "for": {
        if (stmt.init) this.execStmt(stmt.init.k === "decl" ? stmt.init : stmt.init);
        while (true) {
          this.snap(stmt.line, "loop-test");
          if (stmt.cond && !toNum(this.evalExpr(stmt.cond))) break;
          const sig = this.execStmt(stmt.body);
          if (sig) {
            if (sig.type === "break") break;
            if (sig.type === "return") return sig;
          }
          if (stmt.step) this.evalExpr(stmt.step);
        }
        return null;
      }
      case "return": {
        this.snap(stmt.line, "return");
        const v = stmt.e ? this.evalExpr(stmt.e) : 0;
        return { type: "return", value: v };
      }
      case "break": this.snap(stmt.line, "break"); return { type: "break" };
      case "continue": this.snap(stmt.line, "continue"); return { type: "continue" };
      default:
        throw new CUnsupported(`statement '${stmt.k}'`);
    }
  }

  readLvalue(e) {
    if (e.k === "id") return { box: this.lookup(e.name) };
    if (e.k === "idx") {
      const base = this.evalExpr(e.base);
      const i = toNum(this.evalExpr(e.i));
      if (!isPtr(base) || !base.arr) throw new CUnsupported("indexing a non-array value");
      return { arr: base.arr, at: base.off + i };
    }
    if (e.k === "un" && e.op === "*") {
      const p = this.evalExpr(e.e);
      if (isPtr(p) && p.arr) return { arr: p.arr, at: p.off };
      if (isPtr(p) && p.box) return { box: p.box };
      this.stopNote = "null pointer dereference — trace stopped";
      this.truncated = true;
      throw new StopTrace();
    }
    throw new CUnsupported("unsupported assignment target");
  }

  readLoc(loc) {
    if (loc.box) return loc.box.v;
    return loc.arr.data[loc.at] !== undefined ? loc.arr.data[loc.at] : 0;
  }

  writeLoc(loc, v) {
    if (loc.box) { loc.box.v = v; return; }
    loc.arr.data[loc.at] = v;
  }

  evalExpr(e) {
    switch (e.k) {
      case "num": return e.v;
      case "str": {
        if (!e._arr) e._arr = this.strToArray(e.v, `"${e.v.slice(0, 12)}"`);
        return { arr: e._arr, off: 0 };
      }
      case "id": return this.lookup(e.name).v;
      case "seq": { this.evalExpr(e.l); return this.evalExpr(e.r); }
      case "idx": {
        const base = this.evalExpr(e.base);
        const i = toNum(this.evalExpr(e.i));
        if (!isPtr(base) || !base.arr) throw new CUnsupported("indexing a non-array value");
        const v = base.arr.data[base.off + i];
        return v !== undefined ? v : 0;
      }
      case "cond": return toNum(this.evalExpr(e.c)) ? this.evalExpr(e.a) : this.evalExpr(e.b);
      case "sizeofType": {
        const w = e.ty.words;
        if (e.ty.stars > 0) return 8;
        if (w.includes("char") || w.includes("bool") || w.includes("int8_t") || w.includes("uint8_t")) return 1;
        if (w.includes("short") || w.includes("int16_t") || w.includes("uint16_t")) return 2;
        if (w.includes("double") || w.includes("long") || w.includes("size_t") || w.includes("int64_t") || w.includes("uint64_t")) return 8;
        return 4;
      }
      case "sizeofExpr": {
        const v = this.evalExpr(e.e);
        if (isPtr(v) && v.arr) return v.arr.data.length * (v.arr.isChar ? 1 : 4);
        return 4;
      }
      case "un": return this.evalUnary(e);
      case "bin": return this.evalBinary(e);
      case "assign": return this.evalAssign(e);
      case "call": return this.evalCall(e);
      default:
        throw new CUnsupported(`expression '${e.k}'`);
    }
  }

  evalUnary(e) {
    const op = e.op;
    if (op === "&") {
      if (e.e.k === "id") {
        const box = this.lookup(e.e.name);
        if (isPtr(box.v) && box.v.arr) return { arr: box.v.arr, off: box.v.off };
        return { box };
      }
      if (e.e.k === "idx") {
        const base = this.evalExpr(e.e.base);
        const i = toNum(this.evalExpr(e.e.i));
        if (isPtr(base) && base.arr) return { arr: base.arr, off: base.off + i };
      }
      throw new CUnsupported("address-of expression");
    }
    if (op === "*") {
      const loc = this.readLvalue(e);
      return this.readLoc(loc);
    }
    if (op === "++" || op === "--") {
      const loc = this.readLvalue(e.e);
      const old = this.readLoc(loc);
      let nv;
      if (isPtr(old) && old.arr) nv = { arr: old.arr, off: old.off + (op === "++" ? 1 : -1) };
      else nv = toNum(old) + (op === "++" ? 1 : -1);
      this.writeLoc(loc, nv);
      return e.post ? old : nv;
    }
    const v = this.evalExpr(e.e);
    switch (op) {
      case "!": return toNum(v) ? 0 : 1;
      case "~": return ~toNum(v);
      case "-": return -toNum(v);
      case "+": return toNum(v);
      default:
        throw new CUnsupported(`unary '${op}'`);
    }
  }

  evalBinary(e) {
    if (e.op === "&&") return toNum(this.evalExpr(e.l)) && toNum(this.evalExpr(e.r)) ? 1 : 0;
    if (e.op === "||") return toNum(this.evalExpr(e.l)) || toNum(this.evalExpr(e.r)) ? 1 : 0;

    const l = this.evalExpr(e.l);
    const r = this.evalExpr(e.r);

    if (isPtr(l) && l.arr && typeof r === "number") {
      if (e.op === "+") return { arr: l.arr, off: l.off + r };
      if (e.op === "-") return { arr: l.arr, off: l.off - r };
    }
    if (isPtr(l) && isPtr(r) && l.arr && r.arr && l.arr === r.arr) {
      if (e.op === "-") return l.off - r.off;
      if (e.op === "==") return l.off === r.off ? 1 : 0;
      if (e.op === "!=") return l.off !== r.off ? 1 : 0;
      if (e.op === "<") return l.off < r.off ? 1 : 0;
      if (e.op === ">") return l.off > r.off ? 1 : 0;
      if (e.op === "<=") return l.off <= r.off ? 1 : 0;
      if (e.op === ">=") return l.off >= r.off ? 1 : 0;
    }

    const a = toNum(l);
    const b = toNum(r);
    switch (e.op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": {
        if (b === 0) { this.stopNote = "division by zero — trace stopped"; this.truncated = true; throw new StopTrace(); }
        return Number.isInteger(a) && Number.isInteger(b) ? Math.trunc(a / b) : a / b;
      }
      case "%": {
        if (b === 0) { this.stopNote = "mod by zero — trace stopped"; this.truncated = true; throw new StopTrace(); }
        return a % b;
      }
      case "&": return a & b;
      case "|": return a | b;
      case "^": return a ^ b;
      case "<<": return a << b;
      case ">>": return a >> b;
      case "==": return a === b ? 1 : 0;
      case "!=": return a !== b ? 1 : 0;
      case "<": return a < b ? 1 : 0;
      case ">": return a > b ? 1 : 0;
      case "<=": return a <= b ? 1 : 0;
      case ">=": return a >= b ? 1 : 0;
      default:
        throw new CUnsupported(`operator '${e.op}'`);
    }
  }

  evalAssign(e) {
    const loc = this.readLvalue(e.target);
    let v;
    if (e.op === "=") {
      v = this.evalExpr(e.e);
    } else {
      const cur = toNum(this.readLoc(loc));
      const r = toNum(this.evalExpr(e.e));
      const op = e.op.slice(0, -1);
      switch (op) {
        case "+": v = cur + r; break;
        case "-": v = cur - r; break;
        case "*": v = cur * r; break;
        case "/": v = r === 0 ? 0 : Math.trunc(cur / r); break;
        case "%": v = r === 0 ? 0 : cur % r; break;
        case "&": v = cur & r; break;
        case "|": v = cur | r; break;
        case "^": v = cur ^ r; break;
        case "<<": v = cur << r; break;
        case ">>": v = cur >> r; break;
        default:
          throw new CUnsupported(`assignment '${e.op}'`);
      }
    }
    this.writeLoc(loc, v);
    return v;
  }

  cFormat(fmt, args) {
    let ai = 0;
    return fmt.replace(/%([-+0# ]*)(\d*|\*)(?:\.(\d+|\*))?(?:hh|h|ll|l|z)?([diucsxXofeEgp%])/g, (m, flags, width, prec, conv) => {
      if (conv === "%") return "%";
      if (width === "*") width = String(toNum(args[ai++]));
      if (prec === "*") prec = String(toNum(args[ai++]));
      const a = args[ai++];
      let s;
      switch (conv) {
        case "d": case "i": s = String(Math.trunc(toNum(a))); break;
        case "u": s = String(toNum(a) >>> 0); break;
        case "x": s = (toNum(a) >>> 0).toString(16); break;
        case "X": s = (toNum(a) >>> 0).toString(16).toUpperCase(); break;
        case "o": s = (toNum(a) >>> 0).toString(8); break;
        case "c": s = String.fromCharCode(toNum(a)); break;
        case "s": s = this.readCStr(a); if (prec) s = s.slice(0, +prec); break;
        case "p": s = isPtr(a) && a.arr ? `0x${(4096 + a.off * 4).toString(16)}` : (toNum(a) === 0 ? "0x0" : `0x${toNum(a).toString(16)}`); break;
        case "f": case "e": case "E": case "g": s = Number(toNum(a)).toFixed(prec ? +prec : 6); break;
        default: s = m;
      }
      const w = +width || 0;
      if (w && s.length < w) {
        if (flags.includes("-")) s = s.padEnd(w, " ");
        else if (flags.includes("0") && conv !== "s") s = s.padStart(w, "0");
        else s = s.padStart(w, " ");
      }
      return s;
    });
  }

  cScan(args) {
    const input = this.readCStr(args[0]);
    const fmt = this.readCStr(args[1]);
    let ai = 2;
    let si = 0;
    let fi = 0;
    let count = 0;
    const skipWs = () => { while (si < input.length && /\s/.test(input[si])) si += 1; };
    const storeNum = (v) => {
      const dst = args[ai++];
      if (isPtr(dst)) {
        if (dst.box) dst.box.v = v;
        else if (dst.arr) dst.arr.data[dst.off] = v;
      }
    };
    const storeStr = (s) => {
      const dst = args[ai++];
      if (isPtr(dst) && dst.arr) {
        for (let k = 0; k < s.length; k += 1) dst.arr.data[dst.off + k] = s.charCodeAt(k);
        dst.arr.data[dst.off + s.length] = 0;
      }
    };

    while (fi < fmt.length) {
      const fc = fmt[fi];
      if (/\s/.test(fc)) { skipWs(); fi += 1; continue; }
      if (fc !== "%") {
        if (input[si] !== fc) return count;
        si += 1; fi += 1;
        continue;
      }
      fi += 1;
      if (fmt[fi] === "%") {
        if (input[si] !== "%") return count;
        si += 1; fi += 1;
        continue;
      }
      let width = 0;
      while (/[0-9]/.test(fmt[fi])) { width = width * 10 + Number(fmt[fi]); fi += 1; }
      while (/[hlz]/.test(fmt[fi])) fi += 1;
      const conv = fmt[fi];
      fi += 1;

      if (conv === "d" || conv === "i" || conv === "u") {
        skipWs();
        const m = input.slice(si).match(/^[-+]?[0-9]+/);
        if (!m) return count;
        const text = width ? m[0].slice(0, width) : m[0];
        si += text.length;
        storeNum(parseInt(text, 10));
        count += 1;
      } else if (conv === "x" || conv === "X") {
        skipWs();
        const m = input.slice(si).match(/^(0[xX])?[0-9a-fA-F]+/);
        if (!m) return count;
        si += m[0].length;
        storeNum(parseInt(m[0], 16));
        count += 1;
      } else if (conv === "f" || conv === "g" || conv === "e") {
        skipWs();
        const m = input.slice(si).match(/^[-+]?[0-9]*\.?[0-9]+/);
        if (!m) return count;
        si += m[0].length;
        storeNum(parseFloat(m[0]));
        count += 1;
      } else if (conv === "c") {
        if (si >= input.length) return count;
        storeNum(input.charCodeAt(si));
        si += 1;
        count += 1;
      } else if (conv === "s") {
        skipWs();
        const start = si;
        while (si < input.length && !/\s/.test(input[si]) && (!width || si - start < width)) si += 1;
        if (si === start) return count;
        storeStr(input.slice(start, si));
        count += 1;
      } else if (conv === "[") {
        let neg = false;
        if (fmt[fi] === "^") { neg = true; fi += 1; }
        let set = "";
        while (fi < fmt.length && fmt[fi] !== "]") { set += fmt[fi]; fi += 1; }
        fi += 1;
        const start = si;
        while (si < input.length && (!width || si - start < width)) {
          const inSet = set.includes(input[si]);
          if (neg ? inSet : !inSet) break;
          si += 1;
        }
        if (si === start) return count;
        storeStr(input.slice(start, si));
        count += 1;
      } else {
        throw new CUnsupported(`sscanf conversion '%${conv}'`);
      }
    }
    return count;
  }

  evalCall(e) {
    const args = e.args.map((a) => this.evalExpr(a));
    const name = e.name;

    const user = this.fns.get(name);
    if (user) return this.callFn(user, args);

    switch (name) {
      case "printf": {
        const fmt = isPtr(args[0]) ? this.readCStr(args[0]) : String(args[0]);
        const out = this.cFormat(fmt, args.slice(1));
        this.output += out;
        if (this.output.length > 4000) { this.stopNote = "output too long — stopped"; this.truncated = true; throw new StopTrace(); }
        return out.length;
      }
      case "putchar": this.output += String.fromCharCode(toNum(args[0])); return toNum(args[0]);
      case "puts": this.output += this.readCStr(args[0]) + "\n"; return 0;
      case "strlen": return this.readCStr(args[0]).length;
      case "strcmp": {
        const a = this.readCStr(args[0]);
        const b = this.readCStr(args[1]);
        return a < b ? -1 : a > b ? 1 : 0;
      }
      case "strncmp": {
        const a = this.readCStr(args[0]).slice(0, toNum(args[2]));
        const b = this.readCStr(args[1]).slice(0, toNum(args[2]));
        return a < b ? -1 : a > b ? 1 : 0;
      }
      case "strcpy": case "strncpy": {
        const dst = args[0];
        const src = this.readCStr(args[1]);
        if (!isPtr(dst) || !dst.arr) return dst;
        const limit = name === "strncpy" ? toNum(args[2]) : src.length + 1;
        for (let i = 0; i < Math.min(src.length, limit); i += 1) dst.arr.data[dst.off + i] = src.charCodeAt(i);
        if (src.length < limit) dst.arr.data[dst.off + src.length] = 0;
        return dst;
      }
      case "strchr": {
        const s = args[0];
        if (!isPtr(s) || !s.arr) return 0;
        const target = toNum(args[1]);
        for (let i = s.off; i < s.arr.data.length; i += 1) {
          if (s.arr.data[i] === target) return { arr: s.arr, off: i };
          if (s.arr.data[i] === 0) break;
        }
        return 0;
      }
      case "strstr": {
        const hay = args[0];
        if (!isPtr(hay) || !hay.arr) return 0;
        const h = this.readCStr(hay);
        const nstr = this.readCStr(args[1]);
        const at = h.indexOf(nstr);
        return at < 0 ? 0 : { arr: hay.arr, off: hay.off + at };
      }
      case "strcat": {
        const dst = args[0];
        const cur = this.readCStr(dst);
        const src = this.readCStr(args[1]);
        for (let i = 0; i < src.length; i += 1) dst.arr.data[dst.off + cur.length + i] = src.charCodeAt(i);
        dst.arr.data[dst.off + cur.length + src.length] = 0;
        return dst;
      }
      case "memset": {
        const dst = args[0];
        const val = toNum(args[1]);
        const n = toNum(args[2]);
        if (isPtr(dst) && dst.arr) for (let i = 0; i < n && dst.off + i < dst.arr.data.length; i += 1) dst.arr.data[dst.off + i] = val;
        return dst;
      }
      case "memcpy": case "memmove": {
        const dst = args[0];
        const src = args[1];
        const n = toNum(args[2]);
        if (isPtr(dst) && dst.arr && isPtr(src) && src.arr) {
          const tmp = [];
          for (let i = 0; i < n; i += 1) tmp.push(src.arr.data[src.off + i] || 0);
          for (let i = 0; i < n; i += 1) dst.arr.data[dst.off + i] = tmp[i];
        }
        return dst;
      }
      case "malloc": case "calloc": {
        const bytes = name === "calloc" ? toNum(args[0]) * toNum(args[1]) : toNum(args[0]);
        const arr = this.makeArray(new Array(Math.max(1, Math.min(Math.trunc(bytes / 4) || bytes, 64))).fill(0), false, "heap");
        return { arr, off: 0 };
      }
      case "free": return 0;
      case "tolower": { const c = toNum(args[0]); return c >= 65 && c <= 90 ? c + 32 : c; }
      case "toupper": { const c = toNum(args[0]); return c >= 97 && c <= 122 ? c - 32 : c; }
      case "isalpha": { const c = toNum(args[0]); return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) ? 1 : 0; }
      case "isdigit": { const c = toNum(args[0]); return c >= 48 && c <= 57 ? 1 : 0; }
      case "isalnum": { const c = toNum(args[0]); return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) ? 1 : 0; }
      case "isspace": { const c = toNum(args[0]); return c === 32 || (c >= 9 && c <= 13) ? 1 : 0; }
      case "abs": return Math.abs(toNum(args[0]));
      case "sqrt": return Math.sqrt(toNum(args[0]));
      case "pow": return Math.pow(toNum(args[0]), toNum(args[1]));
      case "sprintf": {
        const dst = args[0];
        const fmt = this.readCStr(args[1]);
        const out = this.cFormat(fmt, args.slice(2));
        if (isPtr(dst) && dst.arr) {
          for (let i = 0; i < out.length; i += 1) dst.arr.data[dst.off + i] = out.charCodeAt(i);
          dst.arr.data[dst.off + out.length] = 0;
        }
        return out.length;
      }
      case "sscanf": return this.cScan(args);
      case "snprintf": {
        const dst = args[0];
        const size = toNum(args[1]);
        const fmt = this.readCStr(args[2]);
        const out = this.cFormat(fmt, args.slice(3));
        if (isPtr(dst) && dst.arr && size > 0) {
          const w = Math.min(out.length, size - 1);
          for (let i = 0; i < w; i += 1) dst.arr.data[dst.off + i] = out.charCodeAt(i);
          dst.arr.data[dst.off + w] = 0;
        }
        return out.length;
      }
      default:
        throw new CUnsupported(`function '${name}' is not supported by the tracer`);
    }
  }
}

export function traceC(source, opts = {}) {
  const toks = tokenize(source);
  const prog = new Parser(toks).parseProgram();
  const interp = new Interp(prog, source, opts.maxSteps || 1500);
  return interp.run();
}
