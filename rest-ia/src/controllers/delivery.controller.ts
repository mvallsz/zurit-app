import { Response } from 'express';
import { Delivery, Order, User } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';
import { kafkaService, socketService } from '../services';

export class DeliveryController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const filter: Record<string, unknown> = {};
      
      if (req.query.restaurant) {
        filter.restaurant = req.query.restaurant;
      }
      
      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.deliveryPerson) {
        filter.deliveryPerson = req.query.deliveryPerson;
      }

      const [deliveries, total] = await Promise.all([
        Delivery.find(filter)
          .populate('order', 'orderNumber total')
          .populate('deliveryPerson', 'name phone')
          .populate('restaurant', 'name')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Delivery.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        deliveries,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get deliveries error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const delivery = await Delivery.findById(req.params.id)
        .populate('order')
        .populate('deliveryPerson', 'name phone email')
        .populate('restaurant', 'name address phone');

      if (!delivery) {
        res.status(404).json({
          ok: false,
          msg: 'Delivery not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: delivery,
      });
    } catch (error) {
      console.error('Get delivery error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderId, deliveryPersonId } = req.body;

      const order = await Order.findById(orderId)
        .populate('restaurant');
      
      if (!order) {
        res.status(404).json({
          ok: false,
          msg: 'Order not found',
        });
        return;
      }

      const deliveryPerson = await User.findById(deliveryPersonId);
      if (!deliveryPerson || deliveryPerson.role !== 'DELIVERY') {
        res.status(400).json({
          ok: false,
          msg: 'Invalid delivery person',
        });
        return;
      }

      const restaurant = order.restaurant as unknown as { address: unknown };

      const delivery = new Delivery({
        order: orderId,
        deliveryPerson: deliveryPersonId,
        restaurant: order.restaurant._id,
        pickupAddress: restaurant.address,
        deliveryAddress: order.deliveryAddress,
        status: 'assigned',
        estimatedDeliveryTime: order.estimatedDeliveryTime,
      });

      await delivery.save();

      // Update order status
      order.status = 'out_for_delivery';
      await order.save();

      // Publish to Kafka
      try {
        await kafkaService.publishDeliveryAssigned(delivery);
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      // Emit socket event
      socketService.emitDeliveryAssigned(deliveryPersonId, delivery);

      res.status(201).json({
        ok: true,
        msg: 'Delivery created and assigned successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Create delivery error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;

      const delivery = await Delivery.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate('order');

      if (!delivery) {
        res.status(404).json({
          ok: false,
          msg: 'Delivery not found',
        });
        return;
      }

      // Update actual times based on status
      if (status === 'picked_up') {
        delivery.actualPickupTime = new Date();
        await delivery.save();
      } else if (status === 'delivered') {
        delivery.actualDeliveryTime = new Date();
        await delivery.save();

        // Update order status
        await Order.findByIdAndUpdate(delivery.order._id, { 
          status: 'delivered',
          actualDeliveryTime: new Date(),
        });
      }

      // Publish to Kafka
      try {
        await kafkaService.publishDeliveryStatusChanged(delivery._id.toString(), status);
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      // Get customer from order for socket notification
      const order = await Order.findById(delivery.order)
        .populate('customer');
      
      if (order) {
        const customer = order.customer as unknown as { user: { _id: string } };
        socketService.emitDeliveryStatusChanged(
          customer.user._id.toString(),
          delivery._id.toString(),
          status
        );
      }

      res.json({
        ok: true,
        msg: 'Delivery status updated',
        data: delivery,
      });
    } catch (error) {
      console.error('Update delivery status error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.body;

      const delivery = await Delivery.findByIdAndUpdate(
        req.params.id,
        { 
          currentLocation: {
            lat,
            lng,
            updatedAt: new Date(),
          },
        },
        { new: true }
      )
        .populate('order');

      if (!delivery) {
        res.status(404).json({
          ok: false,
          msg: 'Delivery not found',
        });
        return;
      }

      // Publish to Kafka
      try {
        await kafkaService.publishDeliveryLocationUpdated(
          delivery._id.toString(),
          { lat, lng }
        );
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      // Get customer from order for socket notification
      const order = await Order.findById(delivery.order)
        .populate('customer');
      
      if (order) {
        const customer = order.customer as unknown as { user: { _id: string } };
        socketService.emitDeliveryLocationUpdated(
          customer.user._id.toString(),
          delivery._id.toString(),
          { lat, lng }
        );
      }

      res.json({
        ok: true,
        msg: 'Delivery location updated',
        data: delivery,
      });
    } catch (error) {
      console.error('Update delivery location error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getMyDeliveries(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const filter: Record<string, unknown> = {
        deliveryPerson: req.userId,
      };
      
      if (req.query.status) {
        filter.status = req.query.status;
      }

      const [deliveries, total] = await Promise.all([
        Delivery.find(filter)
          .populate('order', 'orderNumber total deliveryAddress')
          .populate('restaurant', 'name address')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Delivery.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        deliveries,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get my deliveries error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const deliveryController = new DeliveryController();
export default deliveryController;
