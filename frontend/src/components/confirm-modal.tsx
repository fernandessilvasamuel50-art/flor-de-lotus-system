type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Voltar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#E8DDD1] bg-white p-6 shadow-xl">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#A98C72]">
          Confirmação
        </p>

        <h2 className="text-2xl font-semibold text-[#7A624D]">{title}</h2>

        <p className="mt-3 text-sm leading-7 text-[#8B735C]">{description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-[#DCCDBE] bg-white px-5 py-2.5 text-sm font-medium text-[#7A624D] transition hover:bg-[#F8F5F1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-[#BFA58A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
