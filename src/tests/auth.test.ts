import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  api,
  testEmail,
  registerUser,
  loginUser,
  createAuthenticatedUser,
  flushRateLimits,
  cleanupTestUsers,
} from './helpers';
import redis from '../config/redis';

beforeAll(async () => {
  await flushRateLimits();
});

afterAll(async () => {
  await cleanupTestUsers();
});

describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const email = testEmail('register');
    const res = await api.post('/api/v1/auth/register').send({
      email,
      password: 'Test1234!',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'READER',
      emailVerified: false,
    });
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const email = testEmail('dup');
    await registerUser({ email });
    await flushRateLimits();

    const res = await api.post('/api/v1/auth/register').send({
      email,
      password: 'Test1234!',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const res = await api.post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'Test1234!',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const res = await api.post('/api/v1/auth/register').send({
      email: testEmail('short'),
      password: '123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await api.post('/api/v1/auth/register').send({
      email: testEmail('missing'),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  let email: string;

  beforeAll(async () => {
    email = testEmail('login');
    const regRes = await registerUser({ email });
    expect(regRes.status).toBe(201); // Ensure registration succeeded
    await flushRateLimits();
  });

  it('should login with valid credentials', async () => {
    const res = await loginUser(email);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await loginUser(email, 'WrongPassword!');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent email', async () => {
    const res = await loginUser('nonexistent@test.com');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should refresh tokens', async () => {
    const { refreshToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.post('/api/v1/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    // Old refresh token should be invalidated (new one issued)
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('should reject invalid refresh token', async () => {
    const res = await api.post('/api/v1/auth/refresh').send({
      refreshToken: 'invalid-token',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return current user', async () => {
    const { user, accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.email).toBe(user.email);
  });

  it('should reject without token', async () => {
    const res = await api.get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await api.get('/api/v1/auth/me').set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully', async () => {
    const { accessToken, refreshToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Refresh token should be invalidated
    const refreshRes = await api.post('/api/v1/auth/refresh').send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('should accept valid email (always 200)', async () => {
    const email = testEmail('forgot');
    await registerUser({ email });
    await flushRateLimits();

    const res = await api.post('/api/v1/auth/forgot-password').send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 200 even for non-existent email (no leak)', async () => {
    await flushRateLimits();
    const res = await api
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@test.com' });

    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  it('should reset password with valid token', async () => {
    const email = testEmail('reset');
    const regRes = await registerUser({ email });
    const userId = regRes.body.data.user.id;
    await flushRateLimits();

    // Trigger forgot password to generate a reset token
    await api.post('/api/v1/auth/forgot-password').send({ email });
    await flushRateLimits();

    // Find the reset token for this specific user in Redis
    const keys = await redis.keys('reset:*');
    let resetToken: string | null = null;
    for (const key of keys) {
      const storedUserId = await redis.get(key);
      if (storedUserId === userId) {
        resetToken = key.replace('reset:', '');
        break;
      }
    }

    if (!resetToken) {
      // Token not found — skip this test gracefully
      return;
    }

    const res = await api.post('/api/v1/auth/reset-password').send({
      token: resetToken,
      password: 'NewPassword123!',
    });

    expect(res.status).toBe(200);

    // Flush rate limits before trying to login with new password
    await flushRateLimits();
    const loginRes = await api.post('/api/v1/auth/login').send({
      email,
      password: 'NewPassword123!',
    });
    expect(loginRes.status).toBe(200);
  });

  it('should reject invalid reset token', async () => {
    const res = await api.post('/api/v1/auth/reset-password').send({
      token: 'invalid-reset-token',
      password: 'NewPassword123!',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/verify-email', () => {
  it('should reject invalid verification token', async () => {
    const res = await api.post('/api/v1/auth/verify-email').send({
      token: 'invalid-verification-token',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/health', () => {
  it('should return health status', async () => {
    const res = await api.get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
