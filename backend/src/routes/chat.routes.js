const { Router } = require('express');
const { ask } = require('../services/rag.service');
const { searchRelevantChunks } = require('../services/embedding.service');
const { chatStream } = require('../services/glm.service');
const Message = require('../models/Message');

const router = Router();

const SYSTEM_PROMPT = `Assistant OSSGPT de l'Observatoire du Sahara et du Sahel. Réponds en français, de façon concise, sans réfléchir à voix haute. Base-toi uniquement sur le contexte fourni.`;

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Le message est requis.' });
    }

    const result = await ask(message.trim());

    Message.create({ question: message.trim(), reply: result.reply, sources: result.sources })
      .catch(err => console.warn('Failed to save message:', err.message));

    res.json(result);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Erreur lors du traitement de la question.' });
  }
});

router.post('/stream', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Le message est requis.' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  let fullReply = '';
  const sources = [];

  try {
    const relevantChunks = await searchRelevantChunks(message.trim());
    let context = '';
    if (relevantChunks.length > 0) {
      context = relevantChunks
        .map(r => `[Source: ${r.chunk.source}]\n${r.chunk.text}`)
        .join('\n\n---\n\n');
      const seen = new Set();
      for (const r of relevantChunks) {
        if (!seen.has(r.chunk.source)) {
          seen.add(r.chunk.source);
          sources.push({ name: r.chunk.source, score: r.score.toFixed(3) });
        }
      }
    }

    const userMessage = context
      ? `Contexte documentaire :\n\n${context}\n\nQuestion : ${message}`
      : message;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];

    res.write(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`);

    await chatStream(messages, (token) => {
      fullReply += token;
      res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
    });

    Message.create({ question: message.trim(), reply: fullReply, sources })
      .catch(err => console.warn('Failed to save message:', err.message));

    res.write(`data: ${JSON.stringify({ type: 'done', reply: fullReply, sources })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat stream error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Erreur lors du traitement.' })}\n\n`);
    res.end();
  }
});

module.exports = router;