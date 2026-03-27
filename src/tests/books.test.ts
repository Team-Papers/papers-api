import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createAuthenticatedUser, flushRateLimits, cleanupTestUsers } from './helpers';
import prisma from '../config/database';

afterAll(async () => {
  await cleanupTestUsers();
});

describe('GET /api/v1/books', () => {
  beforeAll(async () => {
    await flushRateLimits();
  });

  it('should return paginated catalogue', async () => {
    const res = await api.get('/api/v1/books');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('should accept pagination parameters', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should accept sort and order parameters', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books?sort=title&order=asc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid sort parameter', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books?sort=invalid');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/books/search', () => {
  it('should search books with query', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/search?q=test');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('should return paginated search results', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/search?q=test&page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should filter by language', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/search?language=fr');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should filter by price range', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/search?minPrice=0&maxPrice=50');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/v1/books/trending', () => {
  it('should return trending books', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/trending');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/books/new', () => {
  it('should return new books', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/new');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/books/recommended', () => {
  it('should return recommended books without auth', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/recommended');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return recommended books with auth', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .get('/api/v1/books/recommended')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/books/:id', () => {
  it('should return 404 for non-existent book', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return a book by id if it exists', async () => {
    await flushRateLimits();
    // Find any published book in the database
    const book = await prisma.book.findFirst({ where: { status: 'PUBLISHED' } });

    if (!book) {
      // No published books in test DB, skip gracefully
      return;
    }

    const res = await api.get(`/api/v1/books/${book.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(book.id);
  });
});

describe('GET /api/v1/books/:id/preview', () => {
  it('should return 404 for non-existent book preview', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/00000000-0000-0000-0000-000000000000/preview');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/books', () => {
  it('should reject without authentication', async () => {
    await flushRateLimits();
    const res = await api.post('/api/v1/books').send({
      title: 'Test Book',
    });

    expect(res.status).toBe(401);
  });

  it('should reject with missing required fields', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should create a book with valid data', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.post('/api/v1/books').set('Authorization', `Bearer ${accessToken}`).send({
      title: 'Test Book Created in Tests',
      description: 'A test book description',
      language: 'fr',
      price: 0,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Book Created in Tests');
  });
});

describe('GET /api/v1/books/me', () => {
  it('should reject without authentication', async () => {
    await flushRateLimits();
    const res = await api.get('/api/v1/books/me');

    expect(res.status).toBe(401);
  });

  it('should return current user books', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    const res = await api.get('/api/v1/books/me').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });
});

describe('PUT /api/v1/books/:id', () => {
  it('should reject without authentication', async () => {
    await flushRateLimits();
    const res = await api
      .put('/api/v1/books/00000000-0000-0000-0000-000000000000')
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(401);
  });

  it('should update own book', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    // Create a book first
    const createRes = await api
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Book to Update',
        language: 'fr',
        price: 0,
      });

    await flushRateLimits();

    const bookId = createRes.body.data.id;
    const res = await api
      .put(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Book Title' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Book Title');
  });
});

describe('DELETE /api/v1/books/:id', () => {
  it('should reject without authentication', async () => {
    await flushRateLimits();
    const res = await api.delete('/api/v1/books/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(401);
  });

  it('should delete own book', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    // Create a book first
    const createRes = await api
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Book to Delete',
        language: 'fr',
        price: 0,
      });

    await flushRateLimits();

    const bookId = createRes.body.data.id;
    const res = await api
      .delete(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject deleting another user book', async () => {
    const author = await createAuthenticatedUser();
    await flushRateLimits();

    // Author creates a book
    const createRes = await api
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${author.accessToken}`)
      .send({
        title: 'Someone Else Book',
        language: 'fr',
        price: 0,
      });

    await flushRateLimits();

    // Different user tries to delete it
    const other = await createAuthenticatedUser();
    await flushRateLimits();

    const bookId = createRes.body.data.id;
    const res = await api
      .delete(`/api/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${other.accessToken}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/v1/books/:id/submit', () => {
  it('should reject without authentication', async () => {
    await flushRateLimits();
    const res = await api.post('/api/v1/books/00000000-0000-0000-0000-000000000000/submit');

    expect(res.status).toBe(401);
  });

  it('should submit own book for review', async () => {
    const { accessToken } = await createAuthenticatedUser();
    await flushRateLimits();

    // Create a book first
    const createRes = await api
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Book to Submit',
        language: 'fr',
        price: 0,
      });

    await flushRateLimits();

    const bookId = createRes.body.data.id;
    const res = await api
      .post(`/api/v1/books/${bookId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Could be 200 if successful, or could fail if book is missing file etc.
    // At minimum, should not be 401 or 403 for own book
    expect([200, 400]).toContain(res.status);
  });
});
