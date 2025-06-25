import 'dotenv/config'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') })

export class VectorStoreManager {
  private client: any = null
  private embeddings: any = null
  private collectionName = 'faq_embeddings'
  private embeddingFunction: any = null

  constructor() {
    // Lazy init
  }

  private async initializeDependencies() {
    if (!this.client) {
      // Dynamic import heavy deps
      const { CloudClient } = await import('chromadb')
      const { OpenAIEmbeddings } = await import('@langchain/openai')
      const { DefaultEmbeddingFunction } = await import('@chroma-core/default-embed')
      this.client = new CloudClient({
        apiKey: process.env.CHROMA_API_KEY!,
        tenant: process.env.CHROMA_TENANT!,
        database: process.env.CHROMA_DATABASE!
      })
      this.embeddings = new OpenAIEmbeddings()
      this.embeddingFunction = new DefaultEmbeddingFunction()
    }
  }

  async initializeCollection() {
    await this.initializeDependencies()
    await this.client.getOrCreateCollection({
      name: this.collectionName,
      embeddingFunction: this.embeddingFunction,
    })
  }

  async addFAQEmbeddings(faqs: Array<{ question: string; answer: string }>) {
    await this.initializeDependencies()
    const collection = await this.client.getCollection({
      name: this.collectionName,
      embeddingFunction: this.embeddingFunction,
    })
    for (const faq of faqs) {
      const text = `${faq.question} ${faq.answer}`
      const embedding = await this.embeddings.embedQuery(text)
      await collection.add({
        ids: [`faq_${Date.now()}_${Math.random()}`],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{ q: faq.question, a: faq.answer, t: 'faq' }],
      })
    }
  }

  async searchSimilar(query: string, limit: number = 3): Promise<string[]> {
    await this.initializeDependencies()
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
    await this.initializeDependencies()
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
  }
}