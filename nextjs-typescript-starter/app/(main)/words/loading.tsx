export default function WordsLoading() {
  return (
    <div className="min-h-dvh animate-pulse px-5 pb-24 pt-5">
      <div className="mx-auto mt-4 h-5 w-24 rounded-lg bg-ink/10" />
      <div className="mt-9 h-[52px] rounded-2xl bg-white" />
      <div className="mb-3 mt-5 h-4 w-24 rounded-lg bg-ink/[0.08]" />
      <div className="overflow-hidden rounded-[24px] bg-white">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[72px] border-b border-ink/[0.05] last:border-0" />
        ))}
      </div>
    </div>
  );
}
