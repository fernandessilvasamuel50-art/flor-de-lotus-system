import { API_URL } from './api';

type UpdateCustomerPayload = {
  name?: string;
  email?: string;
  phone?: string;
};

function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

export async function registerCustomer(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/customer-auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao cadastrar cliente.');
  }

  return data;
}

export async function loginCustomer(payload: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/customer-auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao entrar.');
  }

  return data;
}

export async function getCustomerMe(token: string) {
  const response = await fetch(`${API_URL}/customer-auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar perfil.');
  }

  return data;
}

export async function updateCustomerProfile(data: UpdateCustomerPayload) {
  const token = getCustomerToken();

  if (!token) {
    throw new Error('Cliente não autenticado.');
  }

  const response = await fetch(`${API_URL}/customer-auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Erro ao atualizar dados.');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('customer_data', JSON.stringify(result));
  }

  return result;
}

export async function getCustomerDashboard(token: string) {
  const response = await fetch(`${API_URL}/customer-auth/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar painel do cliente.');
  }

  return data;
}