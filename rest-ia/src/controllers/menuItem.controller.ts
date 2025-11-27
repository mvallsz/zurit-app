import { Response } from 'express';
import { MenuItem } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';

export class MenuItemController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const filter: Record<string, unknown> = { isActive: true };
      
      if (req.query.restaurant) {
        filter.restaurant = req.query.restaurant;
      }

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.menu) {
        filter.menu = req.query.menu;
      }

      if (req.query.isAvailable) {
        filter.isAvailable = req.query.isAvailable === 'true';
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      const [menuItems, total] = await Promise.all([
        MenuItem.find(filter)
          .populate('category', 'name')
          .populate('menu', 'name')
          .populate('restaurant', 'name')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        MenuItem.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        menuItems,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menuItem = await MenuItem.findById(req.params.id)
        .populate('category', 'name')
        .populate('menu', 'name')
        .populate('restaurant', 'name');

      if (!menuItem) {
        res.status(404).json({
          ok: false,
          msg: 'Menu item not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: menuItem,
      });
    } catch (error) {
      console.error('Get menu item error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menuItem = new MenuItem(req.body);
      await menuItem.save();

      res.status(201).json({
        ok: true,
        msg: 'Menu item created successfully',
        data: menuItem,
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!menuItem) {
        res.status(404).json({
          ok: false,
          msg: 'Menu item not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Menu item updated successfully',
        data: menuItem,
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!menuItem) {
        res.status(404).json({
          ok: false,
          msg: 'Menu item not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async toggleAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menuItem = await MenuItem.findById(req.params.id);

      if (!menuItem) {
        res.status(404).json({
          ok: false,
          msg: 'Menu item not found',
        });
        return;
      }

      menuItem.isAvailable = !menuItem.isAvailable;
      await menuItem.save();

      res.json({
        ok: true,
        msg: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
        data: menuItem,
      });
    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const menuItemController = new MenuItemController();
export default menuItemController;
