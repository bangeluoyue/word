import { BottomTabs } from 'components/navigation/bottom-tabs';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-paper shadow-app">
      <main className="pb-[calc(76px+env(safe-area-inset-bottom))]">{children}</main>
      <BottomTabs />
    </div>
  );
}

