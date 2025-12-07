import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

export function useInterviewSession(sessionId, displayName) {
  const [fetchState, setFetchState] = useState('idle');
  const [socketState, setSocketState] = useState('idle');
  const [error, setError] = useState(null);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [participants, setParticipants] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      if (!sessionId) return;
      setFetchState('loading');
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/sessions/${sessionId}`
        );
        if (!response.ok) {
          throw new Error('Session not found');
        }
        const payload = await response.json();
        if (cancelled) return;
        setCode(payload.code || '');
        setLanguage(payload.language || 'javascript');
        setOutput(payload.latestOutput || '');
        setFetchState('ready');
      } catch (err) {
        if (cancelled) return;
        setFetchState('error');
        setError(err.message || 'Unable to load session');
      }
    };
    loadSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (fetchState !== 'ready' || !displayName) {
      return;
    }
    setSocketState('connecting');
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketState('connected');
      socket.emit('join_session', { sessionId, displayName });
    });

    socket.on('connect_error', (err) => {
      setSocketState('error');
      setError(err.message);
    });

    socket.on('session_error', (payload) => {
      setSocketState('error');
      setError(payload?.message || 'Unable to join session');
    });

    socket.on('session_state', (payload) => {
      setCode(payload.code || '');
      setLanguage(payload.language || 'javascript');
      setOutput(payload.latestOutput || '');
      setParticipants(payload.participants || []);
    });

    socket.on('code_update', ({ code: newCode }) => {
      setCode(newCode);
    });

    socket.on('language_update', ({ language: nextLang }) => {
      setLanguage(nextLang);
    });

    socket.on('output_broadcast', ({ output: sharedOutput }) => {
      setOutput(sharedOutput || '');
    });

    socket.on('participants_update', ({ participants: list }) => {
      setParticipants(list || []);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketState('idle');
    };
  }, [displayName, fetchState, sessionId]);

  const emitIfConnected = (eventName, payload) => {
    const socket = socketRef.current;
    if (!socket || socket.disconnected) {
      return;
    }
    socket.emit(eventName, payload);
  };

  const updateCode = (value) => {
    setCode(value);
    emitIfConnected('code_change', { sessionId, code: value });
  };

  const updateLanguage = (value) => {
    setLanguage(value);
    emitIfConnected('language_change', { sessionId, language: value });
  };

  const broadcastOutput = (value) => {
    setOutput(value);
    emitIfConnected('output_update', { sessionId, output: value });
  };

  return {
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
  };
}
