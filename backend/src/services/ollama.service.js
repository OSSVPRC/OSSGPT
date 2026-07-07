const axios = require('axios');

function getBaseUrl() {
  return process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
}

function getChatModel() {
  return process.env.OLLAMA_CHAT_MODEL || 'llama3.2';
}

function getEmbedModel() {
  return process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
}

async function chat(messages) {
  const url = `${getBaseUrl()}/api/chat`;
  const payload = {
    model: getChatModel(),
    messages,
    stream: false,
  };
  const response = await axios.post(url, payload);
  return response.data;
}

async function embed(input) {
  const url = `${getBaseUrl()}/api/embed`;
  const payload = {
    model: getEmbedModel(),
    input,
  };
  const response = await axios.post(url, payload);
  return response.data;
}

async function checkHealth() {
  const url = `${getBaseUrl()}/api/tags`;
  const response = await axios.get(url);
  return response.data;
}

module.exports = { chat, embed, checkHealth };
