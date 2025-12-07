import { useEffect, useRef, useState } from 'react';
import { EXECUTION_LANGUAGES } from '../config';
import { runPython } from '../lib/pythonRunner';

const SANDBOX_DOCUMENT = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <script>
      const formatValue = (value) => {
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value, null, 2);
          } catch (error) {
            return String(value);
          }
        }
        return String(value);
      };

      window.addEventListener('message', (event) => {
        if (event.data?.type !== 'execute') return;
        const sendResult = (payload) => {
          window.parent.postMessage(
            { type: 'sandbox_result', ...payload },
            '*'
          );
        };

        try {
          const logs = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(formatValue).join(' '));
            originalLog.apply(console, args);
          };
          const exports = {};
          const module = { exports };
          const AsyncFunction = Object.getPrototypeOf(async function () {})
            .constructor;

          const runner =
            event.data.runtime === 'async'
              ? new AsyncFunction('module', 'exports', event.data.code)
              : new Function('module', 'exports', event.data.code);

          const maybeResult = runner(module, exports);
          const finalize = (value) => {
            const joined = [...logs, value]
              .filter(Boolean)
              .join('\\n')
              .trim();
            sendResult({ ok: true, output: joined || 'Execution finished.' });
          };

          if (maybeResult instanceof Promise) {
            maybeResult
              .then((value) => finalize(formatValue(value)))
              .catch((error) =>
                sendResult({ ok: false, output: error.message })
              )
              .finally(() => {
                console.log = originalLog;
              });
          } else {
            finalize(formatValue(maybeResult));
            console.log = originalLog;
          }
        } catch (error) {
          sendResult({ ok: false, output: error.message });
        }
      });
    </script>
  </body>
</html>`;

export default function RunPanel({ code, language, onOutput }) {
  const iframeRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState('');

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type !== 'sandbox_result') {
        return;
      }
      if (
        iframeRef.current &&
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }
      setStatus('idle');
      const finalResult = event.data.output || '';
      setResult(finalResult);
      onOutput?.(finalResult);
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [onOutput]);

  const executeCode = async () => {
    if (!code?.trim()) {
      setResult('Add some code before running the sandbox.');
      return;
    }
    if (!EXECUTION_LANGUAGES.includes(language)) {
      const message = `Sandbox execution is available only for ${EXECUTION_LANGUAGES.join(
        ', '
      )}.`;
      setResult(message);
      onOutput?.(message);
      return;
    }
    if (language === 'python') {
      setStatus('running');
      try {
        const output = await runPython(code);
        setResult(output);
        onOutput?.(output);
      } catch (error) {
        const message = error?.message || 'Python runtime error';
        setResult(message);
        onOutput?.(message);
      } finally {
        setStatus('idle');
      }
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    setStatus('running');
    iframe.srcdoc = SANDBOX_DOCUMENT;
    const isAsync = code.includes('await ');
    const loadHandler = () => {
      iframe.contentWindow?.postMessage(
        { type: 'execute', code, runtime: isAsync ? 'async' : 'sync' },
        '*'
      );
    };
    iframe.addEventListener('load', loadHandler, { once: true });
  };

  return (
    <div className="run-panel">
      <div className="panel-header">
        <h3>Sandbox Runner</h3>
        <button
          type="button"
          onClick={executeCode}
          className="primary"
          disabled={status === 'running'}
        >
          {status === 'running' ? 'Running…' : 'Run'}
        </button>
      </div>
      <pre className="output-window">{result || 'Output will appear here.'}</pre>
      <iframe
        ref={iframeRef}
        title="sandbox"
        sandbox="allow-scripts"
        style={{ display: 'none' }}
      />
    </div>
  );
}
