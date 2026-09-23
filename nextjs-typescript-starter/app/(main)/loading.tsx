export default function MainLoading() {
  return (
    <div className="min-h-dvh animate-pulse px-5 pb-24 pt-10">
      <div className="h-8 w-32 rounded-xl bg-ink/10" />
      <div className="mt-3 h-4 w-56 rounded-lg bg-ink/[0.06]" />
      <div className="mt-10 h-36 rounded-[28px] bg-ink/[0.07]" />
      <div className="mt-8 h-6 w-36 rounded-lg bg-ink/10" />
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 rounded-[24px] bg-white" />
        ))}
      </div>
    </div>
  );
}

