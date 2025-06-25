import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/dal'
import { verifyJWT } from '@/lib/auth'

async function authenticateRequest(request: NextRequest) {
  // First try to get user from cookies (browser requests)
  console.log('Authenticating request, going here')
  try {
    const user = await getCurrentUser()
    if (user) return user
  } catch {
    console.log('Cookie authentication failed, trying Authorization header')
  }

  // Then try Authorization header (external API calls)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = await verifyJWT(token)
    if (payload?.userId) {
      // Return a minimal user object with the ID for API calls
      return { id: payload.userId, email: 'api-user' }
    }
  }
  console.log('Authentication failed, returning null')
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using both methods (optional for public FAQ)
    const user = await authenticateRequest(request)
    
    // Note: Authentication is optional for FAQ initialization (public feature)
    // This allows the system to be initialized even without authentication

    // Dynamic imports to avoid bundling in main function
    const { VectorStoreManager } = await import('@/lib/rag/vector-store')
    const vectorStore = new VectorStoreManager()

    // Initialize vector store
    await vectorStore.initializeCollection()

    // Define FAQ content
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

    return NextResponse.json({ 
      success: true,
      message: 'RAG system initialized successfully',
      documentsCount: faqContent.length,
      authenticated: !!user
    })

  } catch (error) {
    console.error('RAG Init API Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize RAG system' },
      { status: 500 }
    )
  }
} 