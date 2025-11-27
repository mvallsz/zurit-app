import OpenAI from 'openai';
import { config } from '../../config';
import { AIContext, RAGDocument } from '../../models';
import { AIRequest, AIResponse } from '../../interfaces';

export class AIService {
  private openai: OpenAI;
  private defaultSystemPrompt = `You are a helpful AI assistant for a restaurant and food ordering system. 
You can help customers with menu recommendations, answer questions about dishes, 
assist with orders, and provide information about restaurants.`;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const context = request.contextId 
      ? await AIContext.findById(request.contextId)
      : null;

    const systemPrompt = context?.systemPrompt || this.defaultSystemPrompt;
    const settings = context?.settings || {};

    let ragSources: { title: string; content: string; relevance: number }[] = [];
    let augmentedMessage = request.message;

    // Apply RAG if enabled and requested
    if (config.rag.enabled && request.useRag) {
      const ragResults = await this.queryRAG(request.message, request.contextId);
      if (ragResults.length > 0) {
        ragSources = ragResults;
        const contextInfo = ragResults
          .map(r => `[${r.title}]: ${r.content}`)
          .join('\n\n');
        augmentedMessage = `Context Information:\n${contextInfo}\n\nUser Question: ${request.message}`;
      }
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: augmentedMessage },
        ],
        max_tokens: settings.maxTokens || config.openai.maxTokens,
        temperature: settings.temperature || 0.7,
        top_p: settings.topP || 1,
        frequency_penalty: settings.frequencyPenalty || 0,
        presence_penalty: settings.presencePenalty || 0,
      });

      const response: AIResponse = {
        message: completion.choices[0]?.message?.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };

      if (ragSources.length > 0) {
        response.sources = ragSources;
      }

      return response;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  async queryRAG(
    query: string,
    contextId?: string
  ): Promise<{ title: string; content: string; relevance: number }[]> {
    try {
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);

      // Build filter
      const filter: Record<string, unknown> = { isActive: true };
      if (contextId) {
        filter.context = contextId;
      }

      // Get documents
      const documents = await RAGDocument.find(filter);
      
      // Calculate similarity for each chunk
      const results: { title: string; content: string; relevance: number }[] = [];
      
      for (const doc of documents) {
        for (const chunk of doc.chunks) {
          if (chunk.embedding && chunk.embedding.length > 0) {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
            if (similarity > 0.7) { // Threshold
              results.push({
                title: doc.title,
                content: chunk.content,
                relevance: similarity,
              });
            }
          }
        }
      }

      // Sort by relevance and return top 5
      return results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);
    } catch (error) {
      console.error('RAG query error:', error);
      return [];
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Embedding error:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async addDocument(
    title: string,
    content: string,
    source?: string,
    restaurantId?: string,
    contextId?: string
  ): Promise<void> {
    try {
      // Split content into chunks
      const chunks = this.splitIntoChunks(content);
      
      // Get embeddings for each chunk
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunkContent) => ({
          content: chunkContent,
          embedding: await this.getEmbedding(chunkContent),
        }))
      );

      // Create document
      const document = new RAGDocument({
        title,
        content,
        source,
        restaurant: restaurantId,
        context: contextId,
        chunks: chunksWithEmbeddings,
        isActive: true,
      });

      await document.save();
    } catch (error) {
      console.error('Add document error:', error);
      throw error;
    }
  }

  private splitIntoChunks(text: string): string[] {
    const chunkSize = config.rag.chunkSize;
    const overlap = config.rag.overlap;
    const chunks: string[] = [];
    
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }
    
    return chunks;
  }

  // Create or update AI context
  async createContext(
    name: string,
    systemPrompt: string,
    options?: {
      description?: string;
      restaurantId?: string;
      isGlobal?: boolean;
      settings?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
      };
    }
  ): Promise<typeof AIContext.prototype> {
    const context = new AIContext({
      name,
      systemPrompt,
      description: options?.description,
      restaurant: options?.restaurantId,
      isGlobal: options?.isGlobal || false,
      settings: options?.settings,
      isActive: true,
    });

    await context.save();
    return context;
  }

  async getContexts(restaurantId?: string): Promise<(typeof AIContext.prototype)[]> {
    const filter: Record<string, unknown> = { isActive: true };
    
    if (restaurantId) {
      filter.$or = [
        { restaurant: restaurantId },
        { isGlobal: true },
      ];
    } else {
      filter.isGlobal = true;
    }

    return AIContext.find(filter);
  }

  async updateContext(
    contextId: string,
    updates: Partial<{
      name: string;
      description: string;
      systemPrompt: string;
      settings: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
      };
      isActive: boolean;
    }>
  ): Promise<typeof AIContext.prototype | null> {
    return AIContext.findByIdAndUpdate(contextId, updates, { new: true });
  }

  async deleteContext(contextId: string): Promise<void> {
    await AIContext.findByIdAndUpdate(contextId, { isActive: false });
  }

  // Menu recommendation based on preferences
  async getMenuRecommendations(
    preferences: string[],
    restrictions: string[],
    restaurantId: string
  ): Promise<AIResponse> {
    const prompt = `Based on the following customer preferences and restrictions, 
recommend menu items from the restaurant.

Preferences: ${preferences.join(', ')}
Restrictions: ${restrictions.join(', ')}

Please provide personalized recommendations with explanations.`;

    return this.chat({
      message: prompt,
      useRag: true,
    });
  }
}

export const aiService = new AIService();
export default aiService;
