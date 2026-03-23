'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getServices } from '@/services/services';
import {
  createAppointment,
  getAvailability,
} from '@/services/appointments';

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

type LoggedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AgendamentoPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // NOVOS ESTADOS PARA UPLOAD E NOTAS
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  // ✅ ESTADO PARA PREVIEW DE IMAGEM DA GALERIA
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ✅ ESTADO PARA MODAL DE SUCESSO
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [loggedCustomer, setLoggedCustomer] = useState<LoggedCustomer | null>(
    null,
  );
  const [scheduleForAnotherPerson, setScheduleForAnotherPerson] =
    useState(false);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices();
        setServices(data);
      } catch {
        setErrorMessage('Não foi possível carregar os serviços.');
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer_data');

    if (!storedCustomer) return;

    try {
      const parsedCustomer = JSON.parse(storedCustomer) as LoggedCustomer;
      setLoggedCustomer(parsedCustomer);

      setCustomerName(parsedCustomer.name || '');
      setCustomerPhone(parsedCustomer.phone || '');
      setCustomerEmail(parsedCustomer.email || '');
    } catch {
      localStorage.removeItem('customer_data');
      localStorage.removeItem('customer_token');
    }
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDate || selectedServiceIds.length === 0) {
        setAvailableSlots([]);
        setAllSlots([]);
        setSelectedTime('');
        return;
      }

      setLoadingSlots(true);
      setErrorMessage('');

      try {
        const data = await getAvailability(selectedDate, selectedServiceIds);
        
        console.log('availability response:', data);

        setAvailableSlots(data.availableSlots || []);
        setAllSlots(data.allSlots || []);
        setSelectedTime('');
      } catch {
        setErrorMessage('Não foi possível carregar os horários disponíveis.');
        setAvailableSlots([]);
        setAllSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [selectedDate, selectedServiceIds]);

  useEffect(() => {
    if (!loggedCustomer) return;

    if (!scheduleForAnotherPerson) {
      setCustomerName(loggedCustomer.name || '');
      setCustomerPhone(loggedCustomer.phone || '');
      setCustomerEmail(loggedCustomer.email || '');
      return;
    }

    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
  }, [scheduleForAnotherPerson, loggedCustomer]);

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds],
  );

  const totalDuration = useMemo(() => {
    return selectedServices.reduce(
      (total, service) => total + service.durationMinutes,
      0,
    );
  }, [selectedServices]);

  // ✅ GALERIA POR SERVIÇO SELECIONADO
  const serviceGallery = useMemo(() => {
    const galleryMap: Record<
      string,
      {
        title: string;
        description: string;
        images: string[];
      }
    > = {
      manicure: {
        title: 'Resultados de manicure com verniz gel',
        description: 'Veja alguns resultados reais do serviço de manicure.',
        images: ['/manicure-1.jpg', '/manicure-2.jpg'],
      },
      pedicure: {
        title: 'Resultados de pedicure com verniz gel',
        description: 'Veja alguns resultados reais do serviço de pedicure.',
        images: ['/pedicure-1.jpg', '/pedicure-2.jpg'],
      },
      podologia: {
        title: 'Antes e depois de podologia',
        description: 'Alguns casos reais atendidos pelo espaço.',
        images: ['/podologia-1.jpg', '/podologia-2.jpg'],
      },
    };

    return selectedServices
      .map((service) => {
        const name = service.name.toLowerCase();

        if (name.includes('manicure')) return galleryMap.manicure;
        if (name.includes('pedicure')) return galleryMap.pedicure;
        if (name.includes('podologia')) return galleryMap.podologia;

        return null;
      })
      .filter(Boolean)
      .filter(
        (item, index, array) =>
          array.findIndex((gallery) => gallery?.title === item?.title) === index,
      );
  }, [selectedServices]);

  const finalCustomerName = customerName.trim();
  const finalCustomerPhone = customerPhone.trim();
  const finalCustomerEmail = customerEmail.trim();

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessModalOpen(false);

    if (selectedServiceIds.length === 0) {
      setErrorMessage('Selecione pelo menos um serviço.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Selecione uma data.');
      return;
    }

    if (!selectedTime) {
      setErrorMessage('Selecione um horário disponível.');
      return;
    }

    if (!finalCustomerName) {
      setErrorMessage('Informe o nome do cliente.');
      return;
    }

    if (!finalCustomerPhone) {
      setErrorMessage('Informe o telefone do cliente.');
      return;
    }

    if (!finalCustomerEmail) {
      setErrorMessage('Informe o email do cliente.');
      return;
    }

    // ✅ VALIDAÇÃO: usa requiresImage em vez de nome do serviço
    const requiresImage = selectedServices.some((service) => service.requiresImage === true);

    if (requiresImage && !imageFile) {
      setErrorMessage('Este serviço exige o envio de uma foto para análise.');
      return;
    }

    setSubmitting(true);

    try {
      // 🔁 UPLOAD REAL
      let imageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Erro ao enviar imagem.');
        }

        imageUrl = `${API_URL}${result.url}`;
      }

      // Criar agendamento com a URL real da imagem
      await createAppointment({
        serviceIds: selectedServiceIds,
        date: selectedDate,
        startTime: selectedTime,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        customerEmail: finalCustomerEmail,
        imageUrl,
        notes,
      });

      // ✅ ABRIR MODAL DE SUCESSO (em vez da barrinha)
      setSuccessModalOpen(true);

      // Reset dos campos
      setSelectedServiceIds([]);
      setSelectedDate('');
      setAvailableSlots([]);
      setAllSlots([]);
      setSelectedTime('');
      setImageFile(null);
      setNotes('');

      if (loggedCustomer && !scheduleForAnotherPerson) {
        setCustomerName(loggedCustomer.name || '');
        setCustomerPhone(loggedCustomer.phone || '');
        setCustomerEmail(loggedCustomer.email || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao enviar a solicitação.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>  
      <main className="min-h-screen bg-[#F8F5F1] px-6 py-12 text-[#7A624D]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
              Agendamento online
            </p>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Escolha o dia, o horário e envie sua solicitação
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#8B735C]">
              Selecione um ou mais serviços, escolha a data desejada e veja os
              horários disponíveis na agenda. Depois, preencha seus dados para
              enviar a solicitação de atendimento.
            </p>

            {loggedCustomer ? (
              <div className="mt-6 inline-flex rounded-full border border-[#E8DDD1] bg-white px-4 py-2 text-sm text-[#8B735C] shadow-sm">
                Você está logado como <strong className="ml-1">{loggedCustomer.name}</strong>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/cliente/login"
                  className="rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Entrar
                </Link>

                <Link
                  href="/cliente/cadastro"
                  className="rounded-full border border-[#BFA58A] px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#F1E7DD]"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 rounded-[32px] border border-[#E8DDD1] bg-white p-8 shadow-sm"
          >
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                1. Escolha o serviço
              </h2>

              {loadingServices ? (
                <div className="rounded-2xl border border-dashed border-[#DCCDBE] px-4 py-3 text-sm text-[#8B735C]">
                  Carregando serviços...
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {services.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);

                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`rounded-3xl border p-5 text-left transition ${
                          isSelected
                            ? 'border-[#BFA58A] bg-[#F4ECE4]'
                            : 'border-[#E8DDD1] bg-white hover:bg-[#FBF8F4]'
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isSelected
                                ? 'bg-[#BFA58A] text-white'
                                : 'bg-[#F3EEE8] text-[#8B735C]'
                            }`}
                          >
                            {isSelected ? 'Selecionado' : 'Selecionar'}
                          </span>
                        </div>

                        <p className="mb-4 min-h-[72px] text-sm leading-6 text-[#8B735C]">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="font-medium text-[#A98C72]">
                            {service.priceText ?? `${service.price} €`}
                          </p>

                          <p className="text-sm text-[#8B735C]">
                            {service.durationMinutes} min
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedServices.length > 0 ? (
                <p className="mt-4 text-sm text-[#8B735C]">
                  Serviços selecionados:{' '}
                  <strong>
                    {selectedServices.map((service) => service.name).join(', ')}
                  </strong>
                </p>
              ) : null}
            </section>

            {/* ✅ GALERIA POR SERVIÇO SELECIONADO */}
            {serviceGallery.length > 0 ? (
              <section className="rounded-3xl bg-[#FBF8F4] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Inspirações e resultados</h2>

                <div className="grid gap-6">
                  {serviceGallery.map((gallery) =>
                    gallery ? (
                      <div key={gallery.title}>
                        <h3 className="text-lg font-semibold text-[#7A624D]">
                          {gallery.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#8B735C]">
                          {gallery.description}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          {gallery.images.map((image) => (
                            <button
                              key={image}
                              type="button"
                              onClick={() => setPreviewImage(image)}
                              className="overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-sm transition hover:scale-[1.02]"
                            >
                              <img
                                src={image}
                                alt={gallery.title}
                                className="h-40 w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              </section>
            ) : null}

            <section className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-semibold">2. Escolha a data</h2>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-4 outline-none transition focus:border-[#BFA58A]"
                />
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  3. Escolha o horário
                </h2>

                {!selectedDate ? (
                  <div className="rounded-2xl border border-dashed border-[#DCCDBE] px-4 py-4 text-sm text-[#8B735C]">
                    Selecione uma data para ver os horários disponíveis.
                  </div>
                ) : loadingSlots ? (
                  <div className="rounded-2xl border border-dashed border-[#DCCDBE] px-4 py-4 text-sm text-[#8B735C]">
                    Carregando horários...
                  </div>
                ) : allSlots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#DCCDBE] px-4 py-4 text-sm text-[#8B735C]">
                    Nenhum horário foi gerado para esta combinação de serviços e data.
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-[#8B735C]">
                      Horários em cinza estão indisponíveis.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {allSlots.map((slot) => {
                        const isAvailable = availableSlots.includes(slot);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedTime(slot)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              !isAvailable
                                ? 'cursor-not-allowed border-[#E8DDD1] bg-[#F3EEE8] text-[#B7A08A]'
                                : isSelected
                                ? 'border-[#BFA58A] bg-[#F4ECE4]'
                                : 'border-[#E8DDD1] bg-white hover:bg-[#FBF8F4]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ✅ BLOCO DE UPLOAD DE IMAGEM E NOTAS (USANDO requiresImage) */}
            {selectedServices.some(s => s.requiresImage === true) && (
              <div className="mt-4">
                <label className="block text-sm mb-2 text-[#8B735C]">
                  Enviar foto para avaliação
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#BFA58A] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                />

                <textarea
                  placeholder="Descreva o problema (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#BFA58A]"
                  rows={3}
                />
              </div>
            )}

            <section className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">4. Dados do cliente</h2>

                  {loggedCustomer ? (
                    <label className="flex items-center gap-2 text-sm text-[#8B735C]">
                      <input
                        type="checkbox"
                        checked={scheduleForAnotherPerson}
                        onChange={(e) =>
                          setScheduleForAnotherPerson(e.target.checked)
                        }
                      />
                      Agendar para outra pessoa
                    </label>
                  ) : null}
                </div>

                {loggedCustomer && !scheduleForAnotherPerson ? (
                  <div className="mb-4 rounded-2xl bg-[#FBF8F4] px-4 py-4 text-sm text-[#8B735C]">
                    Seus dados foram preenchidos automaticamente. Marque a opção
                    acima se quiser agendar para outra pessoa.
                  </div>
                ) : null}

                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    readOnly={!!loggedCustomer && !scheduleForAnotherPerson}
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-4 outline-none transition focus:border-[#BFA58A] read-only:bg-[#F8F5F1] read-only:text-[#8B735C]"
                  />

                  <input
                    type="text"
                    placeholder="Telefone do cliente"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    readOnly={!!loggedCustomer && !scheduleForAnotherPerson}
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-4 outline-none transition focus:border-[#BFA58A] read-only:bg-[#F8F5F1] read-only:text-[#8B735C]"
                  />

                  <input
                    type="email"
                    placeholder="Email do cliente"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    readOnly={!!loggedCustomer && !scheduleForAnotherPerson}
                    className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-4 outline-none transition focus:border-[#BFA58A] read-only:bg-[#F8F5F1] read-only:text-[#8B735C]"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#FBF8F4] p-6">
                <h2 className="mb-5 text-2xl font-semibold">Resumo</h2>

                <div className="space-y-3 text-sm leading-6 text-[#8B735C]">
                  <p>
                    <strong>Serviços:</strong>{' '}
                    {selectedServices.length > 0
                      ? selectedServices.map((service) => service.name).join(', ')
                      : 'Não selecionados'}
                  </p>

                  <p>
                    <strong>Duração estimada:</strong>{' '}
                    {totalDuration > 0 ? `${totalDuration} min` : 'Não calculada'}
                  </p>

                  <p>
                    <strong>Data:</strong> {selectedDate || 'Não selecionada'}
                  </p>

                  <p>
                    <strong>Horário:</strong> {selectedTime || 'Não selecionado'}
                  </p>

                  <p>
                    <strong>Cliente:</strong>{' '}
                    {finalCustomerName || 'Não informado'}
                  </p>

                  <p>
                    <strong>Telefone:</strong>{' '}
                    {finalCustomerPhone || 'Não informado'}
                  </p>

                  <p>
                    <strong>Email:</strong>{' '}
                    {finalCustomerEmail || 'Não informado'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-full bg-[#BFA58A] px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : 'Enviar solicitação'}
                </button>
              </div>
            </section>
          </form>
        </div>
      </main>

      {/* ✅ MODAL DE AMPLIAR IMAGEM */}
      {previewImage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#7A624D]"
            >
              Fechar
            </button>

            <img
              src={previewImage}
              alt="Imagem ampliada"
              className="max-h-[90vh] w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      ) : null}

      {/* ✅ MODAL DE SUCESSO */}
      {successModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-xl">
            <div className="text-center">
              <div className="mb-4 text-6xl">🌸</div>
              <h3 className="mb-2 text-2xl font-semibold text-[#7A624D]">
                Tudo certo com o seu pedido!
              </h3>
              <p className="mb-6 text-sm leading-6 text-[#8B735C]">
                Sua solicitação foi enviada com sucesso. Em breve, o espaço Flor de Lótus irá analisar seu pedido. Você receberá atualizações por e-mail.
              </p>
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="w-full rounded-full bg-[#BFA58A] px-6 py-3 text-white transition hover:opacity-90"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}