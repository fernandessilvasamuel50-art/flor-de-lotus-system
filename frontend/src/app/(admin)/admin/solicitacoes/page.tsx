'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/services/api';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  deleteAppointment,
  markNoShow,
  rescheduleAppointment,
  analyzeAppointment,
} from '@/services/admin-appointments';
import { ConfirmModal } from '@/components/confirm-modal';
import { UiToast } from '@/components/ui-toast';

type Appointment = {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  finalPrice?: number | null;
  imageUrl?: string | null;
  notes?: string | null;
  estimatedMin?: number | null;
  estimatedMax?: number | null;
  evaluationNotes?: string | null;
  analyzedAt?: string | null;
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

type StatusFilter =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

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

export default function SolicitacoesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('PENDING');

  // Estados para análise
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisAppointment, setAnalysisAppointment] = useState<Appointment | null>(null);
  const [estimatedMin, setEstimatedMin] = useState('');
  const [estimatedMax, setEstimatedMax] = useState('');
  const [evaluationNotes, setEvaluationNotes] = useState('');

  // Estados para valor final
  const [showFinalPriceModal, setShowFinalPriceModal] = useState(false);
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);
  const [finalPriceInput, setFinalPriceInput] = useState('');

  // ✅ NOVOS ESTADOS PARA PREVIEW DE IMAGEM
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

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

  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/appointments`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Erro ao buscar atendimentos.');
      }

      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar atendimentos.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => item.status === activeFilter);
  }, [appointments, activeFilter]);

  // ✅ FUNÇÃO: verifica se precisa de valor final
  function requiresFinalPrice(appointment: Appointment): boolean {
    return appointment.services?.some((item) => {
      const service = item.service;
      return service && service.price == null;
    }) ?? false;
  }

  // ✅ FUNÇÃO: inicia conclusão com verificação de valor
  function initiateComplete(appointment: Appointment) {
    if (requiresFinalPrice(appointment)) {
      setPendingCompleteId(appointment.id);
      setFinalPriceInput('');
      setShowFinalPriceModal(true);
    } else {
      openConfirmModal(
        'Concluir atendimento',
        'Deseja marcar este atendimento como concluído?',
        async () => {
          try {
            setModalLoading(true);
            await completeAppointment(appointment.id);
            setModalOpen(false);
            showToast('Atendimento concluído com sucesso.', 'success');
            await loadData();
          } catch {
            showToast('Erro ao concluir atendimento.', 'error');
          } finally {
            setModalLoading(false);
          }
        },
      );
    }
  }

  // ✅ FUNÇÃO: conclui com valor final
  async function handleCompleteWithPrice() {
    if (!pendingCompleteId) return;

    const value = finalPriceInput.trim();
    const finalPrice = value ? Number(value.replace(',', '.')) : undefined;

    if (value && Number.isNaN(finalPrice)) {
      showToast('Informe um valor válido.', 'error');
      return;
    }

    setShowFinalPriceModal(false);
    setModalLoading(true);

    try {
      await completeAppointment(pendingCompleteId, finalPrice);
      setPendingCompleteId(null);
      setFinalPriceInput('');
      showToast('Atendimento concluído com sucesso.', 'success');
      await loadData();
    } catch {
      showToast('Erro ao concluir atendimento.', 'error');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleConfirm(id: string) {
    openConfirmModal(
      'Confirmar solicitação',
      'Deseja realmente confirmar esta solicitação de agendamento?',
      async () => {
        try {
          setModalLoading(true);
          await confirmAppointment(id);
          setModalOpen(false);
          showToast('Solicitação confirmada com sucesso.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao confirmar solicitação.', 'error');
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
          showToast('Agendamento cancelado com sucesso.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao cancelar agendamento.', 'error');
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
          showToast('Agendamento marcado como não compareceu.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao marcar não comparecimento.', 'error');
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
          showToast('Agendamento excluído com sucesso.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao excluir agendamento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  async function handleReschedule(id: string) {
    if (!newDate || !newTime) {
      showToast('Selecione a nova data e o novo horário.', 'error');
      return;
    }

    openConfirmModal(
      'Salvar reagendamento',
      `Deseja reagendar este atendimento para ${newDate} às ${newTime}?`,
      async () => {
        try {
          setModalLoading(true);
          await rescheduleAppointment(id, newDate, newTime);
          setModalOpen(false);
          setRescheduleId(null);
          setNewDate('');
          setNewTime('');
          showToast('Agendamento reagendado com sucesso.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao reagendar agendamento.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  function openAnalysisModal(appointment: Appointment) {
    setAnalysisAppointment(appointment);
    setEstimatedMin(appointment.estimatedMin?.toString() ?? '');
    setEstimatedMax(appointment.estimatedMax?.toString() ?? '');
    setEvaluationNotes(appointment.evaluationNotes ?? '');
    setAnalysisOpen(true);
  }

  async function handleSaveAnalysis() {
    if (!analysisAppointment) return;

    try {
      setModalLoading(true);

      await analyzeAppointment(analysisAppointment.id, {
        estimatedMin: estimatedMin ? Number(estimatedMin) : undefined,
        estimatedMax: estimatedMax ? Number(estimatedMax) : undefined,
        evaluationNotes: evaluationNotes || undefined,
      });

      setAnalysisOpen(false);
      showToast('Análise salva com sucesso.', 'success');
      await loadData();
    } catch {
      showToast('Erro ao salvar análise.', 'error');
    } finally {
      setModalLoading(false);
    }
  }

  function renderActions(appointment: Appointment) {
    const status = appointment.status;

    if (status === 'PENDING') {
      return (
        <>
          <button
            onClick={() => handleConfirm(appointment.id)}
            className="rounded-full bg-[#A98C72] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Confirmar
          </button>

          <button
            onClick={() =>
              setRescheduleId(
                rescheduleId === appointment.id ? null : appointment.id,
              )
            }
            className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
          >
            Reagendar
          </button>

          <button
            onClick={() => handleCancel(appointment.id)}
            className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm transition hover:bg-[#E7D6C7]"
          >
            Cancelar
          </button>

          <button
            onClick={() => openAnalysisModal(appointment)}
            className="rounded-full bg-[#E9DED2] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm transition hover:bg-[#E9DED2]/80"
          >
            Analisar
          </button>
        </>
      );
    }

    if (status === 'CONFIRMED' || status === 'RESCHEDULED') {
      return (
        <>
          <button
            onClick={() => initiateComplete(appointment)}
            className="rounded-full bg-[#A98C72] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Concluir atendimento
          </button>

          <button
            onClick={() => handleNoShow(appointment.id)}
            className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
          >
            Não compareceu
          </button>

          <button
            onClick={() =>
              setRescheduleId(
                rescheduleId === appointment.id ? null : appointment.id,
              )
            }
            className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm transition hover:bg-[#E7D6C7]"
          >
            Reagendar
          </button>

          <button
            onClick={() => openAnalysisModal(appointment)}
            className="rounded-full bg-[#E9DED2] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm transition hover:bg-[#E9DED2]/80"
          >
            Analisar
          </button>
        </>
      );
    }

    return (
      <button
        onClick={() => handleDelete(appointment.id)}
        className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] shadow-sm transition hover:bg-[#E7D6C7]"
      >
        Excluir
      </button>
    );
  }

  return (
    <main className="text-[#7A624D]">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
          Solicitações
        </p>
        <h1 className="text-4xl font-semibold">Central de atendimentos</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
          Gerencie solicitações pendentes, confirmadas, reagendadas, concluídas,
          canceladas e não comparecimentos.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          ['PENDING', 'Pendentes'],
          ['CONFIRMED', 'Confirmados'],
          ['RESCHEDULED', 'Reagendados'],
          ['COMPLETED', 'Concluídos'],
          ['CANCELLED', 'Cancelados'],
          ['NO_SHOW', 'Não compareceu'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value as StatusFilter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === value
                ? 'bg-[#BFA58A] text-white'
                : 'bg-white text-[#7A624D] ring-1 ring-[#E8DDD1] hover:bg-[#F8F5F1]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          Carregando atendimentos...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          <p className="text-[#8B735C]">Nenhum atendimento encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAppointments.map((appointment) => {
            const needsAnalysis = appointment.services?.some(
              (item) => item.service?.price == null
            );

            return (
              <div
                key={appointment.id}
                className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold">
                        {appointment.customer?.name ?? 'Cliente'}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>

                      {needsAnalysis && appointment.estimatedMin == null && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-300">
                          Precisa de análise
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-[#8B735C]">
                      <p>
                        <strong>Telefone:</strong>{' '}
                        {appointment.customer?.phone ?? 'Não informado'}
                      </p>
                      <p>
                        <strong>Email:</strong>{' '}
                        {appointment.customer?.email ?? 'Não informado'}
                      </p>
                      <p>
                        <strong>Serviços:</strong>{' '}
                        {appointment.services
                          ?.map((item) => item.service?.name)
                          .filter(Boolean)
                          .join(', ') ?? 'Não informado'}
                      </p>
                      <p>
                        <strong>Data:</strong>{' '}
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p>
                        <strong>Horário:</strong> {appointment.startTime}
                      </p>

                      {/* Preço */}
                      <p>
                        <strong>Preço:</strong>{' '}
                        {appointment.finalPrice != null
                          ? `${appointment.finalPrice} €`
                          : appointment.services?.length
                          ? `${appointment.services.reduce((total, item) => {
                              return total + Number(item.service?.price ?? 0);
                            }, 0)} €`
                          : 'Por avaliação'}
                      </p>

                      {/* Estimativa */}
                      {appointment.estimatedMin != null && (
                        <p>
                          <strong>Estimativa:</strong>{' '}
                          {appointment.estimatedMin} € até {appointment.estimatedMax} €
                        </p>
                      )}

                      {/* Notas de avaliação */}
                      {appointment.evaluationNotes && (
                        <p>
                          <strong>Observação da análise:</strong>{' '}
                          {appointment.evaluationNotes}
                        </p>
                      )}

                      {/* Imagem */}
                      {appointment.imageUrl && (
                        <div className="mt-3">
                          <strong>Foto enviada:</strong>
                          <img
                            src={appointment.imageUrl}
                            alt="Foto do cliente"
                            className="mt-2 w-32 rounded-xl border border-[#DCCDBE] cursor-pointer transition hover:opacity-80"
                            onClick={() => {
                              setImagePreviewUrl(appointment.imageUrl || '');
                              setImagePreviewOpen(true);
                            }}
                          />
                        </div>
                      )}

                      {/* Observações do cliente */}
                      {appointment.notes && (
                        <p className="mt-2 text-sm">
                          <strong>Observação do cliente:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {renderActions(appointment)}
                  </div>
                </div>

                {rescheduleId === appointment.id ? (
                  <div className="mt-6 grid gap-4 rounded-3xl bg-[#FBF8F4] p-5 md:grid-cols-3">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                    />

                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                    />

                    <button
                      onClick={() => handleReschedule(appointment.id)}
                      className="rounded-full bg-[#BFA58A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Salvar reagendamento
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de valor final */}
      {showFinalPriceModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Informar valor final</h3>
            <p className="text-sm text-[#8B735C] mb-4">
              Este serviço não possui preço definido. Informe o valor cobrado:
            </p>

            <input
              type="text"
              value={finalPriceInput}
              onChange={(e) => setFinalPriceInput(e.target.value)}
              placeholder="Ex: 50.00"
              className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={handleCompleteWithPrice}
                disabled={modalLoading}
                className="flex-1 rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {modalLoading ? 'Concluindo...' : 'Concluir'}
              </button>

              <button
                onClick={() => {
                  setShowFinalPriceModal(false);
                  setPendingCompleteId(null);
                }}
                className="flex-1 rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NOVO MODAL DE ANÁLISE COMPLETO */}
      {analysisOpen && analysisAppointment && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-4xl rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[#7A624D]">
                  Análise do atendimento
                </h3>
                <p className="mt-1 text-sm text-[#8B735C]">
                  Veja a imagem, a observação do cliente e registre a análise da clínica.
                </p>
              </div>

              <button
                onClick={() => {
                  setAnalysisOpen(false);
                  setAnalysisAppointment(null);
                }}
                className="rounded-full border border-[#DCCDBE] px-4 py-2 text-sm text-[#7A624D] transition hover:bg-[#F8F5F1]"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* BLOCO ESQUERDO — DADOS DO CASO */}
              <div className="rounded-3xl bg-[#FCFAF8] p-5">
                <h4 className="mb-4 text-lg font-semibold text-[#7A624D]">
                  Dados enviados pelo cliente
                </h4>

                <div className="space-y-3 text-sm text-[#8B735C]">
                  <p>
                    <strong>Cliente:</strong>{' '}
                    {analysisAppointment.customer?.name ?? 'Não informado'}
                  </p>

                  <p>
                    <strong>Telefone:</strong>{' '}
                    {analysisAppointment.customer?.phone ?? 'Não informado'}
                  </p>

                  <p>
                    <strong>Email:</strong>{' '}
                    {analysisAppointment.customer?.email ?? 'Não informado'}
                  </p>

                  <p>
                    <strong>Serviços:</strong>{' '}
                    {analysisAppointment.services
                      ?.map((item) => item.service?.name)
                      .filter(Boolean)
                      .join(', ') ?? 'Não informado'}
                  </p>

                  <p>
                    <strong>Data:</strong>{' '}
                    {formatDate(analysisAppointment.appointmentDate)}
                  </p>

                  <p>
                    <strong>Horário:</strong> {analysisAppointment.startTime}
                  </p>
                </div>

                {analysisAppointment.imageUrl ? (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-[#7A624D]">
                      Foto enviada pelo cliente
                    </p>

                    <img
                      src={analysisAppointment.imageUrl}
                      alt="Foto enviada pelo cliente"
                      className="w-44 cursor-pointer rounded-2xl border border-[#DCCDBE] object-cover transition hover:opacity-90"
                      onClick={() => {
                        setImagePreviewUrl(analysisAppointment.imageUrl || '');
                        setImagePreviewOpen(true);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviewUrl(analysisAppointment.imageUrl || '');
                        setImagePreviewOpen(true);
                      }}
                      className="mt-3 rounded-full bg-[#F8F5F1] px-4 py-2 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
                    >
                      Ampliar imagem
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-[#DCCDBE] px-4 py-4 text-sm text-[#8B735C]">
                    Nenhuma imagem foi enviada.
                  </div>
                )}

                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-[#7A624D]">
                    Observação do cliente
                  </p>

                  <div className="rounded-2xl border border-[#E8DDD1] bg-white px-4 py-4 text-sm text-[#8B735C]">
                    {analysisAppointment.notes?.trim()
                      ? analysisAppointment.notes
                      : 'Nenhuma observação foi informada.'}
                  </div>
                </div>
              </div>

              {/* BLOCO DIREITO — ANÁLISE DA CLÍNICA */}
              <div className="rounded-3xl bg-[#FCFAF8] p-5">
                <h4 className="mb-4 text-lg font-semibold text-[#7A624D]">
                  Análise da clínica
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Valor estimado (€) - mínimo
                    </label>
                    <input
                      type="number"
                      value={estimatedMin}
                      onChange={(e) => setEstimatedMin(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                      placeholder="Ex: 10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Valor estimado (€) - máximo
                    </label>
                    <input
                      type="number"
                      value={estimatedMax}
                      onChange={(e) => setEstimatedMax(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                      placeholder="Ex: 20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                      Observações da análise
                    </label>
                    <textarea
                      value={evaluationNotes}
                      onChange={(e) => setEvaluationNotes(e.target.value)}
                      className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                      rows={7}
                      placeholder="Descreva sua análise sobre o caso..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSaveAnalysis}
                    disabled={modalLoading}
                    className="flex-1 rounded-full bg-[#BFA58A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {modalLoading ? 'Salvando...' : 'Salvar análise'}
                  </button>

                  <button
                    onClick={() => {
                      setAnalysisOpen(false);
                      setAnalysisAppointment(null);
                    }}
                    className="flex-1 rounded-full bg-[#F8F5F1] px-5 py-3 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE AMPLIAR IMAGEM */}
      {imagePreviewOpen && imagePreviewUrl ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 px-4"
          onClick={() => {
            setImagePreviewOpen(false);
            setImagePreviewUrl('');
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setImagePreviewOpen(false);
                setImagePreviewUrl('');
              }}
              className="absolute right-3 top-3 z-10 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#7A624D] shadow"
            >
              Fechar
            </button>

            <img
              src={imagePreviewUrl}
              alt="Imagem ampliada"
              className="max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
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