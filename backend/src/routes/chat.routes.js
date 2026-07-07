const { Router } = require('express');
const { ask } = require('../services/rag.service');
const Message = require('../models/Message');

const router = Router();

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

module.exports = router;
