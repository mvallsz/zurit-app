import { Response } from 'express';
import { AuthRequest, AIRequest } from '../interfaces';
import { aiService } from '../services';

export class AIController {
  async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message, contextId, conversationId, useRag } = req.body as AIRequest;

      const response = await aiService.chat({
        message,
        contextId,
        conversationId,
        useRag: useRag ?? true,
      });

      res.json({
        ok: true,
        data: response,
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({
        ok: false,
        msg: 'AI service error',
      });
    }
  }

  async createContext(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, systemPrompt, description, restaurantId, isGlobal, settings } = req.body;

      const context = await aiService.createContext(name, systemPrompt, {
        description,
        restaurantId,
        isGlobal,
        settings,
      });

      res.status(201).json({
        ok: true,
        msg: 'Context created successfully',
        data: context,
      });
    } catch (error) {
      console.error('Create context error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getContexts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.query.restaurantId as string;
      const contexts = await aiService.getContexts(restaurantId);

      res.json({
        ok: true,
        data: contexts,
      });
    } catch (error) {
      console.error('Get contexts error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateContext(req: AuthRequest, res: Response): Promise<void> {
    try {
      const context = await aiService.updateContext(req.params.id, req.body);

      if (!context) {
        res.status(404).json({
          ok: false,
          msg: 'Context not found',
        });
        return;
      }

      res.json({
        ok: true,
        msg: 'Context updated successfully',
        data: context,
      });
    } catch (error) {
      console.error('Update context error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async deleteContext(req: AuthRequest, res: Response): Promise<void> {
    try {
      await aiService.deleteContext(req.params.id);

      res.json({
        ok: true,
        msg: 'Context deleted successfully',
      });
    } catch (error) {
      console.error('Delete context error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async queryRAG(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query, contextId } = req.body;

      const results = await aiService.queryRAG(query, contextId);

      res.json({
        ok: true,
        data: results,
      });
    } catch (error) {
      console.error('RAG query error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async addDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, content, source, restaurantId, contextId } = req.body;

      await aiService.addDocument(title, content, source, restaurantId, contextId);

      res.status(201).json({
        ok: true,
        msg: 'Document added successfully',
      });
    } catch (error) {
      console.error('Add document error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { preferences, restrictions, restaurantId } = req.body;

      const response = await aiService.getMenuRecommendations(
        preferences,
        restrictions,
        restaurantId
      );

      res.json({
        ok: true,
        data: response,
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const aiController = new AIController();
export default aiController;
