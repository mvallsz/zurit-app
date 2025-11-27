import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from '../../interfaces';

export class SocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, Socket> = new Map();

  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('join', (data: { userId?: string; restaurantId?: string }) => {
        if (data.userId) {
          this.connectedUsers.set(data.userId, socket);
          socket.join(`user:${data.userId}`);
        }
        if (data.restaurantId) {
          socket.join(`restaurant:${data.restaurantId}`);
        }
      });

      socket.on('leave', (data: { userId?: string; restaurantId?: string }) => {
        if (data.userId) {
          this.connectedUsers.delete(data.userId);
          socket.leave(`user:${data.userId}`);
        }
        if (data.restaurantId) {
          socket.leave(`restaurant:${data.restaurantId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Remove from connected users
        for (const [userId, userSocket] of this.connectedUsers) {
          if (userSocket.id === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
      });
    });

    console.log('✅ Socket.io initialized');
  }

  emit(event: SocketEvent): void {
    if (!this.io) {
      console.warn('Socket.io not initialized');
      return;
    }

    if (event.room) {
      this.io.to(event.room).emit(event.event, event.data);
    } else {
      this.io.emit(event.event, event.data);
    }
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) {
      console.warn('Socket.io not initialized');
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
  }

  emitToRestaurant(restaurantId: string, event: string, data: unknown): void {
    if (!this.io) {
      console.warn('Socket.io not initialized');
      return;
    }
    this.io.to(`restaurant:${restaurantId}`).emit(event, data);
  }

  // Order events
  emitOrderCreated(restaurantId: string, orderData: unknown): void {
    this.emitToRestaurant(restaurantId, 'order:created', orderData);
  }

  emitOrderUpdated(restaurantId: string, orderData: unknown): void {
    this.emitToRestaurant(restaurantId, 'order:updated', orderData);
  }

  emitOrderStatusChanged(userId: string, restaurantId: string, orderId: string, status: string): void {
    this.emitToUser(userId, 'order:status-changed', { orderId, status });
    this.emitToRestaurant(restaurantId, 'order:status-changed', { orderId, status });
  }

  // Delivery events
  emitDeliveryAssigned(deliveryPersonId: string, deliveryData: unknown): void {
    this.emitToUser(deliveryPersonId, 'delivery:assigned', deliveryData);
  }

  emitDeliveryStatusChanged(userId: string, deliveryId: string, status: string): void {
    this.emitToUser(userId, 'delivery:status-changed', { deliveryId, status });
  }

  emitDeliveryLocationUpdated(userId: string, deliveryId: string, location: { lat: number; lng: number }): void {
    this.emitToUser(userId, 'delivery:location-updated', { deliveryId, location });
  }

  // Reservation events
  emitReservationCreated(restaurantId: string, reservationData: unknown): void {
    this.emitToRestaurant(restaurantId, 'reservation:created', reservationData);
  }

  emitReservationConfirmed(userId: string, reservationData: unknown): void {
    this.emitToUser(userId, 'reservation:confirmed', reservationData);
  }

  emitReservationCancelled(userId: string, reservationData: unknown): void {
    this.emitToUser(userId, 'reservation:cancelled', reservationData);
  }

  // Table events
  emitTableStatusChanged(restaurantId: string, tableId: string, status: string): void {
    this.emitToRestaurant(restaurantId, 'table:status-changed', { tableId, status });
  }

  getIO(): Server | null {
    return this.io;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export const socketService = new SocketService();
export default socketService;
