import { Router } from 'express';
import { body } from 'express-validator';
import { categoryController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('name').notEmpty().withMessage('Category name is required'),
    body('restaurant').notEmpty().withMessage('Restaurant ID is required'),
  ]),
  categoryController.create.bind(categoryController)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  categoryController.update.bind(categoryController)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  categoryController.delete.bind(categoryController)
);

export default router;
