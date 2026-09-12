'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin } from '@/services/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAdmin({ email, password });
      localStorage.setItem('admin_token', response.accessToken);
      localStorage.setItem('admin_data', JSON.stringify(response.admin));
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-semibold text-[#7A624D]">Admin</h1>
          <p className="mt-2 text-sm text-[#8B735C]">
            Acesse o painel de gestão da Sublime Pés
          </p>
        </div>

        <div className="rounded-[28px] border border-[#E8DDD1] bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                placeholder="admin@sublimepes.pt"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#8B735C]">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#DCCDBE] bg-white px-4 py-3 outline-none transition focus:border-[#BFA58A]"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#BFA58A] px-6 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[#A98C72] hover:underline"
            >
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
