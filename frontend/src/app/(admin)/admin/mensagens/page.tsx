'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UiToast } from '@/components/ui-toast';
import {
  AdminConversationDetail,
  AdminConversationSummary,
  ChatMessage,
  getAdminConversation,
  listAdminConversations,
  markAdminConversationAsRead,
  sendAdminMessage,
} from '@/services/messages';

const MAX_MESSAGE_LENGTH = 2000;

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const date = new Date(value).getTime();
  const diffInSeconds = Math.max(1, Math.floor((Date.now() - date) / 1000));

  if (diffInSeconds < 60) return 'agora';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} h`;

  if (diffInHours < 48) return 'ontem';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function previewMessage(message: ChatMessage | null) {
  if (!message) return 'Conversa sem mensagens.';
  const normalized = message.content.trim().replace(/\s+/g, ' ');
  return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}

export default function AdminMensagensPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [conversations, setConversations] = useState<
    AdminConversationSummary[]
  >([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [conversation, setConversation] =
    useState<AdminConversationDetail | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastOpen(true);

    window.setTimeout(() => {
      setToastOpen(false);
    }, 2500);
  }, []);

  const loadConversationList = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoadingList(true);
        const data = await listAdminConversations();

        setConversations(data.conversations);
        setTotalUnread(data.unreadCount);

        if (!selectedConversationId && data.conversations.length > 0) {
          setSelectedConversationId(data.conversations[0].id);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao buscar conversas.';
        setErrorMessage(message);
      } finally {
        if (showLoading) setLoadingList(false);
      }
    },
    [selectedConversationId],
  );

  const loadConversation = useCallback(
    async (conversationId: string, showLoading = false) => {
      try {
        if (showLoading) setLoadingConversation(true);
        setErrorMessage('');

        const data = await getAdminConversation(conversationId);
        setConversation(data);

        if (data.unreadCount > 0) {
          await markAdminConversationAsRead(conversationId);
          await loadConversationList(false);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao abrir conversa.';
        setErrorMessage(message);
      } finally {
        if (showLoading) setLoadingConversation(false);
      }
    },
    [loadConversationList],
  );

  useEffect(() => {
    loadConversationList(true);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadConversationList(false);
      }
    }, 8000);

    return () => window.clearInterval(interval);
  }, [loadConversationList]);

  useEffect(() => {
    if (!selectedConversationId) return;

    loadConversation(selectedConversationId, true);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadConversation(selectedConversationId, false);
      }
    }, 7000);

    return () => window.clearInterval(interval);
  }, [loadConversation, selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  async function handleSubmit() {
    const normalizedContent = content.trim();

    if (!normalizedContent || sending || !selectedConversationId) return;

    if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(
        `A resposta deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
      );
      return;
    }

    try {
      setSending(true);
      setErrorMessage('');
      const message = await sendAdminMessage(
        selectedConversationId,
        normalizedContent,
      );
      setConversation((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, message],
            }
          : current,
      );
      setContent('');
      showToast('Resposta enviada.');
      await loadConversationList(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao enviar resposta.';
      setErrorMessage(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="text-[#7A624D]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
            Atendimento online
          </p>
          <h1 className="text-4xl font-semibold">Mensagens</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
            Acompanhe conversas dos clientes e responda pelo sistema.
          </p>
        </div>

        <div className="rounded-full border border-[#E8DDD1] bg-white px-4 py-2 text-sm text-[#8B735C] shadow-sm">
          <strong className="text-[#7A624D]">{totalUnread}</strong> não lidas
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid min-h-[620px] overflow-hidden rounded-[32px] border border-[#E8DDD1] bg-white shadow-sm xl:grid-cols-[360px_1fr]">
        <aside className="border-b border-[#E8DDD1] bg-[#FFF9F6] xl:border-b-0 xl:border-r">
          <div className="border-b border-[#E8DDD1] px-5 py-4">
            <h2 className="text-xl font-semibold">Conversas</h2>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-3">
            {loadingList ? (
              <div className="rounded-2xl border border-dashed border-[#DCCDBE] bg-white px-4 py-3 text-sm text-[#8B735C]">
                Carregando conversas...
              </div>
            ) : conversations.length === 0 ? (
              <div className="rounded-[24px] border border-[#E8DDD1] bg-white px-5 py-8 text-center">
                <p className="text-3xl">💬</p>
                <p className="mt-3 text-sm leading-6 text-[#8B735C]">
                  Nenhuma conversa foi iniciada ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {conversations.map((item) => {
                  const selected = item.id === selectedConversationId;
                  const unread = item.unreadCount > 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedConversationId(item.id)}
                      className={`rounded-[22px] border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-[#BFA58A] bg-white'
                          : 'border-transparent bg-transparent hover:bg-white'
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#7A624D]">
                            {unread ? '● ' : ''}
                            {item.customer.name}
                          </p>
                          <p className="truncate text-xs text-[#8B735C]">
                            {item.customer.email || 'Sem e-mail'} ·{' '}
                            {item.customer.phone}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-[#A98C72]">
                          {formatRelativeTime(item.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`min-w-0 truncate text-sm ${
                            unread
                              ? 'font-semibold text-[#7A624D]'
                              : 'text-[#8B735C]'
                          }`}
                        >
                          {previewMessage(item.lastMessage)}
                        </p>
                        {unread ? (
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#B8897F] px-2 text-xs font-semibold text-white">
                            {item.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-[620px] flex-col">
          {conversation ? (
            <>
              <div className="border-b border-[#E8DDD1] px-6 py-5">
                <h2 className="text-2xl font-semibold">
                  {conversation.customer.name}
                </h2>
                <p className="mt-1 text-sm text-[#8B735C]">
                  {conversation.customer.email || 'Sem e-mail'} ·{' '}
                  {conversation.customer.phone}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#FCFAF8] px-4 py-6 sm:px-6">
                {loadingConversation ? (
                  <div className="rounded-2xl border border-dashed border-[#DCCDBE] bg-white px-5 py-4 text-sm text-[#8B735C]">
                    Abrindo conversa...
                  </div>
                ) : conversation.messages.length === 0 ? (
                  <div className="mx-auto mt-12 max-w-md rounded-[28px] border border-[#E8DDD1] bg-white px-6 py-8 text-center shadow-sm">
                    <p className="text-4xl">💬</p>
                    <h3 className="mt-4 text-2xl font-semibold">
                      Conversa sem mensagens
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.messages.map((message) => {
                      const isAdmin = message.senderType === 'ADMIN';

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-[24px] px-5 py-4 shadow-sm sm:max-w-[72%] ${
                              isAdmin
                                ? 'bg-[#BFA58A] text-white'
                                : 'border border-[#E8DDD1] bg-white text-[#7A624D]'
                            }`}
                          >
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                              {isAdmin ? 'Sublime Pés' : conversation.customer.name}
                            </p>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.content}
                            </p>
                            <p className="mt-3 text-right text-[11px] opacity-75">
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-[#E8DDD1] bg-white p-4 sm:p-6">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={3}
                  placeholder="Digite sua resposta..."
                  className="w-full resize-none rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#BFA58A]"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#8B735C]">
                    {content.length}/{MAX_MESSAGE_LENGTH} caracteres
                  </p>
                  <button
                    type="button"
                    disabled={sending || !content.trim()}
                    onClick={handleSubmit}
                    className="rounded-full bg-[#BFA58A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? 'Enviando...' : 'Enviar resposta'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[620px] items-center justify-center bg-[#FCFAF8] p-6">
              <div className="max-w-md rounded-[28px] border border-[#E8DDD1] bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-4xl">💬</p>
                <h2 className="mt-4 text-2xl font-semibold">
                  Selecione uma conversa
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#8B735C]">
                  As mensagens dos clientes aparecerão aqui assim que forem
                  enviadas.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <UiToast open={toastOpen} message={toastMessage} />
    </main>
  );
}
