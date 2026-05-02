'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export function SiteHeader() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer_data');

    if (!storedCustomer) {
      setCustomer(null);
      return;
    }

    try {
      const parsedCustomer = JSON.parse(storedCustomer) as CustomerData;
      setCustomer(parsedCustomer);
    } catch {
      localStorage.removeItem('customer_data');
      localStorage.removeItem('customer_token');
      setCustomer(null);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DDD1] bg-[#F8F5F1]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#DCCDBE] bg-[#F3EEE8] sm:h-12 sm:w-12">
            <Image
              src="/logo.png"
              alt="Sunshine - Beauty Studio"
              fill
              className="object-contain p"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-[0.2em] text-[#A98C72] sm:text-sm">
              SUNSHINE BEAUTY STUDIO
            </p>
            <p className="truncate text-[11px] text-[#8B735C] sm:text-xs">
              Podologia & Bem-estar
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#7A624D] md:flex">
          <Link href="/" className="transition hover:text-[#A98C72]">
            Início
          </Link>
          <Link href="/sobre" className="transition hover:text-[#A98C72]">
            Sobre nós
          </Link>
          <Link href="/agendamento" className="transition hover:text-[#A98C72]">
            Agendamento
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {customer ? (
            <>
              <Link
                href="/cliente/painel"
                className="hidden rounded-full bg-[#F8F5F1] px-4 py-2 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD] sm:inline-flex"
              >
                Minha conta
              </Link>

              <Link
                href="/agendamento"
                className="shrink-0 rounded-full bg-[#BFA58A] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Agendar
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/cliente/login"
                className="hidden rounded-full bg-[#F8F5F1] px-4 py-2 text-sm font-medium text-[#7A624D] ring-1 ring-[#DCCDBE] transition hover:bg-[#F1E7DD] sm:inline-flex"
              >
                Entrar
              </Link>

              <Link
                href="/cliente/cadastro"
                className="hidden rounded-full border border-[#BFA58A] px-4 py-2 text-sm font-medium text-[#7A624D] transition hover:bg-[#F1E7DD] sm:inline-flex"
              >
                Criar conta
              </Link>

              <Link
                href="/agendamento"
                className="shrink-0 rounded-full bg-[#BFA58A] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Agendar
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-[#E8DDD1] px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
          >
            Início
          </Link>
          <Link
            href="/sobre"
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
          >
            Sobre
          </Link>
          <Link
            href="/agendamento"
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
          >
            Agendamento
          </Link>

          {customer ? (
            <Link
              href="/cliente/painel"
              className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
            >
              Minha conta
            </Link>
          ) : (
            <>
              <Link
                href="/cliente/login"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Entrar
              </Link>
              <Link
                href="/cliente/cadastro"
                className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#E8DDD1]"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}