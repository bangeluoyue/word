import 'server-only';

import { postgresClient } from 'lib/db/client';

export type UpdateNicknameResult =
  | { ok: true; nickname: string }
  | { ok: false; code: 'INVALID_INPUT' | 'USER_NOT_FOUND'; message: string };

export async function getUserNickname(userId: number): Promise<string | null> {
  const [user] = await postgresClient`
    select nick_name
    from public.app_users
    where id = ${userId}
    limit 1
  `;

  return typeof user?.nick_name === 'string' ? user.nick_name : null;
}

export async function updateNickname(input: {
  userId: number;
  nickname: string;
}): Promise<UpdateNicknameResult> {
  const nickname = input.nickname.trim();
  const characterCount = Array.from(nickname).length;

  if (
    characterCount < 2 ||
    characterCount > 24 ||
    /[\u0000-\u001f\u007f-\u009f]/.test(nickname)
  ) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: '昵称需要为 2–24 个字符，且不能包含控制字符',
    };
  }

  const [user] = await postgresClient`
    update public.app_users
    set nick_name = ${nickname}, updated_at = now()
    where id = ${input.userId}
    returning nick_name
  `;

  if (!user) {
    return {
      ok: false,
      code: 'USER_NOT_FOUND',
      message: '账号不存在，请重新登录',
    };
  }

  return { ok: true, nickname: String(user.nick_name) };
}
