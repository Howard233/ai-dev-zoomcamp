const { createServer } = require('./createServer');

const PORT = process.env.PORT || 4000;

const { httpServer } = createServer();

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});
