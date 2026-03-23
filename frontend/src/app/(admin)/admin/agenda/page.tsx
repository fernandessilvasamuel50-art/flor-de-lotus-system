'use client';

import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { API_URL } from '@/services/api';
import {
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
  markNoShow,
} from '@/services/admin-appointments';
import { ConfirmModal } from '@/components/confirm-modal';
import { UiToast } from '@/components/ui-toast';

// ✅ TIPO CORRIGIDO com services[] e finalPrice
type Appointment = {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  finalPrice?: number | null;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  services?: Array<{
    service?: {
      name?: string;
      price?: number | null;
      priceText?: string | null;
    };
  }>;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  allDay: false;
  extendedProps: {
    status: string;
    customerName: string;
    serviceName: string;
    startTime: string;
    dateLabel: string;
    phone: string;
    email: string;
    priceLabel: string;
  };
};

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function buildEventDateTime(dateString: string, time: string) {
  const date = new Date(dateString);
  const [hours, minutes] = time.split(':').map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
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

function getEventColor(status: string) {
  if (status === 'PENDING') return '#DCCDBE';
  if (status === 'CONFIRMED') return '#BFA58A';
  if (status === 'RESCHEDULED') return '#CDB8A3';
  if (status === 'COMPLETED') return '#A98C72';
  if (status === 'CANCELLED') return '#E7D6C7';
  if (status === 'NO_SHOW') return '#CFC6BC';
  return '#BFA58A';
}

export default function AdminAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalAction, setModalAction] = useState<null | (() => Promise<void>)>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);

    setTimeout(() => {
      setToastOpen(false);
    }, 3000);
  }

  function openConfirmModal(
    title: string,
    description: string,
    action: () => Promise<void>,
  ) {
    setModalTitle(title);
    setModalDescription(description);
    setModalAction(() => action);
    setModalOpen(true);
  }

  async function loadAppointments() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/appointments`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Erro ao buscar agendamentos.');
      }

      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar agendamentos.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // ✅ EVENTS CORRIGIDO com múltiplos serviços e cálculo de preço
  const events = useMemo<CalendarEvent[]>(() => {
    return appointments.map((appointment) => {
      const serviceNames =
        appointment.services
          ?.map((item) => item.service?.name)
          .filter(Boolean)
          .join(', ') || 'Serviço';

      const servicesTotal = appointment.services?.reduce((total, item) => {
        return total + Number(item.service?.price ?? 0);
      }, 0) ?? 0;

      const priceLabel =
        appointment.finalPrice != null
          ? `${appointment.finalPrice} €`
          : servicesTotal > 0
          ? `${servicesTotal} €`
          : 'Por avaliação';

      return {
        id: appointment.id,
        title: `${appointment.customer?.name ?? 'Cliente'} — ${serviceNames}`,
        start: buildEventDateTime(
          appointment.appointmentDate,
          appointment.startTime,
        ),
        allDay: false,
        extendedProps: {
          status: appointment.status,
          customerName: appointment.customer?.name ?? 'Cliente',
          serviceName: serviceNames,
          startTime: appointment.startTime,
          dateLabel: formatDateLabel(appointment.appointmentDate),
          phone: appointment.customer?.phone ?? 'Não informado',
          email: appointment.customer?.email ?? 'Não informado',
          priceLabel,
        },
      };
    });
  }, [appointments]);

  // ✅ FUNÇÃO COMPLETE CORRIGIDA (sem prompt)
  async function handleComplete(id: string) {
    openConfirmModal(
      'Concluir atendimento',
      'Deseja marcar este atendimento como concluído?',
      async () => {
        try {
          setModalLoading(true);
          await completeAppointment(id); // sem finalPrice
          setModalOpen(false);
          setDetailOpen(false);
          setSelectedAppointment(null);
          showToast('Atendimento concluído com sucesso.', 'success');
          await loadAppointments();
        } catch {
          showToast('Erro ao concluir atendimento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  async function handleNoShow(id: string) {
    openConfirmModal(
      'Marcar não comparecimento',
      'Deseja marcar este agendamento como não compareceu?',
      async () => {
        try {
          setModalLoading(true);
          await markNoShow(id);
          setModalOpen(false);
          setDetailOpen(false);
          setSelectedAppointment(null);
          showToast('Agendamento marcado como não compareceu.', 'success');
          await loadAppointments();
        } catch {
          showToast('Erro ao marcar não comparecimento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  async function handleCancel(id: string) {
    openConfirmModal(
      'Cancelar agendamento',
      'Deseja realmente cancelar este agendamento?',
      async () => {
        try {
          setModalLoading(true);
          await cancelAppointment(id);
          setModalOpen(false);
          setDetailOpen(false);
          setSelectedAppointment(null);
          showToast('Agendamento cancelado com sucesso.', 'success');
          await loadAppointments();
        } catch {
          showToast('Erro ao cancelar agendamento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  async function handleDelete(id: string) {
    openConfirmModal(
      'Excluir agendamento',
      'Deseja realmente excluir este agendamento? Essa ação não poderá ser desfeita.',
      async () => {
        try {
          setModalLoading(true);
          await deleteAppointment(id);
          setModalOpen(false);
          setDetailOpen(false);
          setSelectedAppointment(null);
          showToast('Agendamento excluído com sucesso.', 'success');
          await loadAppointments();
        } catch {
          showToast('Erro ao excluir agendamento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  function renderActionButtons() {
    if (!selectedAppointment) return null;

    const status = selectedAppointment.status;

    if (status === 'CONFIRMED' || status === 'RESCHEDULED') {
      return (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleComplete(selectedAppointment.id)}
            className="rounded-full bg-[#A98C72] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Concluir atendimento
          </button>

          <button
            onClick={() => handleNoShow(selectedAppointment.id)}
            className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
          >
            Não compareceu
          </button>

          <button
            onClick={() => handleCancel(selectedAppointment.id)}
            className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#E7D6C7]"
          >
            Cancelar
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleDelete(selectedAppointment.id)}
          className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#E7D6C7]"
        >
          Excluir
        </button>
      </div>
    );
  }

  return (
    <main className="text-[#7A624D]">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
          Agenda
        </p>
        <h1 className="text-4xl font-semibold">Calendário de atendimentos</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
          Visualize os atendimentos do mês e clique em qualquer agendamento para
          ver os detalhes e executar ações rápidas.
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-4 shadow-sm sm:p-6">
        {loading ? (
          <div className="rounded-2xl bg-[#FBF8F4] px-4 py-6 text-sm text-[#8B735C]">
            Carregando agenda...
          </div>
        ) : (
          <div className="admin-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={ptBrLocale}
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right: '',
              }}
              buttonText={{
                today: 'Hoje',
              }}
              height="auto"
              events={events.map((event) => ({
                ...event,
                backgroundColor: getEventColor(event.extendedProps.status),
                borderColor: getEventColor(event.extendedProps.status),
                textColor: '#ffffff',
              }))}
              dayMaxEvents={3}
              moreLinkText={(count) => `+${count} mais`}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              eventClick={(info) => {
                const appointment = appointments.find(
                  (item) => item.id === info.event.id,
                );

                if (!appointment) return;

                setSelectedAppointment(appointment);
                setDetailOpen(true);
              }}
              moreLinkClick="popover"
            />
          </div>
        )}
      </div>

      {detailOpen && selectedAppointment ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                  Detalhes do atendimento
                </p>
                <h2 className="text-2xl font-semibold">
                  {selectedAppointment.customer?.name ?? 'Cliente'}
                </h2>
              </div>

              <button
                onClick={() => {
                  setDetailOpen(false);
                  setSelectedAppointment(null);
                }}
                className="rounded-full border border-[#DCCDBE] px-3 py-2 text-sm text-[#7A624D] transition hover:bg-[#F8F5F1]"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-4 rounded-3xl bg-[#FCFAF8] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#F1E7DD] px-3 py-1 text-xs font-medium text-[#7A624D]">
                  {selectedAppointment.startTime}
                </span>

                <span
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{
                    backgroundColor: getEventColor(selectedAppointment.status),
                  }}
                >
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              <p className="text-sm text-[#8B735C]">
                <strong>Serviços:</strong>{' '}
                {selectedAppointment.services?.length
                  ? selectedAppointment.services
                      .map((item) => item.service?.name)
                      .filter(Boolean)
                      .join(', ')
                  : 'Não informado'}
              </p>

              <p className="text-sm text-[#8B735C]">
                <strong>Data:</strong>{' '}
                {formatDateLabel(selectedAppointment.appointmentDate)}
              </p>

              <p className="text-sm text-[#8B735C]">
                <strong>Telefone:</strong>{' '}
                {selectedAppointment.customer?.phone ?? 'Não informado'}
              </p>

              <p className="text-sm text-[#8B735C]">
                <strong>Email:</strong>{' '}
                {selectedAppointment.customer?.email ?? 'Não informado'}
              </p>

              <p className="text-sm text-[#8B735C]">
                <strong>Preço:</strong>{' '}
                {selectedAppointment.finalPrice != null
                  ? `${selectedAppointment.finalPrice} €`
                  : selectedAppointment.services?.length
                  ? `${selectedAppointment.services.reduce((total, item) => {
                      return total + Number(item.service?.price ?? 0);
                    }, 0)} €`
                  : 'Por avaliação'}
              </p>
            </div>

            <div className="mt-6">{renderActionButtons()}</div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={modalOpen}
        title={modalTitle}
        description={modalDescription}
        confirmText="Sim, continuar"
        cancelText="Voltar"
        loading={modalLoading}
        onCancel={() => {
          if (!modalLoading) {
            setModalOpen(false);
          }
        }}
        onConfirm={() => {
          if (modalAction) {
            modalAction();
          }
        }}
      />

      <UiToast open={toastOpen} message={toastMessage} type={toastType} />
    </main>
  );
}