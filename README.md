# n8n-nodes-agenta

Agenta prompt management nodes for n8n workflow automation.

## Features

- **Fetch Prompt/Config**: Retrieve prompt configurations from Agenta
- **Invoke LLM**: Execute LLM calls through Agenta's completion service

## Installation

```bash
npm install n8n-nodes-agenta
```

## Usage

### 1. Fetch Prompt/Config

This node allows you to fetch prompt configurations from your Agenta instance.

**Configuration:**
- **Base URL**: Your Agenta instance URL (default: https://cloud.agenta.ai)
- **Environment**: Choose from development, staging, or production
- **Application**: Specify the application slug
- **Version**: Optional version parameter (advanced option)

### 2. Invoke LLM

This node executes LLM calls through Agenta's completion service.

**Configuration:**
- **Base URL**: Your Agenta instance URL (shared with Fetch Prompt/Config)
- **Text Input**: The text to process
- **Environment**: Choose from development, staging, or production
- **Application**: Specify the application slug

## Credentials

You need to configure Agenta API credentials:

1. Go to your n8n credentials
2. Add new "Agenta API" credential
3. Enter your API key

## API Reference

- [Agenta Documentation](https://docs.agenta.ai)
- [Agenta API Reference](https://docs.agenta.ai/api)

## License

MIT
