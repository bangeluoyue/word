import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUEST_TIMEOUT_MS = 3_000;
const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.trim() ?? '';
  const accent = searchParams.get('accent');

  if (
    !word ||
    word.length > 100 ||
    controlCharacterPattern.test(word) ||
    (accent !== 'uk' && accent !== 'us')
  ) {
    return pronunciationError(400);
  }

  let encodedWord: string;
  try {
    encodedWord = encodeURIComponent(word);
  } catch {
    return pronunciationError(400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const type = accent === 'uk' ? '1' : '2';
    const upstream = await fetch(
      `https://dict.youdao.com/dictvoice?audio=${encodedWord}&type=${type}`,
      {
        cache: 'no-store',
        headers: { Accept: 'audio/*' },
        redirect: 'follow',
        signal: controller.signal,
      },
    );
    const contentType = upstream.headers.get('content-type')?.split(';')[0].trim();
    const declaredLength = Number(upstream.headers.get('content-length') ?? '0');

    if (
      !upstream.ok ||
      !contentType?.toLowerCase().startsWith('audio/') ||
      (declaredLength > 0 && declaredLength > MAX_AUDIO_BYTES)
    ) {
      return pronunciationError(502);
    }

    const audio = await upstream.arrayBuffer();
    if (audio.byteLength === 0 || audio.byteLength > MAX_AUDIO_BYTES) {
      return pronunciationError(502);
    }

    return new Response(audio, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Length': String(audio.byteLength),
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return pronunciationError(timedOut ? 504 : 502);
  } finally {
    clearTimeout(timeout);
  }
}

function pronunciationError(status: 400 | 502 | 504) {
  return NextResponse.json(
    { error: '发音暂不可用' },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
