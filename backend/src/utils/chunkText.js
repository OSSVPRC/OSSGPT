function chunkText(text, maxTokens = 500, overlap = 50) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks = [];
  let current = [];

  for (const p of paragraphs) {
    const wordCount = p.split(/\s+/).length;
    if (wordCount > maxTokens) {
      if (current.length > 0) {
        chunks.push(current.join('\n\n'));
        current = [];
      }
      const words = p.split(/\s+/);
      for (let i = 0; i < words.length; i += maxTokens - overlap) {
        chunks.push(words.slice(i, i + maxTokens).join(' '));
      }
    } else {
      current.push(p);
      const totalWords = current.join(' ').split(/\s+/).length;
      if (totalWords >= maxTokens) {
        chunks.push(current.join('\n\n'));
        current = current.slice(-1);
      }
    }
  }
  if (current.length > 0) {
    chunks.push(current.join('\n\n'));
  }

  return chunks.map((text, i) => ({ id: `chunk-${i}`, text: text.trim() }));
}

module.exports = { chunkText };
