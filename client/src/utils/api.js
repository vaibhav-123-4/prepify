const API_BASE = import.meta.env.VITE_API_URL + '/api';

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const post = (endpoint, body) =>
  api(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const get = (endpoint) => api(endpoint);