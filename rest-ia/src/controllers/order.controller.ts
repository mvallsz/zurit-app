import { Response } from 'express';
import { Order, Customer, MenuItem, Restaurant } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';
import { kafkaService, socketService, brevoService } from '../services';

export class OrderController {
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

      if (req.query.orderType) {
        filter.orderType = req.query.orderType;
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('restaurant', 'name')
          .populate('customer', 'user')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Order.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        orders,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await Order.findById(req.params.id)
        .populate('restaurant', 'name address phone')
        .populate({
          path: 'customer',
          populate: { path: 'user', select: 'name email phone' },
        })
        .populate('items.menuItem', 'name images');

      if (!order) {
        res.status(404).json({
          ok: false,
          msg: 'Order not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: order,
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, items, orderType, deliveryAddress, specialInstructions, table } = req.body;

      // Get customer
      const customer = await Customer.findOne({ user: req.userId })
        .populate('user', 'name email');
      if (!customer) {
        res.status(400).json({
          ok: false,
          msg: 'Customer profile not found',
        });
        return;
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          res.status(400).json({
            ok: false,
            msg: `Menu item not found: ${item.menuItemId}`,
          });
          return;
        }

        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
          modifiers: item.modifiers || [],
          specialInstructions: item.specialInstructions,
        });
      }

      const tax = subtotal * 0.16; // 16% tax
      const deliveryFee = orderType === 'delivery' ? 50 : 0; // Example delivery fee
      const total = subtotal + tax + deliveryFee;

      const order = new Order({
        restaurant: restaurantId,
        customer: customer._id,
        items: orderItems,
        orderType,
        table,
        subtotal,
        tax,
        deliveryFee,
        total,
        deliveryAddress,
        specialInstructions,
        status: 'pending',
        paymentStatus: 'pending',
      });

      await order.save();

      // Populate for response
      await order.populate('restaurant', 'name');

      // Publish to Kafka
      try {
        await kafkaService.publishOrderCreated(order);
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      // Emit socket event
      socketService.emitOrderCreated(restaurantId, order);

      // Get restaurant for notification
      const restaurant = await Restaurant.findById(restaurantId);

      // Send confirmation email
      try {
        const customerUser = customer.user as unknown as { name: string; email: string };
        await brevoService.sendOrderConfirmation(
          customerUser.email,
          order.orderNumber,
          customerUser.name,
          orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.totalPrice,
          })),
          total
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      res.status(201).json({
        ok: true,
        msg: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate('restaurant', 'name')
        .populate({
          path: 'customer',
          populate: { path: 'user', select: 'name email phone' },
        });

      if (!order) {
        res.status(404).json({
          ok: false,
          msg: 'Order not found',
        });
        return;
      }

      // Publish to Kafka
      try {
        await kafkaService.publishOrderStatusChanged(order._id.toString(), status);
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      // Emit socket events
      const customer = order.customer as unknown as { user: { _id: string }; _id: string };
      socketService.emitOrderStatusChanged(
        customer.user._id.toString(),
        order.restaurant._id.toString(),
        order._id.toString(),
        status
      );

      // Send status update email
      try {
        const customerUser = customer.user as unknown as { name: string; email: string };
        await brevoService.sendOrderStatusUpdate(
          customerUser.email,
          order.orderNumber,
          status,
          customerUser.name
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      res.json({
        ok: true,
        msg: 'Order status updated',
        data: order,
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reason } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          cancelReason: reason,
        },
        { new: true }
      );

      if (!order) {
        res.status(404).json({
          ok: false,
          msg: 'Order not found',
        });
        return;
      }

      // Publish to Kafka
      try {
        await kafkaService.publishOrderStatusChanged(order._id.toString(), 'cancelled');
      } catch (kafkaError) {
        console.error('Kafka publish error:', kafkaError);
      }

      res.json({
        ok: true,
        msg: 'Order cancelled',
        data: order,
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const orderController = new OrderController();
export default orderController;
