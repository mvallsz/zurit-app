import { Response } from 'express';
import { Customer, User } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';

export class CustomerController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const filter: Record<string, unknown> = { isActive: true };

      const [customers, total] = await Promise.all([
        Customer.find(filter)
          .populate('user', 'name email phone')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Customer.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        customers,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('favoriteRestaurants', 'name')
        .populate('favoriteItems', 'name price');

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: customer,
      });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOne({ user: req.userId })
        .populate('user', 'name email phone')
        .populate('favoriteRestaurants', 'name')
        .populate('favoriteItems', 'name price');

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer profile not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: customer,
      });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if customer profile already exists
      const existingCustomer = await Customer.findOne({ user: req.userId });
      if (existingCustomer) {
        res.status(400).json({
          ok: false,
          msg: 'Customer profile already exists',
        });
        return;
      }

      const customer = new Customer({
        user: req.userId,
        ...req.body,
      });
      await customer.save();

      res.status(201).json({
        ok: true,
        msg: 'Customer profile created successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOneAndUpdate(
        { user: req.userId },
        req.body,
        { new: true }
      );

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async addAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOne({ user: req.userId });

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer not found',
        });
        return;
      }

      customer.addresses.push(req.body);
      await customer.save();

      res.json({
        ok: true,
        msg: 'Address added successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async addFavoriteRestaurant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.body;
      
      const customer = await Customer.findOne({ user: req.userId });

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer not found',
        });
        return;
      }

      if (!customer.favoriteRestaurants.includes(restaurantId)) {
        customer.favoriteRestaurants.push(restaurantId);
        await customer.save();
      }

      res.json({
        ok: true,
        msg: 'Restaurant added to favorites',
        data: customer,
      });
    } catch (error) {
      console.error('Add favorite restaurant error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async addFavoriteItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { itemId } = req.body;
      
      const customer = await Customer.findOne({ user: req.userId });

      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer not found',
        });
        return;
      }

      if (!customer.favoriteItems.includes(itemId)) {
        customer.favoriteItems.push(itemId);
        await customer.save();
      }

      res.json({
        ok: true,
        msg: 'Item added to favorites',
        data: customer,
      });
    } catch (error) {
      console.error('Add favorite item error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const customerController = new CustomerController();
export default customerController;
