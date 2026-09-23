export function ProgressBar({
  value,
  tone = 'dark',
}: {
  value: number;
  tone?: 'dark' | 'light' | 'mint';
}) {
  const safeValue = Math.min(100, Math.max(0, Math.round(value)));
  const track = tone === 'light' ? 'bg-white/20' : 'bg-ink/8';
  const fill =
    tone === 'light' ? 'bg-sun' : tone === 'mint' ? 'bg-mint-strong' : 'bg-ink';

  return (
    <div
      className={`h-2 overflow-hidden rounded-full ${track}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${fill}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

