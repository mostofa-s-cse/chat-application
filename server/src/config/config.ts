import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  databaseUrl: process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/chat_app',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}; 