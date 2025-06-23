import { ChromaClient } from 'chromadb'
import { OpenAIEmbeddings } from '@langchain/openai'

export class VectorStoreManager {
  private client: ChromaClient
  private embeddings: OpenAIEmbeddings
  private collectionName = 'faq_embeddings'

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_DB_PATH || './chroma_db',
    })
    this.embeddings = new OpenAIEmbeddings()
  }

  async initializeCollection() {
    try {
      await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'FAQ embeddings for RAG system' },
      })
    } catch (error) {
      console.error('Error initializing vector collection:', error)
    }
  }

  async addFAQEmbeddings(faqs: Array<{ question: string; answer: string }>) {
    const collection = await this.client.getCollection({
      name: this.collectionName,
    })

    for (const faq of faqs) {
      const text = `${faq.question} ${faq.answer}`
      const embedding = await this.embeddings.embedQuery(text)
      
      await collection.add({
        ids: [`faq_${Date.now()}_${Math.random()}`],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{ question: faq.question, answer: faq.answer }],
      })
    }
  }

  async searchSimilar(query: string, limit: number = 3) {
    const collection = await this.client.getCollection({
      name: this.collectionName,
    })

    const queryEmbedding = await this.embeddings.embedQuery(query)
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    })

    return results.documents?.[0] || []
  }
}