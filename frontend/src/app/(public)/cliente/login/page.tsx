'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginCustomer } from '@/services/customer-auth';

export default function LoginClientePage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha email e senha.');
      return;
    }

    try {
      setLoading(true);

      const data = await loginCustomer({
        email,
        password,
      });

      localStorage.setItem('customer_token', data.accessToken);
      localStorage.setItem('customer_data', JSON.stringify(data.customer));

      router.push('/cliente/painel');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao entrar.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F5F1] px-6 py-16 text-[#7A624D]">
      <div className="mx-auto max-w-lg rounded-[28px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#A98C72]">
          Área do cliente
        </p>
        <h1 className="text-3xl font-semibold">Entrar</h1>

        <p className="mt-3 text-sm leading-7 text-[#8B735C]">
          Entre na sua conta para acompanhar seus agendamentos.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#BFA58A] px-6 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}