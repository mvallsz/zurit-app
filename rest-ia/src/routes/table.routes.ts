import { Router } from 'express';
import { body } from 'express-validator';
import { tableController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', tableController.getAll.bind(tableController));
router.get('/qr/:qrCode', tableController.getByQRCode.bind(tableController));
router.get('/:id', tableController.getById.bind(tableController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('restaurant').notEmpty().withMessage('Restaurant ID is required'),
    body('tableNumber').notEmpty().withMessage('Table number is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  ]),
  tableController.create.bind(tableController)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  tableController.update.bind(tableController)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER', 'STAFF'),
  validate([
    body('status').isIn(['available', 'occupied', 'reserved', 'cleaning'])
      .withMessage('Valid status is required'),
  ]),
  tableController.updateStatus.bind(tableController)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  tableController.delete.bind(tableController)
);

export default router;
