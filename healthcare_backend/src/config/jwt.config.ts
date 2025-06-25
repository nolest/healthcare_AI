export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'healthcare-system-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}; 