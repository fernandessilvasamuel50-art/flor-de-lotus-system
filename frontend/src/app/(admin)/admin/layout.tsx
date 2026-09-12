'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { listAdminConversations } from '@/services/messages';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    if (!token && !isLoginPage) {
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/admin/login');
      return;
    }

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, [router, isLoginPage]);

  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return;

    function loadUnreadMessages() {
      listAdminConversations()
        .then((data) => setUnreadMessages(data.unreadCount))
        .catch(() => setUnreadMessages(0));
    }

    loadUnreadMessages();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadUnreadMessages();
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F1]">
        <p className="text-[#7A624D]">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#7A624D]">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[#E8DDD1] bg-white px-6 py-8 lg:block">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#A98C72]">
              Sublime Pés
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Admin</h2>
            <p className="mt-2 text-sm leading-6 text-[#8B735C]">
              Gestão do espaço, agenda e financeiro.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <Link
              href="/admin/dashboard"
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-[#F8F5F1] ${
                pathname === '/admin/dashboard' ? 'bg-[#F8F5F1]' : ''
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/admin/agenda"
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-[#F8F5F1] ${
                pathname === '/admin/agenda' ? 'bg-[#F8F5F1]' : ''
              }`}
            >
              Agenda
            </Link>

            <Link
              href="/admin/solicitacoes"
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-[#F8F5F1] ${
                pathname === '/admin/solicitacoes' ? 'bg-[#F8F5F1]' : ''
              }`}
            >
              Solicitações
            </Link>

            <Link
              href="/admin/mensagens"
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-[#F8F5F1] ${
                pathname === '/admin/mensagens' ? 'bg-[#F8F5F1]' : ''
              }`}
            >
              <span>Mensagens</span>
              {unreadMessages > 0 ? (
                <span className="rounded-full bg-[#B8897F] px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              ) : null}
            </Link>

            <Link
              href="/admin/meu-negocio"
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-[#F8F5F1] ${
                pathname === '/admin/meu-negocio' ? 'bg-[#F8F5F1]' : ''
              }`}
            >
              Meu negócio
            </Link>

            <button
              onClick={handleLogout}
              className="mt-4 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-[#F8F5F1]"
            >
              Sair
            </button>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-[#E8DDD1] bg-[#F8F5F1] px-6 py-4 lg:hidden">
            <p className="text-sm uppercase tracking-[0.3em] text-[#A98C72]">
              Sublime Pés Admin
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/agenda"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Agenda
              </Link>
              <Link
                href="/admin/solicitacoes"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
              Solicitações
              </Link>
              <Link
                href="/admin/mensagens"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Mensagens
                {unreadMessages > 0 ? (
                  <span className="rounded-full bg-[#B8897F] px-2 py-0.5 text-xs font-semibold text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/admin/meu-negocio"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Meu negócio
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white px-4 py-2 text-sm text-red-600 ring-1 ring-[#E8DDD1]"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
