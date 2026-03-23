type ToastProps = {
  open: boolean;
  message: string;
  type?: 'success' | 'error';
};

export function UiToast({
  open,
  message,
  type = 'success',
}: ToastProps) {
  if (!open) return null;

  const styles =
    type === 'success'
      ? 'border-[#DCCDBE] bg-[#FBF8F4] text-[#7A624D]'
      : 'border-red-200 bg-red-50 text-red-700';

  return (
    <div className="fixed right-4 top-24 z-[110] w-[calc(100%-2rem)] max-w-sm">
      <div className={`rounded-2xl border px-4 py-3 shadow-lg ${styles}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
