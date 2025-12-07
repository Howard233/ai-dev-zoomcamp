const { v4: uuidv4 } = require('uuid');

const DEFAULT_LANGUAGE = 'javascript';

class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  createSession({ language = DEFAULT_LANGUAGE, code = '' } = {}) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      language,
      code,
      latestOutput: '',
      updatedAt: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  updateCode(sessionId, code) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    session.code = code;
    session.updatedAt = Date.now();
    return session;
  }

  updateLanguage(sessionId, language) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    session.language = language;
    session.updatedAt = Date.now();
    return session;
  }

  updateOutput(sessionId, output) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    session.latestOutput = output;
    session.updatedAt = Date.now();
    return session;
  }
}

module.exports = new SessionStore();
