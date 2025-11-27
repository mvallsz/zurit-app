import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate required environment variables in production
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in production environment');
  }
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3500', 10),
  nodeEnv,
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rest-ia',
  
  // JWT - require in production, allow default only in development
  jwtSecret: process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'dev-secret-do-not-use-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Kafka
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'rest-ia',
    groupId: process.env.KAFKA_GROUP_ID || 'rest-ia-group',
  },
  
  // BREVO
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@yourapp.com',
    senderName: process.env.BREVO_SENDER_NAME || 'Rest-IA',
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  },
  
  // RAG
  rag: {
    enabled: process.env.RAG_ENABLED === 'true',
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10),
    overlap: parseInt(process.env.RAG_OVERLAP || '200', 10),
  },
};

export default config;
