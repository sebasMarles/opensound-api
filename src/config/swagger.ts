import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';
import { openApiComponents, openApiPaths } from '../docs/openapi';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'OpenSound API',
      version,
      description: 'REST API for the OpenSound mobile application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: openApiPaths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      ...openApiComponents,
    },
  },
  apis: [],
});
