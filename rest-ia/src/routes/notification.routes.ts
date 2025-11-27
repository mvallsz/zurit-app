import { Router } from 'express';
import { body } from 'express-validator';
import { notificationController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.post(
  '/email',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('to').isEmail().withMessage('Valid email is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  notificationController.sendEmail.bind(notificationController)
);

router.post(
  '/sms',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('to').notEmpty().withMessage('Phone number is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  notificationController.sendSMS.bind(notificationController)
);

export default router;
