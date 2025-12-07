import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sessionStore = require('../src/sessionStore');
const {
  sessionControllerFactory,
} = require('../src/controllers/sessionController');

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

describe('Session API integration', () => {
  const controller = sessionControllerFactory({
    sessionStore,
    clientUrl: 'http://localhost:5173',
  });

  beforeEach(() => {
    sessionStore.clearSessions();
  });

  it('creates sessions with starter code + share URL', () => {
    const req = {
      body: {
        language: 'python',
        code: 'print("hi")',
      },
    };
    const res = createMockRes();

    controller.createSession(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.language).toBe('python');
    expect(res.body.shareUrl).toBe(
      `http://localhost:5173/session/${res.body.sessionId}`
    );
  });

  it('persists session state so clients can fetch it later', () => {
    const createRes = createMockRes();
    controller.createSession(
      { body: { language: 'javascript', code: 'console.log("A");' } },
      createRes
    );

    const fetchRes = createMockRes();
    controller.getSession(
      { params: { id: createRes.body.sessionId } },
      fetchRes
    );

    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.body.code).toContain('console.log');
    expect(fetchRes.body.latestOutput).toBe('');
  });

  it('returns 404 for missing sessions', () => {
    const res = createMockRes();
    controller.getSession({ params: { id: 'missing' } }, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Session not found' });
  });
});
