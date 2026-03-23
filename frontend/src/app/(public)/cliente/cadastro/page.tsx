'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerCustomer } from '@/services/customer-auth';

export default function CadastroClientePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      const data = await registerCustomer({
        name,
        email,
        phone,
        password,
      });

      localStorage.setItem('customer_token', data.accessToken);
      localStorage.setItem('customer_data', JSON.stringify(data.customer));

      router.push('/cliente/painel');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar cliente.';
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
        <h1 className="text-3xl font-semibold">Criar conta</h1>

        <p className="mt-3 text-sm leading-7 text-[#8B735C]">
          Crie sua conta para agilizar seus próximos agendamentos.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
          />

          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3"
          />

          <input
            type="text"
            placeholder="Seu telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </div>
    </main>
  );
}