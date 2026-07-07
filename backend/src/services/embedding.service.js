const fs = require('fs');
const path = require('path');
const { embed } = require('./ollama.service');
const { chunkText } = require('../utils/chunkText');
const { loadAllDocuments } = require('./document.service');

function getIndexPath() {
  return path.resolve(process.env.INDEX_PATH || './data/index.json');
}

function loadIndex() {
  const indexPath = getIndexPath();
  if (fs.existsSync(indexPath)) {
    const raw = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(raw);
  }
  return { chunks: [], embeddings: [] };
}

function saveIndex(index) {
  const indexPath = getIndexPath();
  const dir = path.dirname(indexPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

async function buildIndex() {
  const docs = await loadAllDocuments();
  const allChunks = [];

  for (const doc of docs) {
    const chunks = chunkText(doc.text);
    for (const c of chunks) {
      allChunks.push({ ...c, source: doc.name });
    }
  }

  const texts = allChunks.map(c => c.text);
  const result = await embed(texts);

  const embeddings = result.embeddings || [];

  const index = { chunks: allChunks, embeddings };
  saveIndex(index);
  return { count: allChunks.length, sources: docs.map(d => d.name) };
}

async function searchRelevantChunks(question, topK = 5) {
  const index = loadIndex();
  if (index.chunks.length === 0 || index.embeddings.length === 0) {
    return [];
  }

  const result = await embed([question]);
  const queryEmbedding = result.embeddings?.[0];
  if (!queryEmbedding) return [];

  const { cosineSimilarity } = require('../utils/cosineSimilarity');

  const scored = index.embeddings.map((emb, i) => ({
    chunk: index.chunks[i],
    score: cosineSimilarity(queryEmbedding, emb),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter(item => item.score > 0.3);
}

module.exports = { buildIndex, searchRelevantChunks, loadIndex };
