const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

function getDocumentsDir() {
  return path.resolve(process.env.DOCUMENTS_DIR || './documents');
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt' || ext === '.md') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data.text;
  }

  if (ext === '.docx') {
    const buf = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value;
  }

  throw new Error(`Format non supporté : ${ext}`);
}

async function listDocuments() {
  const dir = getDocumentsDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.txt', '.md', '.pdf', '.docx'].includes(ext);
  });

  return files.map(f => {
    const fullPath = path.join(dir, f);
    const stats = fs.statSync(fullPath);
    return {
      name: f,
      path: fullPath,
      size: stats.size,
      modified: stats.mtime,
    };
  });
}

async function loadAllDocuments() {
  const files = await listDocuments();
  const docs = [];
  for (const file of files) {
    const text = await extractText(file.path);
    docs.push({ name: file.name, path: file.path, text });
  }
  return docs;
}

module.exports = { listDocuments, loadAllDocuments, extractText, getDocumentsDir };
