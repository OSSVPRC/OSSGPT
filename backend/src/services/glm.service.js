const axios = require('axios');

function getBaseUrl() {
  return process.env.GLM_API_URL || 'https://api.z.ai/api/paas/v4';
}

function getApiKey() {
  return process.env.GLM_API_KEY || '';
}

function getChatModel() {
  return process.env.GLM_CHAT_MODEL || 'glm-4.5-flash';
}

async function chat(messages) {
  const url = `${getBaseUrl()}/chat/completions`;
  const payload = {
    model: getChatModel(),
    messages,
    max_tokens: 500,
    stream: false,
  };
  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });
  return response.data;
}

async function checkHealth() {
  const url = `${getBaseUrl()}/chat/completions`;
  const payload = {
    model: getChatModel(),
    messages: [{ role: 'user', content: 'ping' }],
    max_tokens: 1,
    stream: false,
  };
  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
    validateStatus: status => status < 500,
  });
  return response.data;
}

module.exports = { chat, checkHealth };
