import { generateToken, verifyToken } from '../src/utils';

describe('JWT Utils', () => {
  const testUserId = '507f1f77bcf86cd799439011';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUserId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testUserId);
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.uid).toBe(testUserId);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
