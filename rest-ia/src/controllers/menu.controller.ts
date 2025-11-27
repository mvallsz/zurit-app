import { Response } from 'express';
import { Menu } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';

export class MenuController {
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

      const [menus, total] = await Promise.all([
        Menu.find(filter)
          .populate('restaurant', 'name')
          .populate('categories', 'name')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Menu.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        menus,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get menus error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menu = await Menu.findById(req.params.id)
        .populate('restaurant', 'name')
        .populate('categories', 'name description image');

      if (!menu) {
        res.status(404).json({
          ok: false,
          msg: 'Menu not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: menu,
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menu = new Menu(req.body);
      await menu.save();

      res.status(201).json({
        ok: true,
        msg: 'Menu created successfully',
        data: menu,
      });
    } catch (error) {
      console.error('Create menu error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menu = await Menu.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!menu) {
        res.status(404).json({
          ok: false,
          msg: 'Menu not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Menu updated successfully',
        data: menu,
      });
    } catch (error) {
      console.error('Update menu error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const menu = await Menu.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!menu) {
        res.status(404).json({
          ok: false,
          msg: 'Menu not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Menu deleted successfully',
      });
    } catch (error) {
      console.error('Delete menu error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const menuController = new MenuController();
export default menuController;
