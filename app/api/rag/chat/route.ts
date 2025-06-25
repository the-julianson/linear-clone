import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/dal'
import { verifyJWT } from '@/lib/auth'
import { ChatService } from '@/lib/rag/chat-service'
import { nanoid } from 'nanoid'
import { VectorStoreManager } from '@/lib/rag/vector-store'

// Only import RAG dependencies in API routes to avoid bundling in server components
let chatService: ChatService | null = null;
let vectorStore: VectorStoreManager | null = null

console.log('--- /api/rag/chat route file loaded ---');


async function getRAGServices() {
  if (!chatService || !vectorStore) {
    // Dynamic imports to avoid bundling in server components
    const { ChatService } = await import('@/lib/rag/chat-service')
    const { VectorStoreManager } = await import('@/lib/rag/vector-store')
    
    chatService = new ChatService()
    vectorStore = new VectorStoreManager()
  }
  return { chatService, vectorStore }
}

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

  // Return null for unauthenticated users (public access)
  console.log('Authentication failed, returning null')
  return null
}

export async function POST(request: NextRequest) {
  console.log('--- /api/rag/chat route POST function called ---');
  try {
    const user = await authenticateRequest(request);
    console.log('API route user:', user);
    if (!user) {
      console.log('API route: Unauthorized - user is null');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, sessionId, llmProvider } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { chatService } = await getRAGServices();
    // Always ensure a sessionId is present
    const sid = sessionId || conversationId || nanoid();
    const response = await (chatService as ChatService).processFAQQuestion(
      message,
      user.id,
      sid,
      llmProvider || 'openai'
    );

    return NextResponse.json({
      response,
      sessionId: sid,
      authenticated: true,
    });
  } catch (error) {
    console.error('RAG Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { vectorStore } = await getRAGServices()
    const stats = await (vectorStore as VectorStoreManager).getStats()
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('RAG Stats API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get RAG stats' },
      { status: 500 }
    )
  }
} 