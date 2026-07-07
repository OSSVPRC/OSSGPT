const { Router } = require('express');
const { ask } = require('../services/rag.service');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Le message est requis.' });
    }

    const result = await ask(message.trim());
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Erreur lors du traitement de la question.' });
  }
});

module.exports = router;
