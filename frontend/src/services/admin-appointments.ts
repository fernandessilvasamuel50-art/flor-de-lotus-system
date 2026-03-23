import { API_URL } from './api';

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

export async function confirmAppointment(id: string) {
  const response = await fetch(`${API_URL}/appointments/${id}/confirm`, {
    method: 'PATCH',
    headers: buildAdminHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao confirmar agendamento.');
  }

  return result;
}

export async function cancelAppointment(id: string) {
  const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
    method: 'PATCH',
    headers: buildAdminHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao cancelar agendamento.');
  }

  return result;
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  startTime: string,
) {
  const response = await fetch(`${API_URL}/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: buildAdminHeaders(true),
    body: JSON.stringify({ date, startTime }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao reagendar agendamento.');
  }

  return result;
}

export async function completeAppointment(id: string, finalPrice?: number) {
  const response = await fetch(`${API_URL}/appointments/${id}/complete`, {
    method: 'PATCH',
    headers: buildAdminHeaders(true),
    body: JSON.stringify({ finalPrice }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao concluir atendimento.');
  }

  return result;
}

export async function markNoShow(id: string) {
  const response = await fetch(`${API_URL}/appointments/${id}/no-show`, {
    method: 'PATCH',
    headers: buildAdminHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao marcar não comparecimento.');
  }

  return result;
}

export async function deleteAppointment(id: string) {
  const response = await fetch(`${API_URL}/appointments/${id}/delete`, {
    method: 'PATCH',
    headers: buildAdminHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao excluir agendamento.');
  }

  return result;
}

export async function analyzeAppointment(
  id: string,
  payload: {
    estimatedMin?: number;
    estimatedMax?: number;
    evaluationNotes?: string;
  },
) {
  const response = await fetch(`${API_URL}/appointments/${id}/analyze`, {
    method: 'PATCH',
    headers: buildAdminHeaders(true),
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || 'Erro ao salvar análise.');
  }

  return result;
}