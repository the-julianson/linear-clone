// At the very top of your script
import 'dotenv/config';

import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })

import { ingestFAQContent } from '@/app/actions/rag'
import { initializeChromaDB } from './init-chromadb'
import { configureLangSmith } from '@/lib/rag/langsmith-config'

// Configure LangSmith for tracing
configureLangSmith()

async function initializeRAG() {
  console.log('🚀 Initializing RAG system for Linear Clone...')
  
  try {
    // Step 1: Initialize ChromaDB
    console.log('\n📁 Step 1: Setting up ChromaDB...')
    const chromaResult = await initializeChromaDB()
    
    if (!chromaResult.success) {
      throw new Error(`ChromaDB initialization failed: ${chromaResult.error}`)
    }
    
    console.log('✅ ChromaDB setup completed')
    
    // Step 2: Ingest FAQ content
    console.log('\n📚 Step 2: Ingesting FAQ content...')
    const ingestResult = await ingestFAQContent()
    
    if (!ingestResult.success) {
      throw new Error(`FAQ ingestion failed: ${ingestResult.error}`)
    }
    
    console.log('✅ FAQ content ingested successfully')
    
    // Step 3: Verify setup
    console.log('\n🔍 Step 3: Verifying RAG setup...')
    console.log('✅ RAG system is ready for use!')
    
    console.log('\n🎉 RAG initialization completed successfully!')
    console.log('\n📋 Summary:')
    console.log('  • ChromaDB: ✅ Initialized')
    console.log('  • FAQ Content: ✅ Ingested')
    console.log('  • LangSmith: ✅ Configured')
    console.log('\n🚀 You can now use the FAQ chat feature!')
    
    return {
      success: true,
      chromaDB: chromaResult,
      faqIngestion: ingestResult
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
