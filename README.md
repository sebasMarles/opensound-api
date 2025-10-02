# OpenSound API

Backend REST API for the OpenSound mobile application. Built with Node.js, Express, TypeScript and MongoDB. The API provides authentication, playlist management, JWT-based session handling and Swagger documentation.

## Features

- Express.js + TypeScript with strict linting and formatting rules (ESLint + Prettier).
- MongoDB integration via Mongoose with resilient connection handling.
- User authentication with bcrypt password hashing and short-lived access tokens + long-lived refresh tokens.
- Refresh token persistence for revocation and session management.
- Playlist CRUD operations with per-track management, ordering and public/private visibility controls.
- Input validation with Zod DTOs.
- Global error handling, security middleware (Helmet, CORS, Mongo sanitization) and request logging.
- Swagger documentation exposed at `/docs`.
- Jest unit tests using `mongodb-memory-server` for isolated in-memory testing.
- Husky pre-commit hook enforcing linting and tests.

## Getting started

### Prerequisites

- Node.js 18.18+
- npm 9+
- A MongoDB Atlas cluster with an `opensound` database.

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file based on the provided `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/opensound?retryWrites=true&w=majority
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGINS=https://opensound.icu,exp://127.0.0.1:19000
```

- `ACCESS_TOKEN_TTL` and `REFRESH_TOKEN_TTL` accept [zeit/ms](https://github.com/vercel/ms) syntax such as `15m`, `1h`, `7d`.
- `CORS_ORIGINS` is a comma-separated list of allowed origins in addition to the defaults (`https://opensound.icu`, Expo dev URLs).

### Development workflow

Run the API in watch mode using `nodemon` + `ts-node`:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

### Quality gates

```bash
npm run lint    # ESLint static analysis
npm run lint:fix
npm run format  # Prettier formatting
npm test        # Jest unit tests
```

Husky automatically runs `npm run lint` and `npm test` before every commit.

### API documentation

Swagger UI is available at [`/docs`](http://localhost:3000/docs) once the server is running. The OpenAPI schema is generated from route annotations.

## Project structure

```
src/
  app.ts                # Express app factory
  server.ts             # HTTP bootstrapper
  config/               # Environment, logger, CORS, Swagger
  database/             # Mongoose connection + models
  middleware/           # Auth, validation, error handling, logging
  modules/
    auth/               # Auth controllers, DTOs, services, routes
    playlists/          # Playlist controllers, DTOs, services, routes
  routes/               # API route registration
  utils/                # JWT, password hashing, response helpers
  types/                # Type augmentation declarations
```

Tests live under `tests/` and rely on `mongodb-memory-server` for fast in-memory integration testing.

## Deployment guide

### 1. Build the production bundle

```bash
npm run build
```

This outputs compiled JavaScript to `dist/`.

### 2. Containerization (recommended)

Create a Dockerfile similar to:

```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY .env.production ./.env
CMD ["node", "dist/server.js"]
```

Build and push the image to ECR:

```bash
aws ecr create-repository --repository-name opensound-api
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t opensound-api .
docker tag opensound-api:latest <account>.dkr.ecr.<region>.amazonaws.com/opensound-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/opensound-api:latest
```

> Replace `<region>` and `<account>` with your AWS account details.

### 3a. Deploy with Elastic Beanstalk

1. Create an Elastic Beanstalk application and environment (Node.js platform).
2. Configure environment variables in the EB console (same as `.env`).
3. Upload the production bundle (or Docker image if using a Docker platform).
4. Enable rolling updates and health checks.

### 3b. Deploy with Amazon ECS (Fargate)

1. Create an ECS cluster using Fargate.
2. Define a task definition referencing the pushed ECR image, exposing port `3000`.
3. Configure environment variables in the task definition.
4. Set up a service with an Application Load Balancer (ALB) pointing to port `3000`.
5. Enable auto-scaling rules based on CPU/Memory.

### 4. Domain configuration (`opensound.icu`)

1. In Route 53 (or your DNS provider), create an `A` record pointing `opensound.icu` to the ALB or EB environment endpoint.
2. If using HTTPS, provision an ACM certificate for `opensound.icu` and attach it to the ALB/EB environment.
3. Update CORS origins to include the production domain if necessary.

### Observability & monitoring

- Logs: the API uses Pino for structured logging. Ship logs to CloudWatch or another aggregation tool in production.
- Metrics: integrate AWS CloudWatch alarms on CPU, memory, and 5xx error rates.
- Backups: enable automated backups on the MongoDB Atlas cluster.

## Testing locally

The Jest suite relies on `mongodb-memory-server` and runs without touching Atlas. Execute:

```bash
npm test
```

## Contribution & onboarding notes

- DTO validation lives next to each module under `src/modules/**/dto`.
- All responses are wrapped using the helper in `src/utils/response.ts` to maintain a consistent `{ success, data, message }` shape.
- When adding new routes, remember to:
  - Create a Zod schema for the request payload.
  - Register the route under `/api/v1/<module>`.
  - Update Swagger annotations if you add new modules/endpoints.
- Long-lived refresh tokens are persisted in MongoDB. Revoke tokens by deleting documents from the `refreshtokens` collection when required (e.g., from an admin tool).

## License

Private – All rights reserved.
