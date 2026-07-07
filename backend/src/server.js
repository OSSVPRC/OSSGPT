require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const chatRoutes = require('./routes/chat.routes');
const documentsRoutes = require('./routes/documents.routes');
const indexRoutes = require('./routes/index.routes');
const { checkHealth } = require('./services/glm.service');

const app = express();
const PORT = process.env.PORT || 8030;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:4200'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.warn('MongoDB not available:', err.message));

app.get('/', (req, res) => {
  res.json({ name: 'OSSGPT Backend', status: 'running', frontend: FRONTEND_URL, docs: '/api/health' });
});

app.get('/api/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  try {
    await checkHealth();
    res.json({ status: 'ok', glm: 'connected', mongodb: mongoState });
  } catch (err) {
    const status = err.response?.status;
    if (status === 429 || status === 402) {
      res.json({ status: 'ok', glm: 'no_balance', mongodb: mongoState });
    } else {
      res.json({ status: 'ok', glm: 'unreachable', mongodb: mongoState });
    }
  }
});

app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/index', indexRoutes);

async function autoBuildIndex() {
  try {
    const { buildIndex, loadIndex } = require('./services/embedding.service');
    const index = loadIndex();
    if (index.chunks.length > 0) {
      console.log(`Index already built: ${index.chunks.length} chunks`);
      return;
    }
    console.log('Building document index...');
    const result = await buildIndex();
    console.log(`Index built: ${result.count} chunks from ${result.sources.length} documents`);
  } catch (err) {
    console.warn('Index build skipped:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`OSSGPT Backend running on http://localhost:${PORT}`);
  autoBuildIndex();
});
