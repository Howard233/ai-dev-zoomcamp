const sessionControllerFactory = ({ sessionStore, clientUrl }) => {
  if (!sessionStore || !clientUrl) {
    throw new Error('sessionStore and clientUrl are required');
  }

  const createSession = (req, res) => {
    const { language, code } = req.body || {};
    const session = sessionStore.createSession({ language, code });
    return res.status(201).json({
      sessionId: session.id,
      shareUrl: `${clientUrl}/session/${session.id}`,
      language: session.language,
    });
  };

  const getSession = (req, res) => {
    const session = sessionStore.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    return res.json({
      sessionId: session.id,
      language: session.language,
      code: session.code,
      latestOutput: session.latestOutput,
      updatedAt: session.updatedAt,
    });
  };

  return {
    createSession,
    getSession,
  };
};

module.exports = { sessionControllerFactory };
