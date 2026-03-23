import { API_URL } from './api';

export type CreateAppointmentPayload = {
  serviceIds: string[];
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  imageUrl?: string;
  notes?: string;
};

function getCustomerToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('customer_token');
  const customerData = localStorage.getItem('customer_data');

  // Só envia token se os dois existirem.
  // Isso reduz a chance de mandar token órfão/velho sem contexto.
  if (!token || !customerData) {
    return null;
  }

  return token;
}

export async function createAppointment(data: CreateAppointmentPayload) {
  const token = getCustomerToken();

  const response = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Erro ao criar agendamento.');
  }

  return result;
}

export async function getAvailability(date: string, serviceIds: string[]) {
  const query = new URLSearchParams({
    date,
    serviceIds: serviceIds.join(','),
  }).toString();

  const response = await fetch(`${API_URL}/availability?${query}`, {
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Erro ao carregar horários disponíveis.',
    );
  }

  return result;
}