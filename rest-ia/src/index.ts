import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler, apiLimiter } from './middlewares';
import { socketService, kafkaService } from './services';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/v1', apiLimiter);

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Socket.io
    socketService.initialize(httpServer);

    // Connect to Kafka (optional, depends on configuration)
    try {
      await kafkaService.connect();
    } catch (kafkaError) {
      console.warn('⚠️ Kafka connection failed (will continue without Kafka):', kafkaError);
    }

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`🚀 Rest-IA Server running on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API: http://localhost:${config.port}/api/v1`);
      console.log(`💓 Health: http://localhost:${config.port}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await kafkaService.disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await kafkaService.disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

export default app;
