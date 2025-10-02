import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { corsOptions } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import v1Routes from './routes/v1';
import { requestLogger } from './middleware/request-logger';
import { swaggerSpec } from './config/swagger';
import { getEnv } from './config/env';

export const createApp = () => {
  const app = express();
  const env = getEnv();

  app.set('trust proxy', true);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: env.NODE_ENV });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/v1', v1Routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
