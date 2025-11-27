import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models';
import { AuthRequest } from '../interfaces';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        ok: false,
        msg: 'No token provided',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { uid: string };
    const user = await User.findById(decoded.uid);

    if (!user) {
      res.status(401).json({
        ok: false,
        msg: 'Invalid token - user not found',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        ok: false,
        msg: 'User is inactive',
      });
      return;
    }

    req.user = user;
    req.userId = decoded.uid;
    next();
  } catch (error) {
    res.status(401).json({
      ok: false,
      msg: 'Invalid token',
    });
  }
};

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        ok: false,
        msg: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        ok: false,
        msg: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export default authMiddleware;
