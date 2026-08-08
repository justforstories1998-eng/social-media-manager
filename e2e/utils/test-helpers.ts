import { APIRequestContext } from '@playwright/test';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function createTestUser(request: APIRequestContext) {
  const email = `test-${Date.now()}@example.com`;
  const response = await request.post(`${API_BASE}/auth/register`, {
    data: {
      name: 'Test User',
      email,
      password: 'TestPassword123!',
    },
  });
  return { email, password: 'TestPassword123!', ...(await response.json()) };
}

export async function loginTestUser(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  return await response.json();
}

export async function cleanupTestUser(
  request: APIRequestContext,
  userId: string,
  token: string
) {
  await request.delete(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}