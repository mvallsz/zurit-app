import { Router } from 'express';
import { body } from 'express-validator';
import { reservationController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('ADMIN', 'ROOT', 'MANAGER'), reservationController.getAll.bind(reservationController));
router.get('/my', authMiddleware, reservationController.getMyReservations.bind(reservationController));
router.get('/:id', authMiddleware, reservationController.getById.bind(reservationController));

router.post(
  '/',
  authMiddleware,
  validate([
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('reservationDate').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  ]),
  reservationController.create.bind(reservationController)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER', 'STAFF'),
  validate([
    body('status').isIn(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])
      .withMessage('Valid status is required'),
  ]),
  reservationController.updateStatus.bind(reservationController)
);

router.delete(
  '/:id',
  authMiddleware,
  reservationController.cancel.bind(reservationController)
);

export default router;
