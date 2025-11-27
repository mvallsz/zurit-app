import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (uid: string): string => {
  const options: SignOptions = {
    expiresIn: '24h',
  };
  return jwt.sign({ uid }, config.jwtSecret as Secret, options);
};

export const verifyToken = (token: string): { uid: string } | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as { uid: string };
  } catch {
    return null;
  }
};

export default { generateToken, verifyToken };
