/**
 * In-browser C compile + run via browsercc (Clang WASM). No API key.
 * First Run downloads ~60 MB of compiler assets from jsDelivr, then caches them.
 */

const BROWSERCC = "https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js";
const WASI_SHIM = "https://esm.sh/@bjorn3/browser_wasi_shim";

let depsPromise = null;

function loadDeps() {
  if (!depsPromise) {
    depsPromise = Promise.all([import(BROWSERCC), import(WASI_SHIM)]);
  }
  return depsPromise;
}

/** Warm compiler download (optional). */
export function preloadCompiler() {
  return loadDeps();
}

/**
 * browsercc always drives clang++ (filename before flags), so void* from malloc
 * needs an explicit cast. Insert (Type*) on pointer = malloc(...) assignments.
 */
function prepareCSource(source) {
  let s = source;
  s = s.replace(
    /((?:struct\s+)?[A-Za-z_]\w*)\s*(\*+)\s*([A-Za-z_]\w*)\s*=\s*malloc\s*\(/g,
    (_, type, stars, name) => {
      const ptrType = `${type}${stars}`.replace(/\s+/g, " ").trim();
      return `${ptrType} ${name} = (${ptrType})malloc(`;
    }
  );
  s = s.replace(
    /(\b[A-Za-z_]\w*)\s*(\*+)([A-Za-z_]\w*)\s*=\s*malloc\s*\(/g,
    (_, type, stars, name) => {
      const ptrType = `${type}${stars}`;
      return `${ptrType}${name} = (${ptrType})malloc(`;
    }
  );
  return s;
}

/**
 * @param {string} source C source
 * @param {string} [stdin]
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string, compileOutput: string }>}
 */
export async function compileAndRun(source, stdin = "") {
  const [{ compile }, wasi] = await loadDeps();
  const { WASI, File, OpenFile, ConsoleStdout } = wasi;

  const prepared = prepareCSource(source);
  const { module, compileOutput } = await compile({
    source: prepared,
    fileName: "main.c",
    flags: ["-Wall"],
  });

  if (!module) {
    return {
      ok: false,
      stdout: "",
      stderr: compileOutput,
      compileOutput,
    };
  }

  let stdout = "";
  let stderr = "";
  const stdinBytes = new TextEncoder().encode(stdin);

  const fds = [
    new OpenFile(new File(stdinBytes)),
    new ConsoleStdout((data) => {
      stdout += new TextDecoder().decode(data);
    }),
    new ConsoleStdout((data) => {
      stderr += new TextDecoder().decode(data);
    }),
  ];

  const wasiRuntime = new WASI([], [], fds);
  const instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: wasiRuntime.wasiImport,
  });

  try {
    wasiRuntime.start(instance);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    stderr = stderr ? `${stderr}\n${msg}` : msg;
  }

  return {
    ok: !stderr && compileOutput.indexOf("error:") === -1,
    stdout,
    stderr,
    compileOutput,
  };
}
