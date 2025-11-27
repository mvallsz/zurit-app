import { Response } from 'express';
import { Category } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';

export class CategoryController {
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

      const [categories, total] = await Promise.all([
        Category.find(filter)
          .populate('restaurant', 'name')
          .populate('parentCategory', 'name')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Category.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        categories,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await Category.findById(req.params.id)
        .populate('restaurant', 'name')
        .populate('parentCategory', 'name');

      if (!category) {
        res.status(404).json({
          ok: false,
          msg: 'Category not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = new Category(req.body);
      await category.save();

      res.status(201).json({
        ok: true,
        msg: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!category) {
        res.status(404).json({
          ok: false,
          msg: 'Category not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!category) {
        res.status(404).json({
          ok: false,
          msg: 'Category not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const categoryController = new CategoryController();
export default categoryController;
