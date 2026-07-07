const { chat } = require('./ollama.service');
const { searchRelevantChunks } = require('./embedding.service');

const SYSTEM_PROMPT = `Tu es OSSGPT, assistant institutionnel de démonstration de l'Observatoire du Sahara et du Sahel. Tu réponds en français clair et professionnel. Tu t'appuies uniquement sur le contexte fourni lorsque la question concerne les documents. Si l'information n'est pas disponible dans les documents, indique clairement que tu ne disposes pas d'éléments suffisants.`;

async function ask(question) {
  const relevantChunks = await searchRelevantChunks(question);

  let context = '';
  const sources = [];

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
    ? `Contexte documentaire :\n\n${context}\n\nQuestion : ${question}`
    : question;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  const response = await chat(messages);

  return {
    reply: response.message?.content || '',
    sources,
  };
}

module.exports = { ask };
