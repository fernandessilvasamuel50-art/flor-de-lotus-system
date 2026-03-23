import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F5F1] text-[#7A624D]">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#A98C72]">
              Flor de Lótus Podologia
            </p>

            <h2 className="text-5xl font-semibold leading-tight">
              Cuidado, leveza e bem-estar em cada atendimento.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8B735C]">
              Um espaço acolhedor e profissional para quem busca saúde, estética
              e conforto, com agendamento online simples e elegante.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/agendamento"
                className="rounded-full bg-[#BFA58A] px-7 py-3 text-white transition hover:opacity-90"
              >
                Agendar agora
              </Link>

              <Link
                href="/sobre"
                className="rounded-full border border-[#BFA58A] px-7 py-3 text-[#7A624D] transition hover:bg-[#F1E7DD]"
              >
                Conhecer o espaço
              </Link>
            </div>
          </div>

          <div className="rounded-[36px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
            <div className="rounded-[28px] bg-[#FBF8F4] p-8">
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
                Atendimento profissional
              </p>
              <h3 className="text-3xl font-semibold">
                Agendamento online com praticidade
              </h3>
              <p className="mt-4 text-base leading-7 text-[#8B735C]">
                Escolha o serviço, selecione a data, veja horários disponíveis e
                envie sua solicitação de forma rápida.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}