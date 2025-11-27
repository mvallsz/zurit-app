import { Response } from 'express';
import { Table } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';
import { socketService } from '../services';

export class TableController {
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

      if (req.query.status) {
        filter.status = req.query.status;
      }

      const [tables, total] = await Promise.all([
        Table.find(filter)
          .populate('restaurant', 'name')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Table.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        tables,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get tables error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const table = await Table.findById(req.params.id)
        .populate('restaurant', 'name');

      if (!table) {
        res.status(404).json({
          ok: false,
          msg: 'Table not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: table,
      });
    } catch (error) {
      console.error('Get table error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getByQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const table = await Table.findOne({ qrCode: req.params.qrCode })
        .populate('restaurant', 'name address phone');

      if (!table) {
        res.status(404).json({
          ok: false,
          msg: 'Table not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: table,
      });
    } catch (error) {
      console.error('Get table by QR error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const table = new Table(req.body);
      await table.save();

      res.status(201).json({
        ok: true,
        msg: 'Table created successfully',
        data: table,
      });
    } catch (error) {
      console.error('Create table error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const table = await Table.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!table) {
        res.status(404).json({
          ok: false,
          msg: 'Table not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Table updated successfully',
        data: table,
      });
    } catch (error) {
      console.error('Update table error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;

      const table = await Table.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!table) {
        res.status(404).json({
          ok: false,
          msg: 'Table not found',
        });
        return;
      }

      // Emit socket event
      socketService.emitTableStatusChanged(
        table.restaurant.toString(),
        table._id.toString(),
        status
      );

      res.json({
        ok: true,
        msg: 'Table status updated',
        data: table,
      });
    } catch (error) {
      console.error('Update table status error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const table = await Table.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!table) {
        res.status(404).json({
          ok: false,
          msg: 'Table not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Table deleted successfully',
      });
    } catch (error) {
      console.error('Delete table error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const tableController = new TableController();
export default tableController;
