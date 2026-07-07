const fs = require('fs');
const path = require('path');
const { chunkText } = require('../utils/chunkText');
const { loadAllDocuments } = require('./document.service');

const STOP_WORDS = new Set([
  'le','la','les','de','du','des','un','une','dans','sur','pour','par','avec','est',
  'sont','ont','ont','été','être','avoir','faire','ce','cet','cette','ces','son','sa',
  'ses','leur','leurs','mon','ma','mes','ton','ta','tes','notre','nos','votre','vos',
  'lui','elle','eux','ils','elles','nous','vous','je','tu','il','elle','on','nous',
  'vous','ils','elles','me','te','se','y','en','et','ou','mais','donc','car','ni',
  'que','qui','quoi','dont','où','au','aux','ne','pas','plus','très','bien','mal',
  'the','a','an','and','or','but','in','on','at','to','for','of','by','with','from',
  'is','are','was','were','be','been','have','has','had','do','does','did','will',
  'would','could','should','may','might','shall','can','this','that','these','those',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your',
  'his','its','our','their','what','which','who','whom','when','where','why','how',
  'all','each','every','both','few','more','most','some','any','no','not','only',
  'same','so','than','too','very','just','about','up','down','out','off','over',
  'under','again','further','then','once','here','there','also','if','because','as',
  'until','while','after','before','between','through','during','since','without',
  'within','along','among','around','behind','below','beneath','beside','beyond',
]);

function getIndexPath() {
  return path.resolve(process.env.INDEX_PATH || './data/index.json');
}

function loadIndex() {
  const indexPath = getIndexPath();
  if (fs.existsSync(indexPath)) {
    const raw = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(raw);
  }
  return { chunks: [] };
}

function saveIndex(index) {
  const indexPath = getIndexPath();
  const dir = path.dirname(indexPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

function tokenize(text) {
  return text.toLowerCase().split(/[^\wÀ-ÿ]+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function computeIdf(chunks, term) {
  const docsWithTerm = chunks.filter(c => tokenize(c.text).includes(term)).length;
  return Math.log((chunks.length + 1) / (docsWithTerm + 1)) + 1;
}

function tfidfScore(questionTokens, chunkText, idfCache) {
  const chunkTokens = tokenize(chunkText);
  const termFreq = {};
  for (const t of chunkTokens) {
    termFreq[t] = (termFreq[t] || 0) + 1;
  }
  let score = 0;
  for (const t of questionTokens) {
    const tf = (termFreq[t] || 0) / chunkTokens.length;
    const idf = idfCache[t] || 1;
    score += tf * idf;
  }
  return score;
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

  const index = { chunks: allChunks };
  saveIndex(index);
  return { count: allChunks.length, sources: docs.map(d => d.name) };
}

async function searchRelevantChunks(question, topK = 5) {
  const index = loadIndex();
  if (index.chunks.length === 0) return [];

  const questionTokens = tokenize(question);
  if (questionTokens.length === 0) return [];

  const idfCache = {};
  const allTerms = new Set();
  for (const c of index.chunks) {
    for (const t of tokenize(c.text)) allTerms.add(t);
  }
  for (const t of allTerms) {
    idfCache[t] = computeIdf(index.chunks, t);
  }

  const scored = index.chunks.map(chunk => ({
    chunk,
    score: tfidfScore(questionTokens, chunk.text, idfCache),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter(item => item.score > 0);
}

module.exports = { buildIndex, searchRelevantChunks, loadIndex };
