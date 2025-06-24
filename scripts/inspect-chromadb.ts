import 'dotenv/config'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })

import { CloudClient } from 'chromadb'
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed'
import { configureLangSmith } from '@/lib/rag/langsmith-config'

console.log('CHROMA_API_KEY:', process.env.CHROMA_API_KEY);

// Configure LangSmith for tracing
configureLangSmith()

async function inspectChromaDB() {
  console.log('🔍 Inspecting ChromaDB Cloud...')
  
  try {
    // Check if environment variables are set
    if (!process.env.CHROMA_API_KEY) {
      console.log('❌ CHROMA_API_KEY not set in environment variables')
      console.log('💡 Add your ChromaDB Cloud API key to .env file')
      return
    }

    if (!process.env.CHROMA_TENANT) {
      console.log('❌ CHROMA_TENANT not set in environment variables')
      console.log('💡 Add your ChromaDB Cloud tenant ID to .env file')
      return
    }

    if (!process.env.CHROMA_DATABASE) {
      console.log('❌ CHROMA_DATABASE not set in environment variables')
      console.log('💡 Add your ChromaDB Cloud database name to .env file')
      return
    }
    
    console.log(`🔑 ChromaDB Cloud Configuration:`)
    console.log(`  • Tenant: ${process.env.CHROMA_TENANT}`)
    console.log(`  • Database: ${process.env.CHROMA_DATABASE}`)
    console.log(`  • API Key: ${process.env.CHROMA_API_KEY.substring(0, 8)}...`)
    
    // Initialize ChromaDB Cloud client
    const client = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY!,
      tenant: process.env.CHROMA_TENANT!,
      database: process.env.CHROMA_DATABASE!
    })
    const embeddingFunction = new DefaultEmbeddingFunction()
    
    // Get collection info
    const collectionName = 'faq_embeddings'
    console.log(`\n📚 Collection: ${collectionName}`)
    
    try {
      const collection = await client.getCollection({ 
        name: collectionName,
        embeddingFunction: embeddingFunction
      })
      const info = await collection.get()
      
      console.log(`  • Documents: ${info.ids?.length || 0}`)
      console.log(`  • Embeddings: ${info.embeddings?.length || 0}`)
      console.log(`  • Metadatas: ${info.metadatas?.length || 0}`)
      
      if (info.metadatas && info.metadatas.length > 0) {
        console.log('\n📄 Sample FAQ entries:')
        info.metadatas.slice(0, 3).forEach((metadata, index) => {
          if (metadata && typeof metadata === 'object') {
            const question = metadata.q as string
            const answer = metadata.a as string
            console.log(`  ${index + 1}. Question: ${question}`)
            console.log(`     Answer: ${answer?.substring(0, 100)}...`)
          }
        })
      }
      
      // Show collection metadata
      if (info.metadatas && info.metadatas.length > 0) {
        console.log('\n🏷️ Collection metadata:')
        const firstMetadata = info.metadatas[0]
        if (firstMetadata && typeof firstMetadata === 'object') {
          Object.entries(firstMetadata).forEach(([key, value]) => {
            console.log(`  • ${key}: ${value}`)
          })
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Collection not found or error: ${(error as Error).message}`)
      console.log('💡 Run "npm run init-rag" to create the collection')
    }
    
    console.log('\n✅ ChromaDB Cloud inspection completed!')
    
  } catch (error) {
    console.error('❌ Error inspecting ChromaDB Cloud:', error)
    console.log('\n💡 Make sure you have:')
    console.log('  1. Set CHROMA_API_KEY in your .env file')
    console.log('  2. Set CHROMA_TENANT in your .env file')
    console.log('  3. Set CHROMA_DATABASE in your .env file')
    console.log('  4. Run "npm run init-rag" to initialize the collection')
  }
}

// Run the inspection
if (require.main === module) {
  inspectChromaDB()
    .then(() => {
      console.log('\n🎉 Inspection complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Inspection failed:', error)
      process.exit(1)
    })
}

export { inspectChromaDB } 