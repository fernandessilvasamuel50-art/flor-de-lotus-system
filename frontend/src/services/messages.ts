import { API_URL } from './api';

export type MessageSender = 'CUSTOMER' | 'ADMIN';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: MessageSender;
  content: string;
  readAt?: string | null;
  createdAt: string;
};

export type CustomerConversation = {
  conversationId: string | null;
  unreadCount: number;
  messages: ChatMessage[];
};

export type AdminConversationSummary = {
  id: string;
  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone: string;
  };
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
};

export type AdminConversationList = {
  unreadCount: number;
  conversations: AdminConversationSummary[];
};

export type AdminConversationDetail = {
  id: string;
  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone: string;
  };
  messages: ChatMessage[];
  unreadCount: number;
  updatedAt: string;
};

function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data as T;
}

function customerHeaders(json = false): HeadersInit {
  const token = getCustomerToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function adminHeaders(json = false): HeadersInit {
  const token = getAdminToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCustomerConversation() {
  const response = await fetch(`${API_URL}/messages/customer`, {
    headers: customerHeaders(),
    cache: 'no-store',
  });

  return parseResponse<CustomerConversation>(
    response,
    'Erro ao buscar mensagens.',
  );
}

export async function sendCustomerMessage(content: string) {
  const response = await fetch(`${API_URL}/messages/customer`, {
    method: 'POST',
    headers: customerHeaders(true),
    body: JSON.stringify({ content }),
  });

  return parseResponse<ChatMessage>(response, 'Erro ao enviar mensagem.');
}

export async function markCustomerMessagesAsRead() {
  const response = await fetch(`${API_URL}/messages/customer/read`, {
    method: 'PATCH',
    headers: customerHeaders(),
  });

  return parseResponse<{ count: number }>(
    response,
    'Erro ao marcar mensagens como lidas.',
  );
}

export async function listAdminConversations() {
  const response = await fetch(`${API_URL}/messages/admin/conversations`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });

  return parseResponse<AdminConversationList>(
    response,
    'Erro ao buscar conversas.',
  );
}

export async function getAdminConversation(conversationId: string) {
  const response = await fetch(
    `${API_URL}/messages/admin/conversations/${conversationId}`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );

  return parseResponse<AdminConversationDetail>(
    response,
    'Erro ao abrir conversa.',
  );
}

export async function sendAdminMessage(conversationId: string, content: string) {
  const response = await fetch(
    `${API_URL}/messages/admin/conversations/${conversationId}`,
    {
      method: 'POST',
      headers: adminHeaders(true),
      body: JSON.stringify({ content }),
    },
  );

  return parseResponse<ChatMessage>(response, 'Erro ao enviar resposta.');
}

export async function markAdminConversationAsRead(conversationId: string) {
  const response = await fetch(
    `${API_URL}/messages/admin/conversations/${conversationId}/read`,
    {
      method: 'PATCH',
      headers: adminHeaders(),
    },
  );

  return parseResponse<{ count: number }>(
    response,
    'Erro ao marcar conversa como lida.',
  );
}
