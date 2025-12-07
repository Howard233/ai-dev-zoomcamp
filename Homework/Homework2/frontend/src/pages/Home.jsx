import { useState } from 'react';
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

  return (
    <main className="page home">
      <header>
        <h1>Interview Collaboration Platform</h1>
        <p>
          Spin up a link, collaborate in real time, and run JavaScript right in
          the browser sandbox without touching a server.
        </p>
      </header>

      <section className="panel">
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
    </main>
  );
}
