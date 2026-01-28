import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import redis from '../config/redis';

export const api = request(app);

const TEST_EMAIL_PREFIX = 'test_';

export function testEmail(label: string) {
  return `${TEST_EMAIL_PREFIX}${label}_${Date.now()}@test.com`;
}

export async function registerUser(overrides: Record<string, string> = {}) {
  const email = overrides.email || testEmail('user');
  const res = await api.post('/api/v1/auth/register').send({
    email,
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  });
  return res;
}

export async function loginUser(email: string, password = 'Test1234!') {
  const res = await api.post('/api/v1/auth/login').send({ email, password });
  return res;
}

export async function createAuthenticatedUser(overrides: Record<string, string> = {}) {
  const res = await registerUser(overrides);
  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

export async function createAdminUser() {
  const email = testEmail('admin');
  const reg = await registerUser({ email });
  // Promote to ADMIN
  await prisma.user.update({
    where: { id: reg.body.data.user.id },
    data: { role: 'ADMIN' },
  });
  // Re-login to get token with ADMIN role
  const login = await loginUser(email);
  return {
    user: login.body.data.user,
    accessToken: login.body.data.accessToken,
    refreshToken: login.body.data.refreshToken,
  };
}

export async function flushRateLimits() {
  const keys = await redis.keys('rl:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function cleanupTestUsers() {
  // Delete all test users created during tests
  await prisma.refreshToken.deleteMany({
    where: { user: { email: { startsWith: TEST_EMAIL_PREFIX } } },
  });
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
}
