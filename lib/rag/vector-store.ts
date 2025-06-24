// At the very top of your script
import 'dotenv/config'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })
import { OpenAIEmbeddings } from '@langchain/openai'
import { CloudClient } from 'chromadb'
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed'

export class VectorStoreManager {
  private client: CloudClient
  private embeddings: OpenAIEmbeddings
  private collectionName = 'faq_embeddings'
  private embeddingFunction: DefaultEmbeddingFunction

  constructor() {
    // Initialize ChromaDB Cloud client with API key
    this.client = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY!,
      tenant: process.env.CHROMA_TENANT!,
      database: process.env.CHROMA_DATABASE!
    })
    this.embeddings = new OpenAIEmbeddings()
    this.embeddingFunction = new DefaultEmbeddingFunction()
  }

  async initializeCollection() {
    try {
      console.log('📚 Initializing ChromaDB Cloud collection...')
      await this.client.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction,
      })
      console.log('✅ ChromaDB Cloud collection initialized')
    } catch (error) {
      console.error('Error initializing vector collection:', error)
      throw error
    }
  }

  async addFAQEmbeddings(faqs: Array<{ question: string; answer: string }>) {
    const collection = await this.client.getCollection({
      name: this.collectionName,
      embeddingFunction: this.embeddingFunction,
    })

    console.log(`📚 Adding ${faqs.length} FAQ embeddings to ChromaDB Cloud...`)

    for (const faq of faqs) {
      const text = `${faq.question} ${faq.answer}`
      const embedding = await this.embeddings.embedQuery(text)
      
      await collection.add({
        ids: [`faq_${Date.now()}_${Math.random()}`],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{ 
          q: faq.question, 
          a: faq.answer,
          t: 'faq'
        }],
      })
    }

    console.log(`✅ Added ${faqs.length} FAQ embeddings to ChromaDB Cloud`)
  }

  async searchSimilar(query: string, limit: number = 3): Promise<string[]> {
    const collection = await this.client.getCollection({
      name: this.collectionName,
      embeddingFunction: this.embeddingFunction,
    })

    const queryEmbedding = await this.embeddings.embedQuery(query)
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    })

    return (results.documents?.[0] as string[]) || []
  }

  async getStats() {
    try {
      const collection = await this.client.getCollection({
        name: this.collectionName,
        embeddingFunction: this.embeddingFunction,
      })
      
      const info = await collection.get()
      
      return {
        documentsCount: info.ids?.length || 0,
        collectionName: this.collectionName,
        tenant: process.env.CHROMA_TENANT,
        database: process.env.CHROMA_DATABASE
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        documentsCount: 0,
        collectionName: this.collectionName,
        error: (error as Error).message
      }
    }
  }
}