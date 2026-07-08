const { chat } = require('./glm.service');
const { searchRelevantChunks } = require('./embedding.service');

const SYSTEM_PROMPT = `Assistant OSSGPT de l'Observatoire du Sahara et du Sahel. Réponds en français, de façon concise, sans réfléchir à voix haute. Base-toi uniquement sur le contexte fourni.`;

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

  let reply = '';
  try {
    const response = await chat(messages);
    reply = response.choices?.[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.warn('GLM chat failed, using document fallback:', err.message);
    const excerpts = relevantChunks.map(r =>
      `[${r.chunk.source}] ${r.chunk.text.slice(0, 500)}...`
    ).join('\n\n');
    reply = `Désolé, le service GLM est temporairement indisponible. Voici les passages pertinents de la base documentaire :\n\n${excerpts}`;
  }

  return {
    reply,
    sources,
  };
}

module.exports = { ask };
