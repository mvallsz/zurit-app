import { Router } from 'express';
import { body } from 'express-validator';
import { restaurantController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', restaurantController.getAll.bind(restaurantController));
router.get('/:id', restaurantController.getById.bind(restaurantController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('name').notEmpty().withMessage('Restaurant name is required'),
    body('address').isObject().withMessage('Address is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  restaurantController.create.bind(restaurantController)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  restaurantController.update.bind(restaurantController)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT'),
  restaurantController.delete.bind(restaurantController)
);

export default router;
