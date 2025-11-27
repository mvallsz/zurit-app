import { Router } from 'express';
import { body } from 'express-validator';
import { orderController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', authMiddleware, orderController.getAll.bind(orderController));
router.get('/:id', authMiddleware, orderController.getById.bind(orderController));

router.post(
  '/',
  authMiddleware,
  validate([
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('orderType').isIn(['dine_in', 'takeout', 'delivery']).withMessage('Valid order type is required'),
  ]),
  orderController.create.bind(orderController)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER', 'STAFF'),
  validate([
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'])
      .withMessage('Valid status is required'),
  ]),
  orderController.updateStatus.bind(orderController)
);

router.delete(
  '/:id',
  authMiddleware,
  orderController.cancel.bind(orderController)
);

export default router;
