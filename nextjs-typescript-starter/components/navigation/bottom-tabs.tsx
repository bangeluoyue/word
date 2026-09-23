'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HomeIcon, UserIcon } from 'components/ui/icons';

const tabs = [
  { href: '/', label: '首页', Icon: HomeIcon },
  { href: '/mine', label: '我的', Icon: UserIcon },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-ink/5 bg-white/95 px-8 pb-[env(safe-area-inset-bottom)] shadow-tab backdrop-blur-xl"
      aria-label="主导航"
    >
      <div className="grid h-16 grid-cols-2">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === '/'
              ? pathname === '/' || pathname.startsWith('/words')
              : pathname.startsWith(href) || pathname.startsWith('/notebooks');
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                active ? 'text-forest' : 'text-ink/40 hover:text-ink/70'
              }`}
            >
              <span
                className={`absolute top-0 h-[3px] w-8 rounded-b-full transition ${
                  active ? 'bg-sun' : 'bg-transparent'
                }`}
              />
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
