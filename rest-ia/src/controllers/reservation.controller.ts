import { Response } from 'express';
import { Reservation, Customer, Restaurant, Table } from '../models';
import { AuthRequest } from '../interfaces';
import { buildPaginationQuery, paginatedResponse } from '../utils';
import { socketService, brevoService } from '../services';

export class ReservationController {
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

      if (req.query.date) {
        const date = new Date(req.query.date as string);
        filter.reservationDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
      }

      const [reservations, total] = await Promise.all([
        Reservation.find(filter)
          .populate('restaurant', 'name')
          .populate({
            path: 'customer',
            populate: { path: 'user', select: 'name email phone' },
          })
          .populate('table', 'tableNumber capacity')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Reservation.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        reservations,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reservation = await Reservation.findById(req.params.id)
        .populate('restaurant', 'name address phone')
        .populate({
          path: 'customer',
          populate: { path: 'user', select: 'name email phone' },
        })
        .populate('table', 'tableNumber capacity location');

      if (!reservation) {
        res.status(404).json({
          ok: false,
          msg: 'Reservation not found',
        });
        return;
      }

      res.json({
        ok: true,
        data: reservation,
      });
    } catch (error) {
      console.error('Get reservation error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, reservationDate, startTime, endTime, partySize, specialRequests } = req.body;

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

      // Get restaurant
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({
          ok: false,
          msg: 'Restaurant not found',
        });
        return;
      }

      // Find available table
      const date = new Date(reservationDate);
      const existingReservations = await Reservation.find({
        restaurant: restaurantId,
        reservationDate: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        startTime,
        status: { $in: ['pending', 'confirmed'] },
      }).select('table');

      const reservedTableIds = existingReservations.map(r => r.table?.toString());
      
      const availableTable = await Table.findOne({
        restaurant: restaurantId,
        capacity: { $gte: partySize },
        status: 'available',
        isActive: true,
        _id: { $nin: reservedTableIds },
      });

      const reservation = new Reservation({
        restaurant: restaurantId,
        customer: customer._id,
        table: availableTable?._id,
        reservationDate: new Date(reservationDate),
        startTime,
        endTime,
        partySize,
        specialRequests,
        status: 'pending',
      });

      await reservation.save();

      // Emit socket event
      socketService.emitReservationCreated(restaurantId, reservation);

      // Send confirmation email
      try {
        const customerUser = customer.user as unknown as { name: string; email: string };
        await brevoService.sendReservationConfirmation(
          customerUser.email,
          customerUser.name,
          restaurant.name,
          new Date(reservationDate).toLocaleDateString(),
          startTime,
          partySize,
          reservation.confirmationCode || ''
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      res.status(201).json({
        ok: true,
        msg: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error) {
      console.error('Create reservation error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;

      const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate('restaurant', 'name')
        .populate({
          path: 'customer',
          populate: { path: 'user', select: 'name email phone' },
        })
        .populate('table', 'tableNumber');

      if (!reservation) {
        res.status(404).json({
          ok: false,
          msg: 'Reservation not found',
        });
        return;
      }

      // Update table status if seated
      if (status === 'seated' && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'occupied' });
      }

      // Free table if completed or cancelled
      if ((status === 'completed' || status === 'cancelled' || status === 'no_show') && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'available' });
      }

      // Emit socket event
      const customer = reservation.customer as unknown as { user: { _id: string } };
      
      if (status === 'confirmed') {
        socketService.emitReservationConfirmed(customer.user._id.toString(), reservation);
      } else if (status === 'cancelled') {
        socketService.emitReservationCancelled(customer.user._id.toString(), reservation);
      }

      res.json({
        ok: true,
        msg: 'Reservation status updated',
        data: reservation,
      });
    } catch (error) {
      console.error('Update reservation status error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true }
      )
        .populate('customer');

      if (!reservation) {
        res.status(404).json({
          ok: false,
          msg: 'Reservation not found',
        });
        return;
      }

      // Free table
      if (reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
      }

      // Emit socket event
      const customer = reservation.customer as unknown as { user: { _id: string } };
      socketService.emitReservationCancelled(customer.user._id.toString(), reservation);

      res.json({
        ok: true,
        msg: 'Reservation cancelled',
        data: reservation,
      });
    } catch (error) {
      console.error('Cancel reservation error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getMyReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skip, limit, sort } = buildPaginationQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      });

      const customer = await Customer.findOne({ user: req.userId });
      if (!customer) {
        res.status(404).json({
          ok: false,
          msg: 'Customer profile not found',
        });
        return;
      }

      const filter: Record<string, unknown> = {
        customer: customer._id,
      };

      if (req.query.status) {
        filter.status = req.query.status;
      }

      const [reservations, total] = await Promise.all([
        Reservation.find(filter)
          .populate('restaurant', 'name address phone')
          .populate('table', 'tableNumber')
          .skip(skip)
          .limit(limit)
          .sort(sort),
        Reservation.countDocuments(filter),
      ]);

      res.json(paginatedResponse(
        reservations,
        total,
        parseInt(req.query.page as string) || 1,
        limit
      ));
    } catch (error) {
      console.error('Get my reservations error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const reservationController = new ReservationController();
export default reservationController;
