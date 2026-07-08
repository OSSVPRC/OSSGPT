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
    max_tokens: 200,
    stream: false,
    thinking: { type: 'disabled' },
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

async function chatStream(messages, onToken) {
  const url = `${getBaseUrl()}/chat/completions`;
  const payload = {
    model: getChatModel(),
    messages,
    max_tokens: 200,
    stream: true,
    thinking: { type: 'disabled' },
  };
  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    responseType: 'stream',
    timeout: 60000,
  });

  let buffer = '';

  for await (const chunk of response.data) {
    buffer += Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) onToken(token);
        } catch { /* skip malformed */ }
      }
    }
  }
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

module.exports = { chat, chatStream, checkHealth, getChatModel };
