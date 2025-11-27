import { Router } from 'express';
import { body } from 'express-validator';
import { aiController } from '../controllers';
import { authMiddleware, roleMiddleware, validate } from '../middlewares';

const router = Router();

router.post(
  '/chat',
  authMiddleware,
  validate([
    body('message').notEmpty().withMessage('Message is required'),
  ]),
  aiController.chat.bind(aiController)
);

router.post(
  '/context',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('name').notEmpty().withMessage('Context name is required'),
    body('systemPrompt').notEmpty().withMessage('System prompt is required'),
  ]),
  aiController.createContext.bind(aiController)
);

router.get('/contexts', authMiddleware, aiController.getContexts.bind(aiController));

router.put(
  '/context/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  aiController.updateContext.bind(aiController)
);

router.delete(
  '/context/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  aiController.deleteContext.bind(aiController)
);

router.post(
  '/rag/query',
  authMiddleware,
  validate([
    body('query').notEmpty().withMessage('Query is required'),
  ]),
  aiController.queryRAG.bind(aiController)
);

router.post(
  '/rag/documents',
  authMiddleware,
  roleMiddleware('ADMIN', 'ROOT', 'MANAGER'),
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  aiController.addDocument.bind(aiController)
);

router.post(
  '/recommendations',
  authMiddleware,
  validate([
    body('preferences').isArray().withMessage('Preferences array is required'),
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
  ]),
  aiController.getRecommendations.bind(aiController)
);

export default router;
