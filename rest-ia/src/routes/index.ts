import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes from './menu.routes';
import menuItemRoutes from './menuItem.routes';
import categoryRoutes from './category.routes';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';
import deliveryRoutes from './delivery.routes';
import tableRoutes from './table.routes';
import reservationRoutes from './reservation.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menus', menuRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    msg: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
