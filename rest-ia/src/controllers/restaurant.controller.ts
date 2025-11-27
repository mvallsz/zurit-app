import { Response } from 'express';
import { Restaurant } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';

export class RestaurantController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const filter: Record<string, unknown> = { isActive: true };
      
      if (req.query.cuisineType) {
        filter.cuisineTypes = req.query.cuisineType;
      }
      
      if (req.query.city) {
        filter['address.city'] = { $regex: req.query.city, $options: 'i' };
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      const [restaurants, total] = await Promise.all([
        Restaurant.find(filter)
          .populate('ownerId', 'name email')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Restaurant.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        restaurants,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get restaurants error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurant = await Restaurant.findById(req.params.id)
        .populate('ownerId', 'name email');

      if (!restaurant) {
        res.status(404).json({
          ok: false,
          msg: 'Restaurant not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: restaurant,
      });
    } catch (error) {
      console.error('Get restaurant error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurant = new Restaurant({
        ...req.body,
        ownerId: req.userId,
      });

      await restaurant.save();

      res.status(201).json({
        ok: true,
        msg: 'Restaurant created successfully',
        data: restaurant,
      });
    } catch (error) {
      console.error('Create restaurant error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!restaurant) {
        res.status(404).json({
          ok: false,
          msg: 'Restaurant not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Restaurant updated successfully',
        data: restaurant,
      });
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!restaurant) {
        res.status(404).json({
          ok: false,
          msg: 'Restaurant not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Restaurant deleted successfully',
      });
    } catch (error) {
      console.error('Delete restaurant error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const restaurantController = new RestaurantController();
export default restaurantController;
