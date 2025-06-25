# Deployment Guide

## Vercel Deployment Issues and Solutions

### 1. Dynamic Server Usage Errors

**Problem**: Routes using `cookies()` were being rendered statically during build time.

**Solution**: Added `export const dynamic = 'force-dynamic'` to pages that use authentication:
- `app/issues/new/page.tsx`
- `app/dashboard/page.tsx`

### 2. Serverless Function Size Limit

**Problem**: ChromaDB and LangChain dependencies were making the function exceed Vercel's 250MB limit.

**Solution**: Moved RAG functionality to API routes only:
- Created `/api/rag/chat` for chat functionality
- Created `/api/rag/init` for system initialization
- Removed server actions (`app/actions/rag.ts`)
- Updated `FAQChatWidget` to use API routes instead of server actions

### 3. Authentication

**Dual Authentication Support**: API routes now support both authentication methods:

**Cookie-based Authentication** (Browser requests):
- Uses HTTP-only cookies with JWT tokens
- Automatic for browser-based requests
- No additional headers needed

**Authorization Header** (External API calls):
- Uses `Authorization: Bearer <jwt_token>` header
- For external API clients, scripts, or tools
- JWT token can be obtained from cookies or generated

**Getting JWT Token for API Calls**:
```javascript
// From browser (if logged in)
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('auth_token='))
  ?.split('=')[1]

// For external API calls
fetch('/api/rag/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ message: 'Hello' })
})
```

### 4. Environment Variables

Make sure these environment variables are set in Vercel:

```env
# Database
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

# ChromaDB Cloud
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database

# OpenAI (for RAG)
OPENAI_API_KEY=your_openai_api_key

# LangSmith (optional, for tracing)
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=your_langsmith_project
LANGCHAIN_TRACING_V2=true

# API Token (optional, for deployment scripts)
API_TOKEN=your_jwt_token_for_api_calls
```

### 5. Post-Deployment Setup

After deployment, initialize the RAG system:

```bash
# Option 1: Using the deployment script
npm run deploy-init

# Option 2: Manual API call with authentication
curl -X POST https://your-app.vercel.app/api/rag/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Option 3: Manual API call (if you have a valid session cookie)
curl -X POST https://your-app.vercel.app/api/rag/init \
  -H "Cookie: auth_token=YOUR_COOKIE_VALUE"
```

### 6. Database Setup

Ensure your database is properly set up:

```bash
# Push database schema
npm run db:push

# Seed initial data (if needed)
npm run seed
```

### 7. Testing the Deployment

1. **Authentication**: Test signup/signin functionality
2. **Issues**: Create, edit, and delete issues
3. **RAG Chat**: Visit `/faq` and test the chat widget
4. **API Routes**: Test `/api/rag/chat` and `/api/rag/init`

**Testing API Routes**:
```bash
# Test with browser (automatic cookie auth)
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Linear Clone?"}'

# Test with Authorization header
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "What is Linear Clone?"}'
```

### 8. Troubleshooting

**If RAG chat doesn't work**:
1. Check ChromaDB Cloud credentials
2. Verify OpenAI API key
3. Run the initialization script
4. Check Vercel function logs

**If authentication fails**:
1. Verify JWT_SECRET is set
2. Check database connection
3. Ensure DATABASE_URL is correct
4. Check if using correct authentication method (cookies vs Authorization header)

**If function size is still too large**:
1. The RAG dependencies are now only in API routes
2. Check if other dependencies are causing the issue
3. Consider using external services for heavy operations

### 9. Performance Optimization

- RAG functionality is now isolated to API routes
- Heavy dependencies are dynamically imported
- Authentication is properly handled with dynamic rendering
- Database queries are optimized with proper indexing

### 10. Security Considerations

- JWT tokens are properly secured
- API routes require authentication
- Environment variables are properly configured
- No sensitive data is exposed in client-side code
- Dual authentication support for flexibility 