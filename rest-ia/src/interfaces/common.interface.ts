import { Request } from 'express';
import { IUser } from './entities.interface';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export interface ServiceResponse<T = unknown> {
  ok: boolean;
  msg: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: Record<string, unknown>;
}

export interface KafkaMessage {
  topic: string;
  key?: string;
  value: unknown;
  timestamp?: number;
}

export interface SocketEvent {
  event: string;
  room?: string;
  data: unknown;
}

export interface AIRequest {
  message: string;
  contextId?: string;
  conversationId?: string;
  useRag?: boolean;
}

export interface AIResponse {
  message: string;
  sources?: {
    title: string;
    content: string;
    relevance: number;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface NotificationPayload {
  type: 'email' | 'sms';
  to: string;
  subject?: string;
  content: string;
  templateId?: number;
  params?: Record<string, string>;
}
