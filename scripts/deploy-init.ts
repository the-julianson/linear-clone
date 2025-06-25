import 'dotenv/config'

async function getAuthToken() {
  // For deployment script, we'll need to get a token
  // This could be from environment variables or by making a login request
  try {
    // Try to get token from environment variable first
    if (process.env.API_TOKEN) {
      return process.env.API_TOKEN
    }

    // If no API token, we'll need to handle authentication differently
    // For now, we'll skip authentication for deployment script
    console.log('⚠️  No API_TOKEN found, proceeding without authentication')
    return null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

async function initializeRAGSystem() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'

  console.log('🚀 Initializing RAG system for deployment...')
  console.log(`📍 Base URL: ${baseUrl}`)

  const authToken = await getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
    console.log('🔐 Using authentication token')
  } else {
    console.log('🌐 Proceeding without authentication (public access)')
  }

  try {
    // Initialize RAG system via API
    const response = await fetch(`${baseUrl}/api/rag/init`, {
      method: 'POST',
      headers,
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ RAG system initialized successfully!')
      console.log(`📊 Documents ingested: ${result.documentsCount}`)
      console.log(`🔐 Authenticated: ${result.authenticated}`)
    } else {
      console.error('❌ Failed to initialize RAG system:', result.error)
    }
  } catch (error) {
    console.error('❌ Error initializing RAG system:', error)
  }
}

// Run initialization
initializeRAGSystem().catch(console.error) 