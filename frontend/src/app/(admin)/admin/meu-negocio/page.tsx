'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/services/api';
import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from '@/services/admin-services';
import { ConfirmModal } from '@/components/confirm-modal';
import { UiToast } from '@/components/ui-toast';

type Service = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  priceText?: string | null;
  durationMinutes: number;
  active: boolean;
  requiresImage?: boolean;
};

type DashboardStats = {
  todayCount: number;
  pendingCount: number;
  weekCount: number;
  monthRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  totalCustomers?: number;
};

const emptyForm = {
  name: '',
  description: '',
  price: '',
  priceText: '',
  durationMinutes: '60',
  active: true,
  requiresImage: false,
};

export default function NegocioPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

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

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, servicesData] = await Promise.all([
        loadStats(),
        getAdminServices(),
      ]);

      setStats(statsData);
      setServices(servicesData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar página.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? '',
      price: service.price != null ? String(service.price) : '',
      priceText: service.priceText ?? '',
      durationMinutes: String(service.durationMinutes),
      active: service.active,
      requiresImage: service.requiresImage ?? false,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast('Informe o nome do serviço.', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : null,
        priceText: form.priceText || null,
        durationMinutes: Number(form.durationMinutes),
        active: form.active,
        requiresImage: form.requiresImage,
      };

      if (editingId) {
        await updateAdminService(editingId, payload);
        showToast('Serviço atualizado com sucesso.', 'success');
      } else {
        await createAdminService(payload);
        showToast('Serviço criado com sucesso.', 'success');
      }

      resetForm();
      await loadData();
    } catch {
      showToast('Erro ao salvar serviço.', 'error');
    }
  }

  async function handleDelete(id: string) {
    openConfirmModal(
      'Excluir serviço',
      'Deseja realmente excluir este serviço?',
      async () => {
        try {
          setModalLoading(true);
          await deleteAdminService(id);
          setModalOpen(false);
          showToast('Serviço excluído com sucesso.', 'success');
          await loadData();
        } catch {
          showToast('Erro ao excluir serviço.', 'error');
        } finally {
          setModalLoading(false);
        }
      },
    );
  }

  return (
    <main className="text-[#7A624D]">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
          Meu negócio
        </p>
        <h1 className="text-4xl font-semibold">Gestão do negócio</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#8B735C]">
          Acompanhe o financeiro e gerencie os serviços oferecidos pelo espaço.
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          Carregando...
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                Hoje
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {formatCurrency(stats?.todayRevenue ?? 0)}
              </h2>
              <p className="mt-2 text-sm text-[#8B735C]">
                faturamento concluído hoje
              </p>
            </div>

            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                Semana
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {formatCurrency(stats?.weekRevenue ?? 0)}
              </h2>
              <p className="mt-2 text-sm text-[#8B735C]">
                faturamento concluído na semana
              </p>
            </div>

            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A98C72]">
                Mês
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {formatCurrency(stats?.monthRevenue ?? 0)}
              </h2>
              <p className="mt-2 text-sm text-[#8B735C]">
                faturamento concluído no mês
              </p>
            </div>
          </section>

          <section className="grid gap-8 xl:grid-cols-[0.95fr_1.25fr]">
            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                  Serviços
                </p>
                <h2 className="text-2xl font-semibold">
                  {editingId ? 'Editar serviço' : 'Novo serviço'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome do serviço"
                  value={form.name}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, name: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                />

                <textarea
                  placeholder="Descrição"
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px] w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço numérico"
                    value={form.price}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, price: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                  />

                  <input
                    type="text"
                    placeholder="Texto do preço (ex: Por avaliação)"
                    value={form.priceText}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        priceText: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    placeholder="Duração em minutos"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        durationMinutes: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          active: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Serviço ativo</span>
                  </label>
                </div>

                {/* ✅ NOVO: requiresImage checkbox */}
                <div className="rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.requiresImage}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          requiresImage: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">
                      Este serviço exige envio de imagem (ex: podologia)
                    </span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#A98C72] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                  >
                    {editingId ? 'Salvar alterações' : 'Adicionar serviço'}
                  </button>

                  {editingId ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
                    >
                      Cancelar edição
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
                  Serviços cadastrados
                </p>
                <h2 className="text-2xl font-semibold">Lista de serviços</h2>
              </div>

              {services.length === 0 ? (
                <div className="rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                  Nenhum serviço cadastrado.
                </div>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-[#E8DDD1] bg-[#FCFAF8] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold">{service.name}</h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                service.active
                                  ? 'bg-[#E9DED2] text-[#7A624D]'
                                  : 'bg-[#F3EEE8] text-[#7A624D]'
                              }`}
                            >
                              {service.active ? 'Ativo' : 'Inativo'}
                            </span>
                            {service.requiresImage && (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-300">
                                Exige imagem
                              </span>
                            )}
                          </div>

                          <p className="text-sm leading-7 text-[#8B735C]">
                            {service.description || 'Sem descrição.'}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#8B735C]">
                            <p>
                              <strong>Preço:</strong>{' '}
                              {service.priceText ??
                                (service.price != null ? `${service.price} €` : '-')}
                            </p>
                            <p>
                              <strong>Duração:</strong> {service.durationMinutes} min
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleEdit(service)}
                            className="rounded-full bg-[#F8F5F1] px-5 py-2.5 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD]"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDelete(service.id)}
                            className="rounded-full bg-[#EFE4D8] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#E7D6C7]"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

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