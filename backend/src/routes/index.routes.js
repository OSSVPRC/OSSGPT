const { Router } = require('express');
const { buildIndex } = require('../services/embedding.service');
const { checkHealth } = require('../services/ollama.service');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await buildIndex();
    res.json({ message: 'Indexation terminée.', ...result });
  } catch (err) {
    console.error('Index error:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'indexation.' });
  }
});

module.exports = router;
