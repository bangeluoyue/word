import { AuthPopup } from 'components/auth/auth-popup';
import { SparkleIcon, UserIcon } from 'components/ui/icons';

export function GuestPanel({
  initialOpen,
  initialMode,
  returnTo,
}: {
  initialOpen: boolean;
  initialMode: 'login' | 'register';
  returnTo: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-white px-6 py-10 text-center shadow-card">
      <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-mint/80" />
      <div className="absolute -bottom-7 -right-6 h-24 w-24 rounded-full bg-sun/25" />
      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-forest text-white shadow-feature">
          <UserIcon className="h-10 w-10" />
          <span className="absolute ml-16 mt-14 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-sun text-forest">
            <SparkleIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <h2 className="mt-6 text-xl font-black tracking-tight text-ink">把进度好好收藏起来</h2>
        <p className="mx-auto mt-2 max-w-[270px] text-sm leading-6 text-ink/50">
          登录后同步学习记录，下次回来就从刚刚学到的地方继续。
        </p>
        <div className="mx-auto mt-7 max-w-[260px]">
          <AuthPopup
            initialOpen={initialOpen}
            initialMode={initialMode}
            returnTo={returnTo}
          />
        </div>
        <p className="mt-4 text-[11px] text-ink/35">注册无需验证码 · 密码安全加密保存</p>
      </div>
    </div>
  );
}

