import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import ParticipantList from '../components/ParticipantList';
import RunPanel from '../components/RunPanel';
import { SUPPORTED_LANGUAGES } from '../config';
import { useInterviewSession } from '../hooks/useInterviewSession';

export default function Session() {
  const { sessionId } = useParams();
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('displayName') || 'Guest';
  });
  const [nameTouched, setNameTouched] = useState(false);

  const {
    code,
    language,
    output,
    participants,
    error,
    fetchState,
    socketState,
    updateCode,
    updateLanguage,
    broadcastOutput,
  } = useInterviewSession(sessionId, displayName);

  useEffect(() => {
    if (nameTouched) {
      localStorage.setItem('displayName', displayName);
    }
  }, [displayName, nameTouched]);

  const statusMessage = useMemo(() => {
    if (error) return error;
    if (fetchState === 'loading') return 'Validating session…';
    if (socketState === 'connecting') return 'Connecting to room…';
    if (socketState === 'connected') return 'Connected';
    return null;
  }, [error, fetchState, socketState]);

  return (
    <main className="page session">
      <header className="session-header">
        <div>
          <h1>Room #{sessionId}</h1>
          {statusMessage && <p className="status">{statusMessage}</p>}
        </div>
        <label className="name-field">
          Display name
          <input
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setNameTouched(true);
            }}
          />
        </label>
      </header>

      <div className="session-grid">
        <aside>
          <ParticipantList participants={participants} />
          <section className="panel">
            <h3>Latest Sandbox Output</h3>
            <pre className="output-window">
              {output || 'Run the sandbox to broadcast results.'}
            </pre>
          </section>
        </aside>

        <section className="workspace">
          <div className="toolbar">
            <label>
              Language
              <select
                value={language}
                onChange={(event) => updateLanguage(event.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="editor-wrapper">
            <CodeEditor
              value={code}
              language={language}
              onChange={updateCode}
            />
          </div>

          <RunPanel
            code={code}
            language={language}
            onOutput={broadcastOutput}
          />
        </section>
      </div>
    </main>
  );
}
