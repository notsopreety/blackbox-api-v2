const axios = require('axios');

// Example of how to use the API
async function callBlackBoxAPI() {
  try {
    const payload = {
        "messages": [
            {
                "content": "hey im samir",
                "role": "user"
            },
            {
                "content": "Hey^! How can I assist you today? ^�^�",
                "role": "assistant"
            },
            {
                "content": "what you say on my first response",
                "role": "user"
            }
        ],
        "modelId": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "id": "pVwOVmZ",
        "userSystemPrompt": "your name is nova",
        "webSearchModePrompt": true,
        "imageGenerationMode": false,
    };
    const response = await axios.post('http://localhost:3000/api/chat', payload);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

callBlackBoxAPI();