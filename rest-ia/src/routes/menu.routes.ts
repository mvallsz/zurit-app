import { Router } from 'express';
import { body } from 'express-validator';
import { menuController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', menuController.getAll.bind(menuController));
router.get('/:id', menuController.getById.bind(menuController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('name').notEmpty().withMessage('Menu name is required'),
    body('restaurant').notEmpty().withMessage('Restaurant ID is required'),
  ]),
  menuController.create.bind(menuController)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  menuController.update.bind(menuController)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  menuController.delete.bind(menuController)
);

export default router;
