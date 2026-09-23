import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m3.75 10.4 7.12-6.12a1.75 1.75 0 0 1 2.28 0l7.1 6.12v8.1a1.75 1.75 0 0 1-1.75 1.75h-13a1.75 1.75 0 0 1-1.75-1.75v-8.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 20.25v-5.5h5.5v5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.25 20c.5-4.05 2.75-6.08 6.75-6.08S18.25 15.95 18.75 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m15 5-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m5 12.5 4.25 4.25L19.5 6.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4.5" y="9.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9.5V7a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.75c.62 4.94 2.7 7.02 7.65 7.65-4.95.62-7.03 2.7-7.65 7.65-.63-4.95-2.7-7.03-7.65-7.65C9.3 9.77 11.37 7.69 12 2.75Z"
        fill="currentColor"
      />
      <path d="M19 16.5c.2 1.55.95 2.3 2.5 2.5-1.55.2-2.3.95-2.5 2.5-.2-1.55-.95-2.3-2.5-2.5 1.55-.2 2.3-.95 2.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m15.5 15.5 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m12 3.25 2.64 5.35 5.9.86-4.27 4.16 1.01 5.88L12 16.72 6.72 19.5l1.01-5.88-4.27-4.16 5.9-.86L12 3.25Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 10v4h3.2l4.3 3.5v-11L7.2 10H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M15 9.2a4 4 0 0 1 0 5.6M17.8 6.7a7.5 7.5 0 0 1 0 10.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function NotebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 3.75h11.25A1.75 1.75 0 0 1 19 5.5v13A1.75 1.75 0 0 1 17.25 20H6V3.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M6 3.75H4.75V20H6M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
