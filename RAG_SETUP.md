# RAG System Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL="your_database_url_here"

# Authentication
JWT_SECRET="your_jwt_secret_here"

# LLM Providers (at least one required)
OPENAI_API_KEY="your_openai_api_key_here"
GOOGLE_API_KEY="your_google_api_key_here"
ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# ChromaDB Cloud Configuration
CHROMA_API_KEY="your_chroma_api_key_here"
CHROMA_TENANT="your_tenant_id_here"
CHROMA_DATABASE="your_database_name_here"

# RAG Configuration
DEFAULT_LLM_PROVIDER="openai"
MAX_FAQ_CHUNKS=3
CHAT_HISTORY_LIMIT=10

# LangSmith Tracing (Optional but recommended)
LANGCHAIN_API_KEY="your_langsmith_api_key_here"
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
LANGCHAIN_PROJECT="linear-clone-rag"
```

## ChromaDB Cloud Setup

### 1. Create ChromaDB Cloud Account
1. Go to [ChromaDB Cloud](https://cloud.chromadb.com/)
2. Sign up for a free account
3. Create a new database
4. Note down your:
   - API Key
   - Tenant ID
   - Database Name

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

```bash
# Push database schema (includes RAG tables)
npm run db:push
```

### 4. Initialize RAG System

```bash
# This will set up ChromaDB Cloud and ingest FAQ content
npm run init-rag
```

## When to Run `init-rag`

Run the `init-rag` script in the following scenarios:

### Initial Setup
- **First time setup**: After installing dependencies and setting up environment variables
- **New deployment**: When deploying to a new environment

### Content Updates
- **FAQ content changes**: When you modify the FAQ content in the code
- **Vector database reset**: If you need to rebuild the embeddings

### Development
- **Local development**: After pulling changes that include FAQ updates
- **Testing**: When testing the RAG system with new content

### Troubleshooting
- **Vector database corruption**: If ChromaDB gets corrupted
- **Embedding issues**: If embeddings are not working correctly

## Script Execution Order

1. **First time**: `npm run db:push` → `npm run init-rag`
2. **FAQ updates**: `npm run init-rag`
3. **Schema changes**: `npm run db:push` → `npm run init-rag`

## Monitoring with LangSmith

If you have LangSmith configured, you can monitor:

- RAG query performance
- LLM response quality
- Vector search effectiveness
- Error rates and debugging

Visit [LangSmith](https://smith.langchain.com) to view traces and analytics.

## ChromaDB Cloud Management

### Inspect Your Vector Database

```bash
# Check ChromaDB Cloud status and content
npm run inspect-chromadb
```

This will show you:
- Connection status
- Number of FAQ documents
- Sample FAQ entries
- Collection metadata

### ChromaDB Cloud Dashboard

You can also manage your vector database through the [ChromaDB Cloud Dashboard](https://cloud.chromadb.com/):
- View collections
- Browse documents
- Monitor usage
- Manage embeddings

## Troubleshooting

### Common Issues

1. **ChromaDB connection errors**: 
   - Check `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE` in .env
   - Verify your ChromaDB Cloud account is active

2. **LLM API errors**: 
   - Verify API keys and rate limits
   - Check OpenAI/Google/Anthropic account status

3. **Database errors**: 
   - Ensure schema is up to date with `npm run db:push`
   - Check PostgreSQL connection

4. **Embedding failures**: 
   - Check OpenAI API key and quota
   - Verify ChromaDB Cloud embedding function

### Reset RAG System

To completely reset the RAG system:

```bash
# Clear ChromaDB Cloud collection (via dashboard or API)
# Then reinitialize
npm run init-rag
```

## Next Steps

After successful initialization:

1. Start the development server: `npm run dev`
2. Navigate to `/faq` to test the chat feature
3. Monitor LangSmith for performance insights
4. Customize FAQ content as needed
5. Monitor ChromaDB Cloud usage and performance 