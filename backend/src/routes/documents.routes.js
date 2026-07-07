const { Router } = require('express');
const { listDocuments } = require('../services/document.service');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const docs = await listDocuments();
    res.json({ documents: docs });
  } catch (err) {
    console.error('Documents error:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents.' });
  }
});

module.exports = router;
