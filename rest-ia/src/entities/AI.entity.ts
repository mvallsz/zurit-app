/**
 * Entity: AIContext
 * 
 * Represents an AI context configuration for the chatbot.
 * Used to customize AI behavior for different scenarios.
 */
export interface AIContextEntity {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  restaurantId?: string;
  isGlobal: boolean;
  isActive: boolean;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity: RAGDocument
 * 
 * Represents a document used for RAG (Retrieval-Augmented Generation).
 * Documents are chunked and embedded for semantic search.
 */
export interface RAGDocumentEntity {
  id: string;
  title: string;
  content: string;
  source?: string;
  restaurantId?: string;
  contextId?: string;
  chunks: {
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
