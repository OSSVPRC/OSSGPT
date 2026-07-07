require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRoutes = require('./routes/chat.routes');
const documentsRoutes = require('./routes/documents.routes');
const indexRoutes = require('./routes/index.routes');
const { checkHealth } = require('./services/ollama.service');

const app = express();
const PORT = process.env.PORT || 8030;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await checkHealth();
    res.json({ status: 'ok', ollama: 'connected' });
  } catch {
    res.json({ status: 'ok', ollama: 'unreachable' });
  }
});

app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/index', indexRoutes);

app.listen(PORT, () => {
  console.log(`OSSGPT Backend running on http://localhost:${PORT}`);
});
