import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Application security flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes a health endpoint', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('returns a token and sanitized user when credentials are valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' })
      .expect(201);

    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({
      email: 'admin@example.com',
      name: 'Admin User',
      roles: ['admin'],
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');

    const profileResponse = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);

    expect(profileResponse.body.email).toBe('admin@example.com');

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(201);

    expect(logoutResponse.body.message).toContain('Sesión cerrada');
  });

  it('prevents non-admin users from accessing the admin overview', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'user123' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(403);
  });
});
