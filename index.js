const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));

// Constants
const DEFAULT_SYSTEM_PROMPT = null;
const MAX_TOKENS = 1024;
const VALIDATION_TOKEN = "00f37b34-a166-4efb-bce5-1312d87f2f94";
const API_ENDPOINT = 'https://www.blackbox.ai/api/chat';

// Model configuration
const MODEL_CONFIG = {
  "meta-llama/Llama-3.3-70B-Instruct-Turbo": {
    id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    name: "Meta-Llama-3.3-70B-Instruct-Turbo"
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek-V3"
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek-R1"
  },
  "deepseek-ai/deepseek-llm-67b-chat": {
    id: "deepseek-ai/deepseek-llm-67b-chat",
    name: "DeepSeek-LLM-Chat-(67B)"
  }
};

// Utility functions
const formatAgentMode = (modelId) => {
  if (!modelId) {
    throw new Error('Model ID is required');
  }

  return MODEL_CONFIG[modelId] || {
    mode: true,
    id: modelId,
    name: modelId.split('/').pop()
  };
};

const createAxiosConfig = (data, req) => ({
  method: 'post',
  maxBodyLength: Infinity,
  url: API_ENDPOINT,
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,fr;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://www.blackbox.ai',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://www.blackbox.ai/',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Cookie': req.headers.cookie || 'render_app_version_affinity=dep-cv573bt6l47c73d189jg; sessionId=83779b55-8805-4fe4-95b8-ad93e117dbeb'
  },
  data: JSON.stringify(data)
});

const extractAIResponse = (responseData) => {
  if (!responseData) return "No response data received";
  
  if (typeof responseData === 'string') return responseData;
  if (responseData.response) return responseData.response;
  if (responseData.generations?.length > 0) return responseData.generations[0].text;
  if (responseData.choices?.length > 0) return responseData.choices[0].message.content;
  if (responseData.text) return responseData.text;
  
  return "Response received but in an unexpected format";
};

// Main API endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Input validation
    const { messages, modelId, userSystemPrompt, webSearchModePrompt, imageGenerationMode, chatId } = req.body;
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    const agentMode = formatAgentMode(modelId);
    const requestData = {
      messages,
      agentMode,
      id: chatId || "SamirXYZ",
      trendingAgentMode: {},
      userSystemPrompt: userSystemPrompt || DEFAULT_SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      isMemoryEnabled: true,
      webSearchModePrompt: webSearchModePrompt || false,
      imageGenerationMode: imageGenerationMode || false,
      validated: VALIDATION_TOKEN
    };

    const response = await axios.request(createAxiosConfig(requestData, req));
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const aiResponse = extractAIResponse(response.data);

    const updatedHistory = [...messages, {
      content: aiResponse,
      role: "assistant"
    }];

    res.json({
      status: "success",
      response: aiResponse,
      model: modelId,
      id: requestData.id,
      responseTime: parseFloat(responseTime),
      history: updatedHistory
    });
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }

    res.status(500).json({
      status: "error",
      response: null,
      model: req.body.modelId || "Unknown Model",
      id: req.body.id || "Id",
      responseTime: 0,
      history: req.body.messages || [],
      error: {
        message: error.message,
        details: error.response?.data || null
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;