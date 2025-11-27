import { Router } from 'express';
import { customerController } from '../controllers';
import { authMiddleware, roleMiddleware } from '../middlewares';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('ADMIN', 'ROOT', 'MANAGER'), customerController.getAll.bind(customerController));
router.get('/me', authMiddleware, customerController.getMyProfile.bind(customerController));
router.get('/:id', authMiddleware, roleMiddleware('ADMIN', 'ROOT', 'MANAGER'), customerController.getById.bind(customerController));

router.post('/', authMiddleware, customerController.create.bind(customerController));
router.put('/', authMiddleware, customerController.update.bind(customerController));

router.post('/addresses', authMiddleware, customerController.addAddress.bind(customerController));
router.post('/favorites/restaurants', authMiddleware, customerController.addFavoriteRestaurant.bind(customerController));
router.post('/favorites/items', authMiddleware, customerController.addFavoriteItem.bind(customerController));

export default router;
