import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createAuthenticatedUser, flushRateLimits, cleanupTestUsers } from './helpers';

afterAll(async () => {
  await cleanupTestUsers();
});

describe('GET /api/v1/notifications', () => {
  beforeAll(async () => {
    await flushRateLimits();
  });

  it('should reject without authentication', async () => {
    const res = await api.get('/api/v1/notifications');

    expect(res.status).toBe(401);
  });

  it('should return paginated notifications for authenticated user', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('should accept pagination parameters', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/notifications?page=1&limit=5')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should accept unreadOnly filter', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/notifications?unreadOnly=true')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/v1/notifications/unread-count', () => {
  it('should reject without authentication', async () => {
    const res = await api.get('/api/v1/notifications/unread-count');

    expect(res.status).toBe(401);
  });

  it('should return unread count for authenticated user', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeDefined();
    expect(typeof res.body.data.count).toBe('number');
  });

  it('should return 0 for new user with no notifications', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(0);
  });
});

describe('POST /api/v1/notifications/mark-all-read', () => {
  it('should reject without authentication', async () => {
    const res = await api.post('/api/v1/notifications/mark-all-read');

    expect(res.status).toBe(401);
  });

  it('should mark all notifications as read', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .post('/api/v1/notifications/mark-all-read')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify unread count is now 0
    await flushRateLimits();
    const countRes = await api
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(countRes.status).toBe(200);
    expect(countRes.body.data.count).toBe(0);
  });
});

describe('DELETE /api/v1/notifications/clear-read', () => {
  it('should reject without authentication', async () => {
    const res = await api.delete('/api/v1/notifications/clear-read');

    expect(res.status).toBe(401);
  });

  it('should clear read notifications', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .delete('/api/v1/notifications/clear-read')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PATCH /api/v1/notifications/:id/read', () => {
  it('should reject without authentication', async () => {
    const res = await api.patch('/api/v1/notifications/00000000-0000-0000-0000-000000000000/read');

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent notification', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .patch('/api/v1/notifications/00000000-0000-0000-0000-000000000000/read')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/v1/notifications/:id', () => {
  it('should reject without authentication', async () => {
    const res = await api.delete('/api/v1/notifications/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent notification', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .delete('/api/v1/notifications/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
