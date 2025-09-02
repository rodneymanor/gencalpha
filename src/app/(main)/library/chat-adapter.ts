// Chat Data Adapter
// Transforms chat conversation data to LibraryItem format for the DataTableTemplate

import { ChatConversation } from "@/components/write-chat/services/chat-service";
import { LibraryItem } from "./types";

/**
 * Transforms a ChatConversation to a LibraryItem
 * This adapter allows us to display chat history in the Library table
 */
export function chatToLibraryItem(chat: ChatConversation): LibraryItem {
  const createdDate = new Date(chat.createdAt);
  const lastMessageDate = new Date(chat.lastMessageAt);
  
  // Determine status based on chat properties
  const status: LibraryItem["status"] = chat.status === "saved" ? "published" : "draft";
  
  // Calculate a rough "size" based on message count
  // Assume average message is about 500 characters
  const estimatedSize = chat.messagesCount * 500;
  
  return {
    id: chat.id,
    title: chat.title ?? "Untitled Chat",
    description: `Chat conversation with ${chat.messagesCount} messages`,
    type: "note", // Chats are treated as notes
    category: "script", // Chats are typically used for script generation
    status,
    author: {
      id: "current-user", // In a real app, this would come from auth context
      name: "You", // In a real app, this would be the actual user name
    },
    tags: [
      "chat",
      chat.status === "saved" ? "saved" : "draft",
      chat.messagesCount > 10 ? "long-conversation" : "short-conversation",
    ].filter(Boolean),
    createdAt: createdDate,
    updatedAt: lastMessageDate,
    lastAccessedAt: lastMessageDate,
    size: estimatedSize,
    duration: undefined, // Not applicable for chats
    viewCount: 0, // Could be tracked if we implement view counting
    rating: undefined, // Could allow users to rate their chats
    progress: undefined, // Could calculate based on read status
    url: `/write?chatId=${chat.id}`, // Link to open the chat
    thumbnail: undefined,
    collaborators: [], // Could be extended for shared chats
    metadata: {
      wordCount: estimatedSize / 5, // Rough estimate (5 chars per word)
      pageCount: Math.ceil(chat.messagesCount / 10), // Rough estimate
      format: "Chat",
      language: "English", // Could be detected from content
    },
  };
}

/**
 * Transforms an array of ChatConversations to LibraryItems
 */
export function chatsToLibraryItems(chats: ChatConversation[]): LibraryItem[] {
  return chats.map(chatToLibraryItem);
}

/**
 * Combines chat data with mock library data for demo purposes
 * In production, you might have different data sources
 */
export function combineDataSources(
  chats: ChatConversation[],
  mockData: LibraryItem[]
): LibraryItem[] {
  const chatItems = chatsToLibraryItems(chats);
  // Combine and sort by updatedAt date
  return [...chatItems, ...mockData].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}