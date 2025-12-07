import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, SUPPORTED_LANGUAGES } from '../config';

export default function Home() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [starterCode, setStarterCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [shareLink, setShareLink] = useState('');

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: starterCode }),
      });
      if (!response.ok) {
        throw new Error('Unable to create a session');
      }
      const payload = await response.json();
      setShareLink(payload.shareUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const goToSession = () => {
    if (!shareLink) return;
    const url = new URL(shareLink);
    navigate(url.pathname);
  };

  const copyShareLink = async () => {
    if (!shareLink || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch (copyError) {
      console.warn('Unable to copy link', copyError); // eslint-disable-line no-console
    }
  };

  const highlightCards = useMemo(
    () => [
      {
        title: 'Real-time Pairing',
        description:
          'Socket.IO keeps every participant in sync with the same code, cursor, and sandbox output.',
      },
      {
        title: 'In-browser Sandbox',
        description:
          'Execute JavaScript, TypeScript, and Python safely in the browser using iframes + Pyodide.',
      },
      {
        title: 'Zero Install',
        description:
          'Share a single link with candidates—no repositories, accounts, or local tooling required.',
      },
    ],
    []
  );

  return (
    <main className="page home">
      <header className="hero">
        <div>
          <p className="eyebrow">AI Dev Tools Zoomcamp · Homework 2</p>
          <h1>
            A polished, real-time coding studio for technical interviews.
          </h1>
          <p className="muted">
            Create a collaborative room, invite your candidate, and pair on
            solutions with syntax highlighting, live cursors, and browser-only
            execution—no deployments or IDE setup required.
          </p>
          <div className="hero-stats">
            <div>
              <h2>3+</h2>
              <p>Supported languages</p>
            </div>
            <div>
              <h2>0</h2>
              <p>Server-side executions</p>
            </div>
            <div>
              <h2>Realtime</h2>
              <p>Code + Output sync</p>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <p>Trusted modes</p>
          <ul>
            <li>✅ Live pair programming</li>
            <li>✅ Interview record keeping</li>
            <li>✅ Candidate-friendly sandbox</li>
          </ul>
        </div>
      </header>

      <div className="home-grid">
        <section className="panel session-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Generate your interview room</h2>
              <p className="muted">
                Choose a default language, drop in starter code, and share the
                secure invite link.
              </p>
            </div>
          </div>
          <form className="session-form" onSubmit={handleCreateSession}>
            <label>
              Preferred language
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Starter code (optional)
              <textarea
                value={starterCode}
                placeholder="// Provide starter snippets or keep empty"
                onChange={(event) => setStarterCode(event.target.value)}
              />
            </label>

            <button type="submit" className="primary" disabled={creating}>
              {creating ? 'Creating…' : 'Generate shareable room'}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
          {shareLink && (
            <div className="share-card">
              <p>Send this link to your candidate:</p>
              <code>{shareLink}</code>
              <div className="actions">
                <button type="button" onClick={goToSession}>
                  Open interview room
                </button>
                <button
                  type="button"
                  onClick={copyShareLink}
                >
                  Copy link
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="panel highlight-panel">
          <p className="eyebrow">Why teams love it</p>
          <div className="highlight-grid">
            {highlightCards.map((card) => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
