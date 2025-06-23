'use server'

import { ChatService } from '@/lib/rag/chat-service'
import { VectorStoreManager } from '@/lib/rag/vector-store'
import { getCurrentUser } from '@/lib/dal'
import { db } from '@/db'
import { chatSessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { LLMProvider } from '@/lib/rag/llm-providers'

const chatService = new ChatService()
const vectorStore = new VectorStoreManager()

export async function handleFAQChat(
  question: string,
  sessionId: string,
  llmProvider: string = 'openai'
) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    // Validate session
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId))
      .where(eq(chatSessions.userId, user.id))

    if (session.length === 0) {
      throw new Error('Invalid session')
    }

    // Process question
    const result = await chatService.processFAQQuestion(
      question,
      user.id,
      sessionId,
      llmProvider as LLMProvider
    )

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function createChatSession() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const sessionId = nanoid()
    
    await db.insert(chatSessions).values({
      userId: user.id,
      sessionId,
    })

    return {
      success: true,
      sessionId,
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function ingestFAQContent() {
  try {
    // Initialize vector store
    await vectorStore.initializeCollection()

    // Define FAQ content (from existing FAQ page)
    const faqContent = [
      {
        question: "What is Linear Clone?",
        answer: "Linear Clone is a project management tool inspired by Linear. It helps teams organize, track, and manage their projects and issues in a simple and efficient way."
      },
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button in the top navigation bar. You'll need to provide an email address and create a password."
      },
      {
        question: "Is it free to use?",
        answer: "Yes, Linear Clone is completely free to use as it's an open-source project. You can even download the source code and host it yourself."
      },
      {
        question: "Can I contribute to the project?",
        answer: "Absolutely! Linear Clone is open-source and contributions are welcome. Check out our GitHub repository to get started."
      },
      {
        question: "How do I report bugs or request features?",
        answer: "You can report bugs or request features by opening an issue on our GitHub repository. We appreciate your feedback and contributions!"
      },
      {
        question: "What technologies does Linear Clone use?",
        answer: "Linear Clone is built with Next.js, TypeScript, Tailwind CSS, and uses a PostgreSQL database. It leverages the latest features of Next.js App Router for optimal performance."
      }
    ]

    // Add embeddings to vector store
    await vectorStore.addFAQEmbeddings(faqContent)

    return {
      success: true,
      message: 'FAQ content ingested successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}