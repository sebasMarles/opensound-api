import { createServer } from 'http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './database/connection';
import { getEnv } from './config/env';
import { logger } from './config/logger';

const env = getEnv();

const bootstrap = async () => {
  try {
    await connectDatabase();
    const app = createApp();
    const server = createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`OpenSound API running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

void bootstrap();
