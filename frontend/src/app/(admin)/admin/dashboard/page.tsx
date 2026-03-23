'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/services/api';

type DashboardStats = {
  todayCount: number;
  pendingCount: number;
  weekCount: number;
  monthRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  totalCustomers?: number;
};

type TodayScheduleItem = {
  time: string;
  appointment: {
    id: string;
    status: string;
    startTime: string;
    customer?: {
      name?: string;
    };
    service?: {
      name?: string;
    };
  } | null;
};

type NotificationItem = {
  type: string;
  title: string;
  description: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadStats() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/appointments/dashboard/stats`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar métricas.');
    }

    return res.json();
  }

  async function loadTodaySchedule() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/appointments/dashboard/today-schedule`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar agenda do dia.');
    }

    return res.json();
  }

  async function loadNotifications() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/appointments/dashboard/notifications`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar notificações.');
    }

    return res.json();
  }

  async function loadData() {
    try {
      setLoading(true);

      const [statsData, todayScheduleData, notificationsData] = await Promise.all([
        loadStats(),
        loadTodaySchedule(),
        loadNotifications(),
      ]);

      setStats(statsData);
      setTodaySchedule(todayScheduleData);
      setNotifications(notificationsData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar dashboard.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const todayAppointments = todaySchedule.filter((item) => item.appointment);

  return (
    <main className="text-[#7A624D]">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
          Painel administrativo
        </p>
        <h1 className="text-4xl font-semibold">Dashboard do espaço</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
          Visão rápida dos atendimentos, solicitações pendentes e indicadores
          financeiros do espaço.
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          Carregando dashboard...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <section className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Hoje
                </p>
                <h2 className="mt-3 text-4xl font-semibold">
                  {stats?.todayCount ?? 0}
                </h2>
                <p className="mt-2 text-sm text-[#8B735C]">
                  atendimentos do dia
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Pendentes
                </p>
                <h2 className="mt-3 text-4xl font-semibold">
                  {stats?.pendingCount ?? 0}
                </h2>
                <p className="mt-2 text-sm text-[#8B735C]">
                  aguardando confirmação
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Semana
                </p>
                <h2 className="mt-3 text-4xl font-semibold">
                  {stats?.weekCount ?? 0}
                </h2>
                <p className="mt-2 text-sm text-[#8B735C]">
                  atendimentos na semana
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Clientes
                </p>
                <h2 className="mt-3 text-4xl font-semibold">
                  {stats?.totalCustomers ?? 0}
                </h2>
                <p className="mt-2 text-sm text-[#8B735C]">
                  cadastrados no sistema
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Faturamento mês
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  {formatCurrency(stats?.monthRevenue ?? 0)}
                </h3>
                <p className="mt-2 text-sm text-[#8B735C]">
                  total concluído no mês
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Financeiro de hoje
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  {formatCurrency(stats?.todayRevenue ?? 0)}
                </h3>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                  Financeiro da semana
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  {formatCurrency(stats?.weekRevenue ?? 0)}
                </h3>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                  Notificações
                </p>
                <h2 className="text-2xl font-semibold">Avisos do sistema</h2>
              </div>

              {notifications.length === 0 ? (
                <div className="rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                  Nenhuma notificação no momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div
                      key={`${notification.type}-${index}`}
                      className="rounded-2xl border border-[#EFE4D8] bg-[#FCFAF8] px-4 py-4"
                    >
                      <p className="font-semibold text-[#7A624D]">{notification.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#8B735C]">
                        {notification.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                Hoje
              </p>
              <h2 className="text-2xl font-semibold">Atendimentos do dia</h2>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                Nenhum atendimento marcado para hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((item) => (
                  <div
                    key={item.time}
                    className="flex items-center justify-between rounded-2xl border border-[#EFE4D8] bg-[#FCFAF8] px-4 py-3"
                  >
                    <p className="truncate pr-3 font-medium text-[#7A624D]">
                      {item.appointment?.customer?.name ?? 'Cliente'}
                    </p>

                    <span className="shrink-0 rounded-full bg-[#F1E7DD] px-3 py-1 text-xs font-medium text-[#7A624D]">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}