'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCustomerConversation } from '@/services/messages';

const messagesPath = '/cliente/painel/mensagens';
const redirectQuery = `?redirect=${encodeURIComponent(messagesPath)}`;

export function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const customer = localStorage.getItem('customer_data');
    const authenticated = Boolean(token && customer);

    setIsAuthenticated(authenticated);

    if (!authenticated) {
      setUnreadCount(0);
      return;
    }

    getCustomerConversation()
      .then((conversation) => setUnreadCount(conversation.unreadCount))
      .catch(() => setUnreadCount(0));
  }, [pathname]);

  useEffect(() => {
    if (!open || !isAuthenticated) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      getCustomerConversation()
        .then((conversation) => setUnreadCount(conversation.unreadCount))
        .catch(() => undefined);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [open, isAuthenticated]);

  if (pathname === messagesPath) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="w-[calc(100vw-2rem)] max-w-sm rounded-[28px] border border-[#E8DDD1] bg-white p-5 text-[#7A624D] shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A98C72]">
                Atendimento
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Tem alguma dúvida sobre seu atendimento?
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-[#F8F5F1] px-3 py-1 text-sm text-[#7A624D] ring-1 ring-[#E8DDD1]"
            >
              Fechar
            </button>
          </div>

          <p className="text-sm leading-6 text-[#8B735C]">
            Estamos por aqui para ajudar.
          </p>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push(messagesPath)}
              className="mt-5 w-full rounded-full bg-[#BFA58A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Enviar mensagem
            </button>
          ) : (
            <div className="mt-5">
              <p className="mb-4 rounded-2xl bg-[#FBF8F4] px-4 py-3 text-sm leading-6 text-[#8B735C]">
                Precisa falar com a Sublime Pés? Entre na sua conta para enviar
                uma mensagem para nosso atendimento.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/cliente/login${redirectQuery}`}
                  className="rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Entrar
                </Link>
                <Link
                  href={`/cliente/cadastro${redirectQuery}`}
                  className="rounded-full border border-[#BFA58A] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#F1E7DD]"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full border border-[#DCCDBE] bg-white px-5 py-3 text-sm font-semibold text-[#7A624D] shadow-lg transition hover:bg-[#FBF8F4]"
        aria-label="Abrir atendimento online"
      >
        <span className="mr-2">💬</span>
        Fale conosco
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#B8897F] px-2 text-xs font-semibold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
