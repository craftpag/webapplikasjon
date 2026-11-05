import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// --- Tabeller ---

export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  provider: text("provider").notNull(), // "openai" eller "anthropic"
  createdAt: text("created_at").notNull(),
})

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  role: text("role").notNull(), // "user" eller "assistant"
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
})

// --- Tilkobling ---

const url = process.env.DATABASE_URL || "file:data.db"
const client = createClient({ url })

// Opprett tabeller hvis de ikke finnes
await client.execute(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`)

await client.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`)

export const db = drizzle(client)
