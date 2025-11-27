import { Response } from 'express';
import { User } from '../models';
import { AuthRequest } from '../interfaces';
import { generateToken } from '../utils';

export class AuthController {
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({
          ok: false,
          msg: 'Invalid credentials',
        });
        return;
      }

      const validPassword = await user.comparePassword(password);
      if (!validPassword) {
        res.status(401).json({
          ok: false,
          msg: 'Invalid credentials',
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

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id.toString());

      res.json({
        ok: true,
        msg: 'Login successful',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          ok: false,
          msg: 'Email already registered',
        });
        return;
      }

      const user = new User({
        email,
        password,
        name,
        phone,
        role: role || 'CUSTOMER',
      });

      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        ok: true,
        msg: 'User registered successfully',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          ok: false,
          msg: 'Not authenticated',
        });
        return;
      }

      const token = generateToken(req.user._id.toString());

      res.json({
        ok: true,
        msg: 'Token refreshed',
        data: {
          token,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({
        ok: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, phone, avatar } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { name, phone, avatar },
        { new: true }
      );

      res.json({
        ok: true,
        msg: 'Profile updated',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Server error',
      });
    }
  }
}

export const authController = new AuthController();
export default authController;
