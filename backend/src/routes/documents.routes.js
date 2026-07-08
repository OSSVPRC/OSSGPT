const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const { listDocuments, getDocumentsDir } = require('../services/document.service');
const { buildIndex } = require('../services/embedding.service');

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

router.post('/upload', async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ error: 'name et content requis.' });
    }
    const dir = getDocumentsDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, name);
    fs.writeFileSync(filePath, content, 'utf-8');
    const result = await buildIndex();
    res.json({ message: `Fichier ${name} ajouté et indexé.`, ...result });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: "Erreur lors de l'upload." });
  }
});

module.exports = router;
