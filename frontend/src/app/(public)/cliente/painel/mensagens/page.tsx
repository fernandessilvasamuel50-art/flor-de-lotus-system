'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UiToast } from '@/components/ui-toast';
import {
  ChatMessage,
  getCustomerConversation,
  markCustomerMessagesAsRead,
  sendCustomerMessage,
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

export default function ClienteMensagensPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
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

  const redirectToLogin = useCallback(() => {
    router.push(
      `/cliente/login?redirect=${encodeURIComponent('/cliente/painel/mensagens')}`,
    );
  }, [router]);

  const loadMessages = useCallback(
    async (showLoading = false) => {
      const token = localStorage.getItem('customer_token');

      if (!token) {
        redirectToLogin();
        return;
      }

      try {
        if (showLoading) setLoading(true);
        setErrorMessage('');

        const conversation = await getCustomerConversation();
        setMessages(conversation.messages);

        if (conversation.unreadCount > 0) {
          await markCustomerMessagesAsRead();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao carregar mensagens.';
        setErrorMessage(message);

        if (message.toLowerCase().includes('token')) {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_data');
          redirectToLogin();
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [redirectToLogin],
  );

  useEffect(() => {
    loadMessages(true);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages(false);
      }
    }, 8000);

    return () => window.clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSubmit() {
    const normalizedContent = content.trim();

    if (!normalizedContent || sending) return;

    if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(
        `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
      );
      return;
    }

    try {
      setSending(true);
      setErrorMessage('');
      const message = await sendCustomerMessage(normalizedContent);
      setMessages((current) => [...current, message]);
      setContent('');
      showToast('Mensagem enviada.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao enviar mensagem.';
      setErrorMessage(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F5F1] px-6 py-12 text-[#7A624D]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
            Atendimento online
          </p>
          <h1 className="text-4xl font-semibold">Mensagens</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
            Converse com a Sublime Pés sobre seus atendimentos, dúvidas e
            orientações.
          </p>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#E8DDD1] bg-white shadow-sm">
          <div className="border-b border-[#E8DDD1] bg-[#FFF9F6] px-6 py-5">
            <h2 className="text-xl font-semibold">Sublime Pés</h2>
            <p className="mt-1 text-sm text-[#8B735C]">
              Estamos por aqui para ajudar com cuidado e atenção.
            </p>
          </div>

          <div className="h-[56vh] min-h-[420px] overflow-y-auto bg-[#FCFAF8] px-4 py-6 sm:px-6">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-[#DCCDBE] bg-white px-5 py-4 text-sm text-[#8B735C]">
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto mt-12 max-w-md rounded-[28px] border border-[#E8DDD1] bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-4xl">💬</p>
                <h3 className="mt-4 text-2xl font-semibold">
                  Nenhuma mensagem ainda
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#8B735C]">
                  Envie sua primeira mensagem para falar com nosso atendimento
                  online.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCustomer = message.senderType === 'CUSTOMER';

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-[24px] px-5 py-4 shadow-sm sm:max-w-[72%] ${
                          isCustomer
                            ? 'bg-[#BFA58A] text-white'
                            : 'border border-[#E8DDD1] bg-white text-[#7A624D]'
                        }`}
                      >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                          {isCustomer ? 'Você' : 'Sublime Pés'}
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
            {errorMessage ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="grid gap-3">
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
                placeholder="Digite sua mensagem..."
                className="w-full resize-none rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#BFA58A]"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#8B735C]">
                  {content.length}/{MAX_MESSAGE_LENGTH} caracteres
                </p>
                <button
                  type="button"
                  disabled={sending || !content.trim()}
                  onClick={handleSubmit}
                  className="rounded-full bg-[#BFA58A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UiToast open={toastOpen} message={toastMessage} />
    </main>
  );
}
