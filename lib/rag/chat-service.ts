import { LLMProviderFactory, type LLMProvider } from './llm-providers'
import { VectorStoreManager } from './vector-store'
import { db } from '@/db'
import { chatMessages, chatSessions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export class ChatService {
  private vectorStore: VectorStoreManager

  constructor() {
    this.vectorStore = new VectorStoreManager()
  }

  async processFAQQuestion(
    question: string,
    userId: string,
    sessionId: string,
    llmProvider: LLMProvider = 'openai'
  ) {
    try {
      // 1. Search for relevant FAQ content
      const relevantFAQs = await this.vectorStore.searchSimilar(question, 3)
      
      // 2. Get conversation history
      const history = await this.getConversationHistory(sessionId)
      
      // 3. Create context prompt
      const context = this.buildContext(relevantFAQs, history)
      
      // 4. Generate response with LLM
      const llm = LLMProviderFactory.createProvider(llmProvider)
      const response = await llm.invoke([
        {
          role: 'system',
          content: `You are a helpful assistant for the Linear Clone FAQ system. 
          Answer questions based on the provided FAQ content. If the question 
          cannot be answered from the FAQ content, say so politely.`,
        },
        {
          role: 'user',
          content: context + '\n\nUser Question: ' + question,
        },
      ])

      // 5. Save conversation
      await this.saveMessage(sessionId, 'user', question)
      await this.saveMessage(sessionId, 'assistant', response.content)

      return {
        answer: response.content,
        relevantFAQs: relevantFAQs,
      }
    } catch (error) {
      console.error('Error processing FAQ question:', error)
      throw new Error('Failed to process your question. Please try again.')
    }
  }

  private async getConversationHistory(sessionId: string) {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)
      .limit(10)

    return messages
  }

  private buildContext(relevantFAQs: string[], history: any[]) {
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

  private async saveMessage(sessionId: string, role: string, content: string) {
    await db.insert(chatMessages).values({
      sessionId,
      role,
      content,
    })
  }
}