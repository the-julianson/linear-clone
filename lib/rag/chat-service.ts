import { db } from '@/db'
import { chatMessages } from '@/db/schema'
import { eq } from 'drizzle-orm'

export class ChatService {
  private vectorStore: any = null

  constructor() {}

  private async getVectorStore() {
    if (!this.vectorStore) {
      const { VectorStoreManager } = await import('./vector-store')
      this.vectorStore = new VectorStoreManager()
    }
    return this.vectorStore
  }

  async processFAQQuestion(
    question: string,
    userId: string,
    sessionId: string,
    llmProvider: string = 'openai'
  ) {
    // 1. Search for relevant FAQ content
    const vectorStore = await this.getVectorStore()
    const relevantFAQs = await vectorStore.searchSimilar(question, 3)
    // 2. Get conversation history
    const history = await this.getConversationHistory(sessionId)
    // 3. Create context prompt
    const context = this.buildContext(relevantFAQs, history)
    // 4. Generate response with LLM
    const llm = await this.createLLMProvider(llmProvider)
    const messages = [
      { role: 'system', content: `You are a helpful assistant for the Linear Clone FAQ system. Answer questions based on the provided FAQ content. If the question cannot be answered from the FAQ content, say so politely.` },
      { role: 'user', content: context + '\n\nUser Question: ' + question },
    ]
    const response = await llm.invoke(messages)
    // 5. Save conversation
    await this.saveMessage(sessionId, 'user', question)
    await this.saveMessage(sessionId, 'assistant', response.content as string)
    return {
      answer: response.content,
      relevantFAQs: relevantFAQs,
    }
  }

  private async createLLMProvider(provider: string) {
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
    } else {
      const { ChatOpenAI } = await import('@langchain/openai')
      return new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
      })
    }
  }

  private async getConversationHistory(sessionId: string): Promise<any[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)
      .limit(10)
    return messages
  }

  private buildContext(relevantFAQs: string[], history: any[]): string {
    let context = 'Relevant FAQ Content:\n'
    relevantFAQs.forEach((faq, index) => {
      context += `${index + 1}. ${faq}\n`
    })
    if (history.length > 0) {
      context += '\nConversation History:\n'
      history.forEach((msg) => {
        context += `${msg.role}: ${msg.content}\n`
      })
    }
    return context
  }

  private async saveMessage(sessionId: string, role: string, content: string): Promise<void> {
    await db.insert(chatMessages).values({
      sessionId,
      role,
      content,
    })
  }
}