import { ingestFAQContent } from '@/app/actions/rag'

async function initializeRAG() {
  console.log('Initializing RAG system...')
  
  try {
    const result = await ingestFAQContent()
    
    if (result.success) {
      console.log('✅ RAG system initialized successfully!')
    } else {
      console.error('❌ Failed to initialize RAG system:', result.error)
    }
  } catch (error) {
    console.error('❌ Error during RAG initialization:', error)
  }
}

initializeRAG()
