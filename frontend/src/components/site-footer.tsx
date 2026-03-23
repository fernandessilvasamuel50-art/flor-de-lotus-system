import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8DDD1] bg-[#F8F5F1]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#7A624D]">
            Flor de Lótus Podologia
          </h3>
          <p className="text-sm leading-7 text-[#8B735C]">
            Atendimento com cuidado, delicadeza e profissionalismo, unindo
            bem-estar, estética e saúde em cada detalhe.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#7A624D]">
            Navegação
          </h3>
          <div className="flex flex-col gap-2 text-sm text-[#8B735C]">
            <Link href="/" className="hover:text-[#A98C72]">
              Início
            </Link>
            <Link href="/sobre" className="hover:text-[#A98C72]">
              Sobre nós
            </Link>
            <Link href="/agendamento" className="hover:text-[#A98C72]">
              Agendamento
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#7A624D]">
            Contato
          </h3>
          <div className="space-y-2 text-sm text-[#8B735C]">
            <p>Avenida Sá Carneiro loja B Edifício isemar 8200-298 Albufeira, Portugal</p>
            <p>Telefone / WhatsApp: +351 922 296 253 </p>
            <p>Email: roselipereiradasilva2411@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8DDD1] px-6 py-4 text-center text-xs text-[#8B735C]">
        © 2026 R & S Systems. Todos os direitos reservados.
      </div>
    </footer>
  );
}