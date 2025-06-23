import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'

export type LLMProvider = 'openai' | 'google' | 'anthropic'

export class LLMProviderFactory {
  static createProvider(provider: LLMProvider) {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
        })
      case 'google':
        return new ChatGoogleGenerativeAI({
          model: 'gemini-pro',
          temperature: 0.7,
        })
      case 'anthropic':
        return new ChatAnthropic({
          modelName: 'claude-3-sonnet-20240229',
          temperature: 0.7,
        })
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  }
}