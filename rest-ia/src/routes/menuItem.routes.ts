import { Router } from 'express';
import { body } from 'express-validator';
import { menuItemController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', menuItemController.getAll.bind(menuItemController));
router.get('/:id', menuItemController.getById.bind(menuItemController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('name').notEmpty().withMessage('Item name is required'),
    body('price').isNumeric().withMessage('Price is required'),
    body('category').notEmpty().withMessage('Category ID is required'),
    body('menu').notEmpty().withMessage('Menu ID is required'),
    body('restaurant').notEmpty().withMessage('Restaurant ID is required'),
  ]),
  menuItemController.create.bind(menuItemController)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  menuItemController.update.bind(menuItemController)
);

router.patch(
  '/:id/availability',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER', 'STAFF'),
  menuItemController.toggleAvailability.bind(menuItemController)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  menuItemController.delete.bind(menuItemController)
);

export default router;
