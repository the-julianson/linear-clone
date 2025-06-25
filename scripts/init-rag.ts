// At the very top of your script
import 'dotenv/config';

import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })

import { VectorStoreManager } from '@/lib/rag/vector-store'
import { configureLangSmith } from '@/lib/rag/langsmith-config'

// Configure LangSmith for tracing
configureLangSmith()

async function initializeRAG() {
  console.log('🚀 Initializing RAG system for Linear Clone...')
  
  try {
    // Step 1: Initialize Vector Store
    console.log('\n📁 Step 1: Setting up ChromaDB/Vector Store...')
    const vectorStore = new VectorStoreManager()
    await vectorStore.initializeCollection()
    console.log('✅ Vector store setup completed')
    
    // Step 2: Ingest FAQ content
    console.log('\n📚 Step 2: Ingesting FAQ content...')
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
    await vectorStore.addFAQEmbeddings(faqContent)
    console.log('✅ FAQ content ingested successfully')
    
    // Step 3: Verify setup
    console.log('\n🔍 Step 3: Verifying RAG setup...')
    const stats = await vectorStore.getStats()
    console.log('📊 Vector store stats:', stats)
    console.log('✅ RAG system is ready for use!')
    
    console.log('\n🎉 RAG initialization completed successfully!')
    console.log('\n📋 Summary:')
    console.log('  • Vector Store: ✅ Initialized')
    console.log('  • FAQ Content: ✅ Ingested')
    console.log('  • LangSmith: ✅ Configured')
    console.log('\n🚀 You can now use the FAQ chat feature!')
    
    return {
      success: true,
      stats
    }
    
  } catch (error) {
    console.error('❌ RAG initialization failed:', error)
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeRAG()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ RAG system is ready!')
        process.exit(0)
      } else {
        console.error('\n❌ RAG initialization failed')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('\n❌ Unexpected error:', error)
      process.exit(1)
    })
}

export { initializeRAG }
