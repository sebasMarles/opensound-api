import mongoose from 'mongoose';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

mongoose.set('strictQuery', true);

const env = getEnv();

export const connectDatabase = async (): Promise<void> => {
  const connectWithRetry = async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error({ error }, 'MongoDB connection error. Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };

  await connectWithRetry();

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnection...');
    void connectWithRetry();
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
};
