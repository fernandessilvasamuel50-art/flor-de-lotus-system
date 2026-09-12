import { API_URL } from './api';

type AdminServicePayload = {
  name: string;
  description?: string;
  price?: number | null;
  priceText?: string | null;
  durationMinutes: number;
  active: boolean;
  requiresImage?: boolean;
};

function getAdminToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('admin_token');
  const adminData = localStorage.getItem('admin_data');

  if (!token || !adminData) return null;

  return token;
}

function buildHeaders(json = false): HeadersInit {
  const token = getAdminToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminServices() {
  const response = await fetch(`${API_URL}/services/admin/all`, {
    headers: buildHeaders(),
    cache: 'no-store',
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao buscar serviços.');
  }

  return result;
}

export async function createAdminService(payload: AdminServicePayload) {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao criar serviço.');
  }

  return result;
}

export async function updateAdminService(
  id: string,
  payload: AdminServicePayload,
) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'PATCH',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao atualizar serviço.');
  }

  return result;
}

export async function deleteAdminService(id: string) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao excluir serviço.');
  }

  return result;
}
