import { Client } from 'langsmith'

// LangSmith configuration for tracing and monitoring
export function configureLangSmith() {
  // Set environment variables for LangSmith
  if (!process.env.LANGCHAIN_TRACING_V2) {
    process.env.LANGCHAIN_TRACING_V2 = 'true'
  }
  
  if (!process.env.LANGCHAIN_ENDPOINT) {
    process.env.LANGCHAIN_ENDPOINT = 'https://api.smith.langchain.com'
  }
  
  if (!process.env.LANGCHAIN_API_KEY) {
    console.warn('LANGCHAIN_API_KEY not set. LangSmith tracing will be disabled.')
    process.env.LANGCHAIN_TRACING_V2 = 'false'
  }
  
  if (!process.env.LANGCHAIN_PROJECT) {
    process.env.LANGCHAIN_PROJECT = 'linear-clone-rag'
  }
}

// Initialize LangSmith client
export function getLangSmithClient(): Client | null {
  if (!process.env.LANGCHAIN_API_KEY) {
    return null
  }
  
  try {
    return new Client({
      apiKey: process.env.LANGCHAIN_API_KEY,
    })
  } catch (error) {
    console.error('Failed to initialize LangSmith client:', error)
    return null
  }
}

// Helper function to create a run name for tracing
export function createRunName(operation: string, details?: string): string {
  const baseName = `linear-clone-rag-${operation}`
  return details ? `${baseName}-${details}` : baseName
} 