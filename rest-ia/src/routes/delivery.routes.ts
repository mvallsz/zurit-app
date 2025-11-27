import { Router } from 'express';
import { body } from 'express-validator';
import { deliveryController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('ADMIN', 'ROOT', 'MANAGER'), deliveryController.getAll.bind(deliveryController));
router.get('/my', authMiddleware, roleMiddleware('DELIVERY'), deliveryController.getMyDeliveries.bind(deliveryController));
router.get('/:id', authMiddleware, deliveryController.getById.bind(deliveryController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('deliveryPersonId').notEmpty().withMessage('Delivery person ID is required'),
  ]),
  deliveryController.create.bind(deliveryController)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER', 'DELIVERY'),
  validate([
    body('status').isIn(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'])
      .withMessage('Valid status is required'),
  ]),
  deliveryController.updateStatus.bind(deliveryController)
);

router.patch(
  '/:id/location',
  authMiddleware,
  roleMiddleware('DELIVERY'),
  validate([
    body('lat').isNumeric().withMessage('Latitude is required'),
    body('lng').isNumeric().withMessage('Longitude is required'),
  ]),
  deliveryController.updateLocation.bind(deliveryController)
);

export default router;
