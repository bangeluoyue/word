import { MailIcon, SparkleIcon } from 'components/ui/icons';

import { NicknameEditor } from './nickname-editor';
import { LogoutButton } from './logout-button';

export function AccountCard({
  email,
  nickname,
}: {
  email: string;
  nickname: string | null;
}) {
  const displayName = nickname ?? email;
  const avatarText = Array.from(displayName)[0]?.toLocaleUpperCase() ?? '?';

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-forest p-5 text-white shadow-feature">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[22px] border-white/[0.04]" />
      <div className="relative flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sun text-lg font-black uppercase text-forest">
          {avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-sun">
            <SparkleIcon className="h-3 w-3" /> Learning account
          </p>
          {nickname && (
            <p className="mt-1 truncate text-lg font-black text-white">
              {nickname}
            </p>
          )}
          <p className={`${nickname ? 'mt-0.5 text-xs text-white/55' : 'mt-1.5 text-sm text-white/90'} flex items-center gap-1.5 truncate font-semibold`}>
            <MailIcon className="h-4 w-4 shrink-0 text-white/45" />
            {email}
          </p>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <NicknameEditor nickname={nickname} />
        <LogoutButton />
      </div>
    </section>
  );
}
