import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ddscc_secret_fallback_key_2026_super_secure_placement_chamber';

export interface TokenPayload {
  userId: string;
  username: string;
}

/**
 * Encodes a user payload into a JWT signed token with a 7-day persistent expiration
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Decodes a token string and verifies its signature, returning the payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
