'use client';

import { useEffect, useRef, useState } from 'react';

import { SpeakerIcon } from 'components/ui/icons';

type Accent = 'uk' | 'us';
type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'error';

let sharedAudio: HTMLAudioElement | undefined;

function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'none';
  }
  return sharedAudio;
}

export function PronunciationControls({
  headword,
  ukphone,
  usphone,
  variant = 'plain',
}: {
  headword: string;
  ukphone?: string;
  usphone?: string;
  variant?: 'plain' | 'inverse';
}) {
  const audioRef = useRef<HTMLAudioElement>();
  const playRequestRef = useRef(0);
  const [activeAccent, setActiveAccent] = useState<Accent>();
  const [status, setStatus] = useState<PlaybackStatus>('idle');

  useEffect(() => {
    const audio = getSharedAudio();

    function markPlaying() {
      setStatus('playing');
    }

    function markFinished() {
      setStatus('idle');
      setActiveAccent(undefined);
    }

    function markFailed() {
      setStatus('error');
    }

    audio.addEventListener('playing', markPlaying);
    audio.addEventListener('ended', markFinished);
    audio.addEventListener('error', markFailed);
    audioRef.current = audio;

    return () => {
      playRequestRef.current += 1;
      audio.removeEventListener('playing', markPlaying);
      audio.removeEventListener('ended', markFinished);
      audio.removeEventListener('error', markFailed);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    playRequestRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setActiveAccent(undefined);
    setStatus('idle');
  }, [headword]);

  if (!ukphone && !usphone) return null;

  async function play(accent: Accent) {
    const audio = audioRef.current;
    if (!audio) {
      setStatus('error');
      return;
    }

    const requestId = ++playRequestRef.current;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setActiveAccent(accent);
    setStatus('loading');
    audio.src = `/api/pronunciation?${new URLSearchParams({
      word: headword,
      accent,
    }).toString()}`;
    audio.load();

    try {
      await audio.play();
    } catch (error) {
      if (requestId !== playRequestRef.current) return;
      const interrupted = error instanceof Error && error.name === 'AbortError';
      if (!interrupted) setStatus('error');
    }
  }

  const accentName = activeAccent === 'uk' ? '英式' : '美式';
  const statusMessage = status === 'loading'
    ? `正在加载${accentName}发音…`
    : status === 'playing'
      ? `正在播放${accentName}发音`
      : status === 'error'
        ? '发音暂不可用'
        : '';

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {usphone && (
          <PronunciationButton
            accent="us"
            activeAccent={activeAccent}
            headword={headword}
            label="美"
            onPlay={play}
            phone={usphone}
            status={status}
            variant={variant}
          />
        )}
        {ukphone && (
          <PronunciationButton
            accent="uk"
            activeAccent={activeAccent}
            headword={headword}
            label="英"
            onPlay={play}
            phone={ukphone}
            status={status}
            variant={variant}
          />
        )}
      </div>
      <p
        className={`mt-2 min-h-4 text-center text-[10px] font-bold ${
          status === 'error'
            ? variant === 'inverse'
              ? 'text-coral'
              : 'text-coral-dark'
            : variant === 'inverse'
              ? 'text-white/55'
              : 'text-ink/35'
        }`}
        role={status === 'error' ? 'alert' : 'status'}
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </div>
  );
}

function PronunciationButton({
  accent,
  activeAccent,
  headword,
  label,
  onPlay,
  phone,
  status,
  variant,
}: {
  accent: Accent;
  activeAccent?: Accent;
  headword: string;
  label: '英' | '美';
  onPlay: (accent: Accent) => Promise<void>;
  phone: string;
  status: PlaybackStatus;
  variant: 'plain' | 'inverse';
}) {
  const active = accent === activeAccent;
  const loading = active && status === 'loading';
  const playing = active && status === 'playing';
  const accentName = accent === 'uk' ? '英式' : '美式';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-xs font-medium ${
        variant === 'inverse'
          ? 'border border-white/10 bg-white/10 text-white/75'
          : 'bg-paper text-ink/45'
      }`}
    >
      <button
        type="button"
        onClick={() => void onPlay(accent)}
        className={`ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun ${
          variant === 'inverse'
            ? active
              ? 'bg-sun text-forest'
              : 'bg-white/10 text-sun hover:bg-white/20'
            : active
              ? 'bg-forest text-white'
              : 'bg-mint text-forest hover:bg-mint-strong/45'
        }`}
        aria-label={`${playing ? '重新播放' : '播放'}${headword}的${accentName}发音`}
        aria-pressed={playing}
        title={`播放${accentName}发音`}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : (
          <SpeakerIcon className={`h-4 w-4 ${playing ? 'animate-pulse' : ''}`} />
        )}
      </button>
      <span><b className={variant === 'inverse' ? 'text-sun' : 'text-forest'}>{label}</b> /{phone}/</span>
    </span>
  );
}
