// app/api/todos/route.ts
import { NextResponse } from 'next/server'

// GET request handler
export async function GET() {
  const todos = [
    { id: 1, text: 'Learn Next.js', completed: false },
    { id: 2, text: 'Build an app', completed: false },
  ]

  return NextResponse.json(todos)
}

// POST request handler
export async function POST(request: Request) {
  const data = await request.json()

  // Process the data (in a real app, you would save to a database)
  console.log('Received data:', data)

  return NextResponse.json(
    {
      message: 'Todo created successfully',
      todo: data,
    },
    { status: 201 }
  )
}
