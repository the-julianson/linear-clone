import { LLMProviderFactory, type LLMProvider } from './llm-providers'
import { VectorStoreManager } from './vector-store'
import { db } from '@/db'
import { chatMessages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { configureLangSmith, createRunName } from './langsmith-config'

interface ChatHistoryMessage {
  id: number
  sessionId: string
  role: string
  content: string
  createdAt: Date
}

export class ChatService {
  private vectorStore: VectorStoreManager

  constructor() {
    this.vectorStore = new VectorStoreManager()
    // Configure LangSmith on service initialization
    configureLangSmith()
  }

  async processFAQQuestion(
    question: string,
    userId: string,
    sessionId: string,
    llmProvider: LLMProvider = 'openai'
  ) {
    const runName = createRunName('faq-question', `${llmProvider}-${sessionId}`)
    
    try {
      console.log(`[${runName}] Processing FAQ question: ${question.substring(0, 50)}...`)
      
      // 1. Search for relevant FAQ content
      const relevantFAQs = await this.vectorStore.searchSimilar(question, 3)
      console.log(`[${runName}] Found ${relevantFAQs.length} relevant FAQs`)
      
      // 2. Get conversation history
      const history = await this.getConversationHistory(sessionId)
      console.log(`[${runName}] Retrieved ${history.length} conversation messages`)
      
      // 3. Create context prompt
      const context = this.buildContext(relevantFAQs, history)
      
      // 4. Generate response with LLM
      const llm = LLMProviderFactory.createProvider(llmProvider)
      const messages = [
        new SystemMessage(`You are a helpful assistant for the Linear Clone FAQ system. 
          Answer questions based on the provided FAQ content. If the question 
          cannot be answered from the FAQ content, say so politely.`),
        new HumanMessage(context + '\n\nUser Question: ' + question),
      ]
      
      console.log(`[${runName}] Generating response with ${llmProvider}...`)
      const response = await llm.invoke(messages)
      console.log(`[${runName}] Response generated successfully`)

      // 5. Save conversation
      await this.saveMessage(sessionId, 'user', question)
      await this.saveMessage(sessionId, 'assistant', response.content as string)

      return {
        answer: response.content,
        relevantFAQs: relevantFAQs,
      }
    } catch (error) {
      console.error(`[${runName}] Error processing FAQ question:`, error)
      throw new Error('Failed to process your question. Please try again.')
    }
  }

  private async getConversationHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)
      .limit(10)

    return messages
  }

  private buildContext(relevantFAQs: string[], history: ChatHistoryMessage[]): string {
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