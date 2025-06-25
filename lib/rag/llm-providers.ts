// All LLM providers are loaded dynamically to avoid static bundle bloat

export async function getLLMProvider(provider: string): Promise<any> {
  if (provider === 'openai') {
    const { ChatOpenAI } = await import('@langchain/openai')
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    })
  } else if (provider === 'anthropic') {
    const { ChatAnthropic } = await import('@langchain/anthropic')
    return new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-sonnet-20240229',
      temperature: 0.7,
    })
  } else if (provider === 'google') {
    const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai')
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-pro',
      temperature: 0.7,
    })
  } else {
    const { ChatOpenAI } = await import('@langchain/openai')
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    })
  }
}