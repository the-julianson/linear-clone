import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })

import { CloudClient } from 'chromadb'
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed'
import { configureLangSmith } from '../lib/rag/langsmith-config'

// Configure LangSmith for tracing
configureLangSmith()

async function initializeChromaDB() {
  console.log('🚀 Initializing ChromaDB Cloud...')
  
  try {
    // Initialize ChromaDB Cloud client
    const client = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY!,
      tenant: process.env.CHROMA_TENANT!,
      database: process.env.CHROMA_DATABASE!
    })
    const embeddingFunction = new DefaultEmbeddingFunction()
    
    console.log('📁 ChromaDB Cloud client initialized')
    console.log(`🔑 Using tenant: ${process.env.CHROMA_TENANT}`)
    console.log(`🗄️ Using database: ${process.env.CHROMA_DATABASE}`)
    
    // Create or get the FAQ embeddings collection
    const collectionName = 'faq_embeddings'
    
    console.log(`📚 Creating collection: ${collectionName}`)
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: embeddingFunction,
    })
    
    console.log('✅ Collection created successfully')
    
    // Test the collection by getting its info
    const collectionInfo = await collection.get()
    console.log('📊 Collection info:', {
      name: collectionName,
      metadata: collectionInfo.metadatas,
      count: collectionInfo.ids?.length || 0
    })
    
    console.log('🎉 ChromaDB Cloud initialization completed successfully!')
    
    return {
      success: true,
      collectionName,
      collectionInfo
    }
    
  } catch (error) {
    console.error('❌ Error initializing ChromaDB Cloud:', error)
    console.log('\n💡 Make sure you have set the following environment variables:')
    console.log('  • CHROMA_API_KEY')
    console.log('  • CHROMA_TENANT')
    console.log('  • CHROMA_DATABASE')
    
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeChromaDB()
    .then((result) => {
      if (result.success) {
        console.log('✅ ChromaDB Cloud is ready for use!')
        process.exit(0)
      } else {
        console.error('❌ ChromaDB Cloud initialization failed')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error)
      process.exit(1)
    })
}

export { initializeChromaDB } 