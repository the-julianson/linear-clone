import { db } from '@/db'
import { issues } from '@/db/schema'
// import { getCurrentUser } from '@/lib/dal'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  try {
    const issues = await db.query.issues.findMany({})
    return NextResponse.json({ data: { issues } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Some error' }, { status: 400 })
  }
}

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // TODO need to get the user from the request
    const data = await req.json()
    console.log(data)
    const [newIssue] = await db.insert(issues).values(data).returning()

    return NextResponse.json({ data: newIssue })
  } catch (error) {
    console.error('Some error: ', error)
    return NextResponse.json(
      { error: 'Error creating an Issue' },
      { status: 400 }
    )
  }
}
