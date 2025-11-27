import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers';
import { authMiddleware, validate } from '../middlewares';

const router = Router();

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login.bind(authController)
);

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  authController.register.bind(authController)
);

router.post('/refresh', authMiddleware, authController.refreshToken.bind(authController));
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));

export default router;
