'use client';

import { logoutAction } from 'app/actions/auth-actions';

export function LogoutButton() {
  return (
    <form
      action={logoutAction}
      className="w-full"
      onSubmit={(event) => {
        if (!window.confirm('确定要退出登录吗？你的学习进度会继续保留。')) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="min-h-11 w-full rounded-full border border-white/15 px-4 text-xs font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        退出登录
      </button>
    </form>
  );
}
