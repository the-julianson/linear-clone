import { InferSelectModel, relations } from 'drizzle-orm'
import { pgTable, serial, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// Enums for issue status and priority
export const statusEnum = pgEnum('status', [
  'backlog',
  'todo',
  'in_progress',
  'done',
])
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high'])

// Issues table
export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').default('backlog').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: text('user_id').notNull(),
})

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations between tables
export const issuesRelations = relations(issues, ({ one }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
}))

// Types
export type Issue = InferSelectModel<typeof issues>
export type User = InferSelectModel<typeof users>

// Status and priority labels for display
export const ISSUE_STATUS = {
  backlog: { label: 'Backlog', value: 'backlog' },
  todo: { label: 'Todo', value: 'todo' },
  in_progress: { label: 'In Progress', value: 'in_progress' },
  done: { label: 'Done', value: 'done' },
}

export const ISSUE_PRIORITY = {
  low: { label: 'Low', value: 'low' },
  medium: { label: 'Medium', value: 'medium' },
  high: { label: 'High', value: 'high' },
}

// Add new tables for RAG functionality

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const faqEmbeddings = pgTable('faq_embeddings', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  embedding: text('embedding').notNull(), // JSON string of embedding
  chunkId: text('chunk_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
