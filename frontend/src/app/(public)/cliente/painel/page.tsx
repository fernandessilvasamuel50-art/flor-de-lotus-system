'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerDashboard, updateCustomerProfile } from '@/services/customer-auth';
import { getCustomerConversation } from '@/services/messages';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Appointment = {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  imageUrl?: string | null;
  notes?: string | null;
  estimatedMin?: number | null;
  estimatedMax?: number | null;
  evaluationNotes?: string | null;
  analyzedAt?: string | null;
  services?: Array<{
    service?: {
      name?: string;
      price?: number | null;
      priceText?: string | null;
    };
  }>;
};

type DashboardData = {
  customer: Customer;
  appointments: Appointment[];
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === 'PENDING') return 'Pendente';
  if (status === 'CONFIRMED') return 'Confirmado';
  if (status === 'RESCHEDULED') return 'Reagendado';
  if (status === 'COMPLETED') return 'Concluído';
  if (status === 'CANCELLED') return 'Cancelado';
  if (status === 'NO_SHOW') return 'Não compareceu';
  return status;
}

function getStatusStyle(status: string) {
  if (status === 'PENDING') {
    return 'bg-[#F8F5F1] text-[#7A624D] ring-1 ring-[#DCCDBE]';
  }

  if (status === 'CONFIRMED') {
    return 'bg-[#E9DED2] text-[#7A624D]';
  }

  if (status === 'RESCHEDULED') {
    return 'bg-[#EEE4D8] text-[#7A624D]';
  }

  if (status === 'COMPLETED') {
    return 'bg-[#DCCDBE] text-[#7A624D]';
  }

  if (status === 'CANCELLED') {
    return 'bg-[#EFE4D8] text-[#7A624D]';
  }

  if (status === 'NO_SHOW') {
    return 'bg-[#F3EEE8] text-[#7A624D]';
  }

  return 'bg-[#F3EEE8] text-[#7A624D]';
}

export default function ClientePainelPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem('customer_token');

        if (!token) {
          router.push('/cliente/login');
          return;
        }

        const dashboardData = await getCustomerDashboard(token);
        setData(dashboardData);

        setName(dashboardData.customer.name || '');
        setEmail(dashboardData.customer.email || '');
        setPhone(dashboardData.customer.phone || '');

        getCustomerConversation()
          .then((conversation) => setUnreadMessages(conversation.unreadCount))
          .catch(() => setUnreadMessages(0));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao carregar painel.';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setProfileError('');

    try {
      const updatedCustomer = await updateCustomerProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      localStorage.setItem('customer_data', JSON.stringify(updatedCustomer));
      setSuccessMessage('Dados atualizados com sucesso.');

      if (data) {
        setData({
          ...data,
          customer: updatedCustomer,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar os dados.';
      setProfileError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    router.push('/cliente/login');
  }

  const nextAppointments =
    data?.appointments.filter(
      (item) =>
        item.status === 'PENDING' ||
        item.status === 'CONFIRMED' ||
        item.status === 'RESCHEDULED',
    ) ?? [];

  const historyAppointments =
    data?.appointments.filter(
      (item) =>
        item.status === 'COMPLETED' ||
        item.status === 'CANCELLED' ||
        item.status === 'NO_SHOW',
    ) ?? [];

  return (
    <main className="min-h-screen bg-[#F8F5F1] px-6 py-16 text-[#7A624D]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
              Área do cliente
            </p>
            <h1 className="text-4xl font-semibold">Meu painel</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/agendamento"
              className="rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Novo agendamento
            </Link>

            <Link
              href="/cliente/painel/mensagens"
              className="inline-flex items-center gap-2 rounded-full border border-[#BFA58A] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#F1E7DD]"
            >
              Mensagens
              {unreadMessages > 0 ? (
                <span className="rounded-full bg-[#B8897F] px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              ) : null}
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
            >
              Sair
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
            Carregando painel...
          </div>
        ) : data ? (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_2fr]">
            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                      Mensagens
                    </p>
                    <h2 className="text-2xl font-semibold">
                      Atendimento online
                    </h2>
                  </div>
                  {unreadMessages > 0 ? (
                    <span className="rounded-full bg-[#B8897F] px-3 py-1 text-xs font-semibold text-white">
                      {unreadMessages} não lida
                      {unreadMessages > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-[#8B735C]">
                  Fale com a Sublime Pés pelo sistema e acompanhe todo o
                  histórico em um só lugar.
                </p>
                <Link
                  href="/cliente/painel/mensagens"
                  className="mt-5 inline-flex rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Abrir mensagens
                </Link>
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                  Meus dados
                </p>
                <h2 className="text-2xl font-semibold">Editar perfil</h2>

                {successMessage ? (
                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                  </div>
                ) : null}

                {profileError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {profileError}
                  </div>
                ) : null}

                <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-full bg-[#BFA58A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </form>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                    Próximos agendamentos
                  </p>
                  <h2 className="text-2xl font-semibold">Acompanhe seus horários</h2>
                </div>

                {nextAppointments.length === 0 ? (
                  <div className="rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                    Você não possui agendamentos futuros no momento.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {nextAppointments.map((appointment) => {
                      const serviceNames =
                        appointment.services?.map((item) => item.service?.name).filter(Boolean).join(', ') ||
                        'Serviço';

                      return (
                        <div
                          key={appointment.id}
                          className="rounded-2xl border border-[#E8DDD1] bg-[#FCFAF8] p-5"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-lg font-semibold">{serviceNames}</p>
                              <p className="mt-1 text-sm text-[#8B735C]">
                                {formatDate(appointment.appointmentDate)} às{' '}
                                {appointment.startTime}
                              </p>

                              {appointment.estimatedMin != null || appointment.estimatedMax != null || appointment.evaluationNotes ? (
                                <div className="mt-3 rounded-2xl bg-[#F8F5F1] px-4 py-3 text-sm text-[#8B735C]">
                                  <p><strong>Faixa estimada:</strong> {appointment.estimatedMin ?? '-'} € até {appointment.estimatedMax ?? '-'} €</p>
                                  {appointment.evaluationNotes ? (
                                    <p className="mt-2"><strong>Parecer da clínica:</strong> {appointment.evaluationNotes}</p>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                appointment.status,
                              )}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                    Histórico
                  </p>
                  <h2 className="text-2xl font-semibold">Atendimentos anteriores</h2>
                </div>

                {historyAppointments.length === 0 ? (
                  <div className="rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                    Nenhum histórico encontrado.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {historyAppointments.map((appointment) => {
                      const serviceNames =
                        appointment.services?.map((item) => item.service?.name).filter(Boolean).join(', ') ||
                        'Serviço';

                      return (
                        <div
                          key={appointment.id}
                          className="rounded-2xl border border-[#E8DDD1] bg-[#FCFAF8] p-5"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-lg font-semibold">{serviceNames}</p>
                              <p className="mt-1 text-sm text-[#8B735C]">
                                {formatDate(appointment.appointmentDate)} às{' '}
                                {appointment.startTime}
                              </p>

                              {appointment.estimatedMin != null || appointment.estimatedMax != null || appointment.evaluationNotes ? (
                                <div className="mt-3 rounded-2xl bg-[#F8F5F1] px-4 py-3 text-sm text-[#8B735C]">
                                  <p><strong>Faixa estimada:</strong> {appointment.estimatedMin ?? '-'} € até {appointment.estimatedMax ?? '-'} €</p>
                                  {appointment.evaluationNotes ? (
                                    <p className="mt-2"><strong>Parecer da clínica:</strong> {appointment.evaluationNotes}</p>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                appointment.status,
                              )}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
