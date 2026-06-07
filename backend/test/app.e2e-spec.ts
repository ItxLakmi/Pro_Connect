import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Pro_Connect API (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let createdJobId: string;

  // ─── Setup ────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Health Check ──────────────────────────────────────────────────────────
  describe('GET / (Health Check)', () => {
    it('should return 200', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });
  });

  // ─── Auth: Register ────────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    const testEmail = `e2e_${Date.now()}@proconnect.test`;

    it('should register a new user and return access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Test@1234',
          firstName: 'E2E',
          lastName: 'Tester',
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      authToken = res.body.access_token;
    });

    it('should return 409 Conflict when registering with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Test@1234',
          firstName: 'Dup',
          lastName: 'User',
        })
        .expect(409);
    });
  });

  // ─── Auth: Login ───────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should login and return access_token', async () => {
      // Register fresh user for login test
      const email = `login_${Date.now()}@proconnect.test`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Login@1234', firstName: 'Login', lastName: 'Test' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Login@1234' })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(email);
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@proconnect.test', password: 'wrongpass' })
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      const email = `wrongpass_${Date.now()}@proconnect.test`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Correct@123', firstName: 'W', lastName: 'P' });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'WrongPassword' })
        .expect(401);
    });
  });

  // ─── Jobs: Public Endpoints ────────────────────────────────────────────────
  describe('GET /jobs', () => {
    it('should return array of jobs (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should support search query param', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs?search=developer')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should support pagination with skip and take', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs?skip=0&take=5')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
    });
  });

  // ─── Jobs: Protected Endpoints ─────────────────────────────────────────────
  describe('POST /jobs (protected)', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/jobs')
        .send({ title: 'Test Job', description: 'Desc', location: 'Remote', type: 'FULL_TIME' })
        .expect(401);
    });

    it('should create a job with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'E2E Test Job',
          description: 'A job created during E2E testing',
          location: 'Remote',
          type: 'FULL_TIME',
          salaryRange: '80k-100k',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('E2E Test Job');
      createdJobId = res.body.id;
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return a single job by id', async () => {
      if (!createdJobId) return;
      const res = await request(app.getHttpServer())
        .get(`/jobs/${createdJobId}`)
        .expect(200);

      expect(res.body.id).toBe(createdJobId);
    });
  });

  describe('GET /jobs/me (protected)', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/jobs/me')
        .expect(401);
    });

    it('should return my jobs with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should delete the created job', async () => {
      if (!createdJobId) return;
      await request(app.getHttpServer())
        .delete(`/jobs/${createdJobId}`)
        .expect(200);
    });
  });
});
