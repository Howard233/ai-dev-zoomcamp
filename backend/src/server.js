const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const sessionStore = require('./sessionStore');

const PORT = process.env.PORT || 4000;
const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});

const participants = new Map(); // sessionId -> Map<socketId, participant>

const getRoomName = (sessionId) => `session:${sessionId}`;

function getParticipants(sessionId) {
  const group = participants.get(sessionId);
  if (!group) {
    return [];
  }
  return Array.from(group.values());
}

app.post('/api/sessions', (req, res) => {
  const { language, code } = req.body || {};
  const session = sessionStore.createSession({ language, code });
  res.status(201).json({
    sessionId: session.id,
    shareUrl: `${CLIENT_URL}/session/${session.id}`,
    language: session.language,
  });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  res.json({
    sessionId: session.id,
    language: session.language,
    code: session.code,
    latestOutput: session.latestOutput,
    updatedAt: session.updatedAt,
  });
});

io.on('connection', (socket) => {
  socket.on('join_session', ({ sessionId, displayName }) => {
    const session = sessionStore.getSession(sessionId);
    if (!session) {
      socket.emit('session_error', { message: 'Session not found' });
      return;
    }

    socket.join(getRoomName(sessionId));
    socket.data.sessionId = sessionId;
    socket.data.displayName = displayName || 'Anonymous';

    if (!participants.has(sessionId)) {
      participants.set(sessionId, new Map());
    }
    participants
      .get(sessionId)
      .set(socket.id, {
        id: socket.id,
        name: socket.data.displayName,
      });

    socket.emit('session_state', {
      code: session.code,
      language: session.language,
      latestOutput: session.latestOutput,
      participants: getParticipants(sessionId),
    });

    socket.to(getRoomName(sessionId)).emit('participants_update', {
      participants: getParticipants(sessionId),
    });
  });

  socket.on('code_change', ({ sessionId, code }) => {
    if (sessionStore.updateCode(sessionId, code)) {
      socket.to(getRoomName(sessionId)).emit('code_update', {
        code,
        editorId: socket.id,
      });
    }
  });

  socket.on('language_change', ({ sessionId, language }) => {
    if (sessionStore.updateLanguage(sessionId, language)) {
      io.to(getRoomName(sessionId)).emit('language_update', {
        language,
      });
    }
  });

  socket.on('output_update', ({ sessionId, output }) => {
    if (sessionStore.updateOutput(sessionId, output)) {
      socket.to(getRoomName(sessionId)).emit('output_broadcast', {
        output,
      });
    }
  });

  socket.on('disconnect', () => {
    const { sessionId } = socket.data;
    if (!sessionId) {
      return;
    }
    const group = participants.get(sessionId);
    if (!group) {
      return;
    }
    group.delete(socket.id);
    io.to(getRoomName(sessionId)).emit('participants_update', {
      participants: getParticipants(sessionId),
    });
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});
