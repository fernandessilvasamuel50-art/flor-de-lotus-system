'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SobrePage() {
  const diplomas = [
    '/diploma-1.jpg',
    '/diploma-2.jpg',
    '/diploma-3.jpg',
  ];

  const resultados = [
    {
      title: 'Manicure com verniz gel',
      images: ['/manicure-1.jpg', '/manicure-2.jpg'],
    },
    {
      title: 'Pedicure com verniz gel',
      images: ['/pedicure-1.jpg', '/pedicure-2.jpg'],
    },
    {
      title: 'Podologia especializada',
      images: ['/podologia-1.jpg', '/podologia-2.jpg'],
    },
  ];

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#A98C72]">
              Sobre nós
            </p>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Um cuidado profissional com delicadeza, atenção e bem-estar.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#8B735C]">
              O espaço Sunshine - Beauty Studio nasceu com a proposta de oferecer um
              atendimento acolhedor, elegante e comprometido com a saúde e a
              beleza dos pés.
            </p>

            <p className="mt-4 text-base leading-8 text-[#8B735C]">
              Cada atendimento é pensado com carinho, sempre buscando conforto,
              segurança e uma experiência mais leve para cada cliente.
            </p>

            <div className="mt-8">
              <Link
                href="/agendamento"
                className="rounded-full bg-[#BFA58A] px-7 py-3 text-white transition hover:opacity-90"
              >
                Fazer agendamento
              </Link>
            </div>
          </div>

          <div className="rounded-[36px] border border-[#E8DDD1] bg-white p-4 shadow-sm">
            <div className="relative h-[500px] overflow-hidden rounded-[28px] bg-[#F3EEE8]">
              <Image
                src="/roseli.jpg"
                alt="Profissional da Sunshine - Beauty Studio"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-[30px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Missão</h2>
            <p className="text-sm leading-7 text-[#8B735C]">
              Oferecer cuidados com excelência, promovendo saúde, autoestima e
              bem-estar através de um atendimento humano e profissional.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Visão</h2>
            <p className="text-sm leading-7 text-[#8B735C]">
              Ser reconhecida como referência em atendimento podológico e estético
              na região, com confiança, elegância e qualidade.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Valores</h2>
            <p className="text-sm leading-7 text-[#8B735C]">
              Cuidado, respeito, profissionalismo, atenção aos detalhes e
              compromisso com a experiência de cada cliente.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-[#7A624D]">
            Certificações e formação
          </h2>

          <p className="mt-3 max-w-3xl text-[#8B735C] leading-7">
            Formação profissional realizada no Brasil e em Portugal, com foco em
            podologia, manicure e pedicure profissional.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {diplomas.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setPreviewImage(image)}
                className="overflow-hidden rounded-3xl border border-[#E8DDD1] bg-white shadow-sm transition hover:scale-[1.02]"
              >
                <img
                  src={image}
                  alt={`Diploma ${index + 1}`}
                  className="h-72 w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-[#7A624D]">
            Resultados reais
          </h2>

          <p className="mt-3 max-w-3xl text-[#8B735C] leading-7">
            Alguns exemplos reais de atendimentos e resultados obtidos.
          </p>

          <div className="mt-8 grid gap-8">
            {resultados.map((grupo) => (
              <div key={grupo.title}>
                <h3 className="text-xl font-semibold text-[#7A624D]">{grupo.title}</h3>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {grupo.images.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setPreviewImage(image)}
                      className="overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-sm transition hover:scale-[1.02]"
                    >
                      <img
                        src={image}
                        alt={grupo.title}
                        className="h-48 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[36px] border border-[#E8DDD1] bg-white p-10 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#A98C72]">
            Contato
          </p>
          <h2 className="text-3xl font-semibold">Informações do espaço</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-[#FBF8F4] p-6">
              <h3 className="mb-3 text-lg font-semibold">Localização</h3>
              <p className="text-sm leading-7 text-[#8B735C]">
                  Rua Alexandre Herculano lote 11 loja C
                  <br />
                  Santa Eulalia, Albufeira
                  <br />
                  Código postal 8200-271
                </p>
            </div>

            <div className="rounded-3xl bg-[#FBF8F4] p-6">
              <h3 className="mb-3 text-lg font-semibold">Contato</h3>
              <p className="text-sm leading-7 text-[#8B735C]">
                WhatsApp: +351 922 296 253
                <br />
                Email: roselipereiradasilva2411@gmail.com
                <br />
                Instagram: @podologa_em_albufeira
              </p>
            </div>
          </div>
        </section>
      </main>

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
    </>
  );
}
