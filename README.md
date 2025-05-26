# Updated Blackbox AI Chat API Proxy (Reverse-Engineered)

This Express.js server acts as a proxy to interact with the Blackbox AI chat service via reverse-engineered endpoints. It provides advanced customization options including custom system prompts, image generation mode, web search integration, chat history with context, and support for multiple AI models.

**⚠️ Warning**: This is an unofficial, reverse-engineered implementation. Use at your own discretion and ensure compliance with Blackbox AI's terms of service and applicable laws.

## Features

- **Custom System Prompts**: Tailor AI behavior with specific instructions
- **Image Generation Mode**: Toggle image generation capabilities
- **Web Search Mode**: Enable web search for enriched responses
- **Chat History**: Maintain conversation context with message history
- **Multiple AI Models**: Access various scraped model endpoints
- **Custom Chat ID**: Assign unique conversation identifiers
- **Response Time Tracking**: Measure API latency
- **Robust Error Handling**: Comprehensive error management

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- Knowledge of Blackbox AI's scraped API endpoints

## Installation

1. Clone the repository:
```bash
git clone https://github.com/notsopreety/blackbox-api-v2
cd blackbox-api-v2
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file:
```
PORT=3000
# Add custom headers or cookies if required
```

## Usage

1. Start the server:
```bash
npm start
```

2. API available at `http://localhost:3000` (or your configured PORT).

## Docker Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t blackbox-api-v2 .
```

2. Run the container:
```bash
docker run -p 3000:3000 -d --name blackbox-api blackbox-api-v2
```

### Using Docker Compose

1. Run the application with Docker Compose:
```bash
docker-compose up -d
```

2. To stop the application:
```bash
docker-compose down
```

### Cloud Deployment

The Docker configuration is compatible with most cloud platforms that support Docker containers:

- **AWS ECS/Fargate**: Upload the image to ECR and deploy as a service
- **Google Cloud Run**: Upload the image to GCR and deploy as a serverless container
- **Azure Container Apps**: Upload the image to ACR and deploy as a container app
- **DigitalOcean App Platform**: Connect your repository with the Dockerfile
- **Heroku**: Use the Heroku Container Registry to deploy

### Environment Variables

When deploying to cloud environments, you may need to configure these environment variables:
- `PORT`: The port on which the API will run (default: 3000)

### API Endpoint

**POST /api/chat**

#### Request Body Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `messages` | Array | **Yes** | N/A | Array of message objects with `role` (user/assistant) and `content`. Must contain at least one message. |
| `modelId` | String | **Yes** | N/A | ID of the AI model endpoint to use. Must match a supported model. |
| `userSystemPrompt` | String | No | `null` | Custom prompt to define AI behavior. If null, uses default AI behavior. |
| `webSearchModePrompt` | Boolean | No | `false` | Enable/disable web search integration. |
| `imageGenerationMode` | Boolean | No | `false` | Enable/disable image generation. |
| `chatId` | String | No | `"SamirXYZ"` | Custom identifier for the chat session. |

#### Required Data
The API requires specific data to function correctly:
- **`messages`**: 
  - Must be an array
  - Each object must have:
    - `role`: String ("user" or "assistant")
    - `content`: String (message text)
  - Minimum one message required
  - Example: `[{"role": "user", "content": "Hello"}]`
- **`modelId`**:
  - Must be a string
  - Must match one of the supported model IDs (see table below)
  - Case-sensitive
  - Example: `"deepseek-chat"`

Failure to provide these required fields will result in an error response.

#### Supported Models (Scraped)
| Model ID | Display Name |
|----------|--------------|
| `meta-llama/Llama-3.3-70B-Instruct-Turbo` | Meta-Llama-3.3-70B-Instruct-Turbo |
| `deepseek-chat` | DeepSeek-V3 |
| `deepseek-reasoner` | DeepSeek-R1 |
| `deepseek-ai/deepseek-llm-67b-chat` | DeepSeek-LLM-Chat-(67B) |

#### Example Requests

##### Minimal Required Request
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about space travel"
    }
  ],
  "modelId": "deepseek-chat"
}
```
- Meets minimum requirements
- Uses defaults: `userSystemPrompt: null`, `webSearchModePrompt: false`, `imageGenerationMode: false`, `chatId: "SamirXYZ"`

