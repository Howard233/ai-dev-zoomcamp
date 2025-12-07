import { loadPyodide } from 'pyodide';

let pyodideInstancePromise;

async function ensurePyodide() {
  if (!pyodideInstancePromise) {
    pyodideInstancePromise = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
    });
  }
  return pyodideInstancePromise;
}

export async function runPython(code) {
  const pyodide = await ensurePyodide();
  const script = `
import sys, io, traceback
from contextlib import redirect_stdout, redirect_stderr

_stream = io.StringIO()
_result = ""
try:
    with redirect_stdout(_stream), redirect_stderr(_stream):
        exec(compile(${JSON.stringify(code)}, "<exec>", "exec"), {})
except Exception:
    _result = _stream.getvalue() + "\\n" + traceback.format_exc()
else:
    _result = _stream.getvalue() or "Execution finished."
_result
`;
  const output = await pyodide.runPythonAsync(script);
  return String(output || '').trim();
}
