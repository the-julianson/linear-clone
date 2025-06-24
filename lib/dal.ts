import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'
// import { mockDelay } from './utils'
import { unstable_cacheTag as cacheTag } from 'next/cache'

export const getCurrentUser = cache(async () => {
  console.count('Getting the current user')
  const session = await getSession()
  if (!session) return null

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    return result[0] || null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
})

export const getUserByEmail = async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getIssues() {
  try {
    const result = await db.query.issues.findMany({
      with: {
        user: true,
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })

    return result
  } catch (error) {
    console.error('Error fetching issues: ', error)
    throw new Error('Failed to fetch issues')
  }
}

export async function getIssue(id: number) {
  try {
    const result = await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        user: true,
      },
    })

    return result
  } catch (e) {
    console.error('Error fetching issue: ', e)
    return null
  }
}
