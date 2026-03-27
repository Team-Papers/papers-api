import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, flushRateLimits, cleanupTestUsers } from './helpers';
import prisma from '../config/database';

afterAll(async () => {
  await cleanupTestUsers();
});

describe('GET /api/v1/categories', () => {
  beforeAll(async () => {
    await flushRateLimits();
  });

  it('should return all categories', async () => {
    const res = await api.get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return categories with expected shape', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/categories');

    expect(res.status).toBe(200);

    if (res.body.data.length > 0) {
      const category = res.body.data[0];
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
    }
  });
});

describe('GET /api/v1/categories/:id', () => {
  it('should return 404 for non-existent category', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/categories/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return a category by id if it exists', async () => {
    await flushRateLimits();
    const category = await prisma.category.findFirst();

    if (!category) {
      // No categories in test DB, skip gracefully
      return;
    }

    const res = await api.get(`/api/v1/categories/${category.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(category.id);
    expect(res.body.data.name).toBe(category.name);
  });
});

describe('GET /api/v1/categories/:id/books', () => {
  it('should return 404 for non-existent category books', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/categories/00000000-0000-0000-0000-000000000000/books');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return paginated books for a valid category', async () => {
    await flushRateLimits();
    const category = await prisma.category.findFirst();

    if (!category) {
      // No categories in test DB, skip gracefully
      return;
    }

    const res = await api.get(`/api/v1/categories/${category.id}/books`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('should accept pagination parameters for category books', async () => {
    await flushRateLimits();
    const category = await prisma.category.findFirst();

    if (!category) {
      return;
    }

    const res = await api.get(`/api/v1/categories/${category.id}/books?page=1&limit=5`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.limit).toBe(5);
  });
});
