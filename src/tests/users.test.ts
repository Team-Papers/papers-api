import { describe, it, expect, afterAll } from 'vitest';
import { api, createAuthenticatedUser, flushRateLimits, cleanupTestUsers } from './helpers';

afterAll(async () => {
  await cleanupTestUsers();
});

describe('GET /api/v1/users/:id', () => {
  it('should return a user profile (public)', async () => {
    const { user } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.get(`/api/v1/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.email).toBe(user.email);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await api.get('/api/v1/users/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/users/:id', () => {
  it('should update own profile', async () => {
    const { user, accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .put(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated', lastName: 'Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('Updated');
    expect(res.body.data.lastName).toBe('Name');
  });

  it('should reject updating another user profile', async () => {
    const { accessToken } = await createAuthenticatedUser();
    const other = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .put(`/api/v1/users/${other.user.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('should reject without authentication', async () => {
    const { user } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.put(`/api/v1/users/${user.id}`).send({ firstName: 'NoAuth' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/v1/users/:id', () => {
  it('should delete own account', async () => {
    const { user, accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .delete(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // User should no longer exist
    await flushRateLimits();
    const getRes = await api.get(`/api/v1/users/${user.id}`);
    expect(getRes.status).toBe(404);
  });

  it('should reject deleting another user', async () => {
    const { accessToken } = await createAuthenticatedUser();
    const other = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .delete(`/api/v1/users/${other.user.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
  });
});
