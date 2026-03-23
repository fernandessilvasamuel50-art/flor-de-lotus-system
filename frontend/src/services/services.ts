import { API_URL } from './api';

export type Service = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  priceText?: string | null;
  durationMinutes: number;
  active: boolean;
  requiresImage?: boolean;
};

export type CreateServicePayload = {
  name: string;
  description?: string | null;
  price?: number | null;
  priceText?: string | null;
  durationMinutes: number;
  active?: boolean;
  requiresImage?: boolean;
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

function getAdminToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('admin_token');
  const adminData = localStorage.getItem('admin_data');

  if (!token || !adminData) {
    return null;
  }

  return token;
}

function buildAdminHeaders(includeJson = false): HeadersInit {
  const token = getAdminToken();

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`, {
    cache: 'no-store',
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error('Erro ao buscar serviços.');
  }

  return result;
}

export async function createService(
  data: CreateServicePayload,
): Promise<Service> {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: buildAdminHeaders(true),
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao criar serviço.');
  }

  return result;
}

export async function updateService(
  id: string,
  data: UpdateServicePayload,
): Promise<Service> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'PATCH',
    headers: buildAdminHeaders(true),
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao atualizar serviço.');
  }

  return result;
}

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: buildAdminHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao excluir serviço.');
  }
}