##### Chat with History
```json
{
  "messages": [
    {
      "content": "hey im samir",
      "role": "user"
    },
    {
      "content": "Hey Samir! I'm Nova. How can I assist you today?",
      "role": "assistant"
    },
    {
      "content": "what did you say to my first response",
      "role": "user"
    }
  ],
  "modelId": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "chatId": "pVwOVmZ",
  "userSystemPrompt": "your name is nova",
  "webSearchModePrompt": true,
  "imageGenerationMode": false
}
```
- Shows required `messages` with history
- Includes optional parameters

##### Full Featured Request
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Design a futuristic city"
    }
  ],
  "modelId": "deepseek-reasoner",
  "chatId": "CityDesign001",
  "userSystemPrompt": "You are an urban planning AI with creative vision",
  "webSearchModePrompt": true,
  "imageGenerationMode": true
}
```
- Uses all features with required data

#### Response Format

##### Success Response (Chat History Example)
```json
{
  "status": "success",
  "response": "Hey Samir! To your first message, I said: 'Hey Samir! I'm Nova. How can I assist you today?'",
  "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "id": "pVwOVmZ",
  "responseTime": 1.3,
  "history": [
    {
      "content": "hey im samir",
      "role": "user"
    },
    {
      "content": "Hey Samir! I'm Nova. How can I assist you today?",
      "role": "assistant"
    },
    {
      "content": "what did you say to my first response",
      "role": "user"
    },
    {
      "content": "Hey Samir! To your first message, I said: 'Hey Samir! I'm Nova. How can I assist you today?'",
      "role": "assistant"
    }
  ]
}
```

##### Error Response (Missing Required Data)
```json
{
  "status": "error",
  "response": null,
  "model": "Unknown Model",
  "id": "SamirXYZ",
  "responseTime": 0,
  "history": [],
  "error": {
    "message": "Messages array is required",
    "details": null
  }
}
```

## Advanced Features

### Custom System Prompts
- **Default**: `null` (standard AI behavior)
- **Usage**: String, e.g., "your name is nova"
- **Purpose**: Defines AI personality/response style

### Image Generation Mode
- **Default**: `false`
- **Usage**: `imageGenerationMode: true`
- **Purpose**: Enables image-related responses (scraped API dependent)

### Web Search Mode
- **Default**: `false`
- **Usage**: `webSearchModePrompt: true`
- **Purpose**: Adds web data to responses

### Chat History
- **Required**: At least one message in `messages`
- **Usage**: Include prior messages for context
- **Purpose**: Enables multi-turn conversations

### Custom Chat ID
- **Default**: `"SamirXYZ"`
- **Usage**: Any string, e.g., "pVwOVmZ"
- **Purpose**: Tracks conversation threads

## Configuration

Modify these in the code:
- `DEFAULT_SYSTEM_PROMPT`: `null`
- `MAX_TOKENS`: `1024` (response length)
- `VALIDATION_TOKEN`: Scraped API token
- `API_ENDPOINT`: Reverse-engineered endpoint
- `MODEL_CONFIG`: Model mappings

## Security Considerations

- 10MB body size limit
- Uses scraped headers/cookies
- Add authentication/rate limiting for production
- Use HTTPS in production

## Development

Run locally:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push branch (`git push origin feature/improvement`)
5. Open Pull Request

## Legal Disclaimer

This reverse-engineered Blackbox AI API implementation is for educational/research purposes only. Not affiliated with Blackbox AI. Usage may:
- Violate terms of service
- Change unexpectedly
- Require authorization

Use responsibly and comply with all laws/terms. Maintainers are not liable for consequences.

## License

[MIT License](LICENSE)

## Author

**Samir Thakuri**

- GitHub: [notsopreety](https://github.com/notsopreety)
- Email: itssamir444@gmail.com

Feel free to reach out for any queries or collaboration opportunities!

## Support

If you encounter any issues or have questions, please:
1. Check the [issues page](https://github.com/notsopreety/blackbox-api-v2/issues)
2. Create a new issue if needed
3. Provide detailed information about the problem