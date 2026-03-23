import { API_URL } from './api';

export async function loginAdmin(payload: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/admin-auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login.');
  }

  return data;
}

export async function getAdminMe() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    throw new Error('Não autenticado.');
  }

  const response = await fetch(`${API_URL}/admin-auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar perfil.');
  }

  return data;
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_data');
}