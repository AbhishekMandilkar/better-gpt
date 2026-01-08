# Chat Flow Implementation Guide

This guide documents the implementation of the chat message flow, covering database schema, server-side fetching, and client-side rendering.

## 1. Database Schema

The chat system uses a PostgreSQL database with Drizzle ORM. The core table for storing messages is `Message_v2`.

**File:** `lib/db/schema.ts`

```typescript
import { pgTable, uuid, varchar, json, timestamp } from "drizzle-orm/pg-core";

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id), // Assumes a 'chat' table exists
  role: varchar("role").notNull(), // 'user' | 'assistant'
  parts: json("parts").notNull(), // Stores the content/attachments
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;
```

## 2. Server-Side Data Fetching

Messages are fetched on the server side (in a Server Component) before being passed to the client. This avoids a separate loading state for initial messages on the client.

### 2.1 Database Query

Create a query function to fetch all messages for a specific chat ID, ordered by creation time.

**File:** `lib/db/queries.ts`

```typescript
import { db } from "./drizzle"; // Your drizzle instance
import { message } from "./schema";
import { eq, asc } from "drizzle-orm";

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages:", error);
    return [];
  }
}
```

### 2.2 Data Conversion Utility

The Vercel AI SDK expects messages in a specific format (`ChatMessage` / `UIMessage`). We need a utility to convert the raw database records into this format.

**File:** `lib/utils.ts`

```typescript
import { formatISO } from 'date-fns';
import { DBMessage } from './db/schema';
import { ChatMessage } from './types'; // Your local type definition extending AI SDK types

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant',
    parts: message.parts,
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}
```

## 3. Page Implementation (Server Component)

The page component orchestrates the fetching and rendering. It verifies the user's session and fetching the chat data.

**File:** `app/(chat)/chat/[id]/page.tsx`

```typescript
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth"; // Your auth helper
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Verify Chat Exists
  const chat = await getChatById({ id });
  if (!chat) notFound();

  // 2. Verify Auth (Access Control)
  const session = await auth();
  if (chat.visibility === "private" && session?.user?.id !== chat.userId) {
    return notFound();
  }

  // 3. Fetch Messages
  const messagesFromDb = await getMessagesByChatId({ id });
  
  // 4. Convert to UI Format
  const uiMessages = convertToUIMessages(messagesFromDb);

  // 5. Render Client Component
  return (
    <Chat
      id={chat.id}
      initialMessages={uiMessages}
      isReadonly={session?.user?.id !== chat.userId}
    />
  );
}
```

## 4. Client Component Implementation

The `Chat` component receives the `initialMessages` and initializes the `useChat` hook. This ensures the chat history is immediately available without a second round-trip.

**File:** `components/chat.tsx`

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "@/lib/types";

interface ChatProps {
  id: string;
  initialMessages: ChatMessage[];
  isReadonly: boolean;
}

export function Chat({ id, initialMessages, isReadonly }: ChatProps) {
  // Initialize useChat with data from the server
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id,
    api: "/api/chat",
    initialMessages, // <--- Key: Hydrates the chat with server data
    body: { id },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map(m => (
          <div key={m.id}>
            <strong>{m.role}:</strong>
            {/* Render message parts here */}
            {m.content} 
          </div>
        ))}
      </div>
      
      {!isReadonly && (
        <form onSubmit={handleSubmit}>
          <input 
            value={input} 
            onChange={handleInputChange} 
            placeholder="Say something..."
          />
        </form>
      )}
    </div>
  );
}
```

## Summary of Flow

1.  **Request**: User visits `/chat/[id]`.
2.  **Server**: `ChatPage` runs on the server.
3.  **DB**: `getMessagesByChatId` fetches all messages for the chat.
4.  **Transform**: `convertToUIMessages` formats the data for the UI.
5.  **Render**: `ChatPage` renders the `<Chat>` component, passing `initialMessages`.
6.  **Hydrate**: `<Chat>` initializes `useChat` with the prop.
7.  **Interaction**: New messages are handled by `useChat` via `/api/chat`.
