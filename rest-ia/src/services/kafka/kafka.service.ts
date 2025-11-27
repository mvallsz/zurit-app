import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '../../config';
import { KafkaMessage } from '../../interfaces';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka producer connected');
    } catch (error) {
      console.error('❌ Kafka connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      for (const [topic, consumer] of this.consumers) {
        await consumer.disconnect();
        console.log(`Kafka consumer disconnected from topic: ${topic}`);
      }
      this.isConnected = false;
      console.log('Kafka disconnected');
    } catch (error) {
      console.error('Kafka disconnect error:', error);
    }
  }

  async sendMessage(message: KafkaMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      await this.producer.send({
        topic: message.topic,
        messages: [
          {
            key: message.key,
            value: JSON.stringify(message.value),
            timestamp: message.timestamp?.toString(),
          },
        ],
      });
    } catch (error) {
      console.error('Kafka send error:', error);
      throw error;
    }
  }

  async subscribe(
    topic: string,
    handler: (payload: EachMessagePayload) => Promise<void>
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: `${config.kafka.groupId}-${topic}` });
    
    try {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });
      
      await consumer.run({
        eachMessage: async (payload) => {
          try {
            await handler(payload);
          } catch (error) {
            console.error(`Error processing message from ${topic}:`, error);
          }
        },
      });

      this.consumers.set(topic, consumer);
      console.log(`✅ Kafka consumer subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Kafka subscribe error for topic ${topic}:`, error);
      throw error;
    }
  }

  // Pre-defined topics
  static readonly TOPICS = {
    ORDERS: 'orders',
    DELIVERIES: 'deliveries',
    NOTIFICATIONS: 'notifications',
    AI_REQUESTS: 'ai-requests',
    AI_RESPONSES: 'ai-responses',
  };

  // Order events
  async publishOrderCreated(orderData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.ORDERS,
      key: 'order.created',
      value: { event: 'order.created', data: orderData, timestamp: Date.now() },
    });
  }

  async publishOrderUpdated(orderData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.ORDERS,
      key: 'order.updated',
      value: { event: 'order.updated', data: orderData, timestamp: Date.now() },
    });
  }

  async publishOrderStatusChanged(orderId: string, status: string): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.ORDERS,
      key: 'order.status-changed',
      value: { event: 'order.status-changed', orderId, status, timestamp: Date.now() },
    });
  }

  // Delivery events
  async publishDeliveryAssigned(deliveryData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.DELIVERIES,
      key: 'delivery.assigned',
      value: { event: 'delivery.assigned', data: deliveryData, timestamp: Date.now() },
    });
  }

  async publishDeliveryStatusChanged(deliveryId: string, status: string): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.DELIVERIES,
      key: 'delivery.status-changed',
      value: { event: 'delivery.status-changed', deliveryId, status, timestamp: Date.now() },
    });
  }

  async publishDeliveryLocationUpdated(deliveryId: string, location: { lat: number; lng: number }): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.DELIVERIES,
      key: 'delivery.location-updated',
      value: { event: 'delivery.location-updated', deliveryId, location, timestamp: Date.now() },
    });
  }

  // Notification events
  async publishNotification(notificationData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.NOTIFICATIONS,
      key: 'notification',
      value: { event: 'notification', data: notificationData, timestamp: Date.now() },
    });
  }

  // AI events
  async publishAIRequest(requestData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.AI_REQUESTS,
      key: 'ai.request',
      value: { event: 'ai.request', data: requestData, timestamp: Date.now() },
    });
  }

  async publishAIResponse(responseData: unknown): Promise<void> {
    await this.sendMessage({
      topic: KafkaService.TOPICS.AI_RESPONSES,
      key: 'ai.response',
      value: { event: 'ai.response', data: responseData, timestamp: Date.now() },
    });
  }
}

export const kafkaService = new KafkaService();
export default kafkaService;
