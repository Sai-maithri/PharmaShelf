import { useId } from 'react';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = 'w-8 h-8' }: BrandLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `ps-bg-${uid}`;
  const sheenId = `ps-sheen-${uid}`;
  const capId = `ps-cap-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="55%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={sheenId} x1="8" y1="4" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={capId} x1="28" y1="14" x2="50" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
      </defs>

      {/* Squircle liquid-glass badge */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bgId})`} />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        fill={`url(#${sheenId})`}
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {/* Left architectural shelf pillar */}
      <rect x="14" y="15" width="5.5" height="34" rx="2.75" fill="#ffffff" />

      {/* Top shelf bracket & tilted capsule emblem */}
      <path
        d="M17 17.75H31.5C35.09 17.75 38 20.66 38 24.25C38 27.84 35.09 30.75 31.5 30.75H17"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Diagonal two-tone capsule */}
      <g transform="translate(42.5 23.5) rotate(-42)">
        <rect x="-10" y="-5" width="20" height="10" rx="5" fill="#ffffff" />
        <path d="M0 -5H5C7.76 -5 10 -2.76 10 0C10 2.76 7.76 5 5 5H0V-5Z" fill="#5eead4" />
      </g>

      {/* Dual pharmacy shelf tiers */}
      <rect x="24" y="37.5" width="26" height="4.5" rx="2.25" fill={`url(#${capId})`} />
      <rect x="24" y="44.5" width="18" height="4.5" rx="2.25" fill="#ffffff" fillOpacity="0.88" />
      <circle cx="47.5" cy="46.75" r="2.5" fill="#5eead4" />
    </svg>
  );
}
