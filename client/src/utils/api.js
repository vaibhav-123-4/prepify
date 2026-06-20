const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

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
    const error = new Error(data.message || 'Something went wrong');
    error.status = res.status;
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

export const post = (endpoint, body) =>
  api(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const get = (endpoint) => api(endpoint);

/**
 * POST with FormData (multipart/form-data).
 * Do NOT set Content-Type — the browser sets it with the boundary.
 */
export const postFormData = (endpoint, formData) => {
  const token = localStorage.getItem('token');

  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = res.status;
      error.response = { status: res.status, data };
      throw error;
    }
    return data;
  });
};