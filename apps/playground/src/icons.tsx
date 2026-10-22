/** Small stroke icons for the playground. Decorative: the buttons carry the name. */
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const IconCopy = () => (
  <svg {...base}>
    <rect x="5.25" y="5.25" width="8" height="8" rx="1.75" />
    <path d="M10.75 2.75h-6a2 2 0 0 0-2 2v6" />
  </svg>
);
export const IconShare = () => (
  <svg {...base}>
    <path d="M8 2.5v8M5 5.5l3-3 3 3M3.5 9v3a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V9" />
  </svg>
);
export const IconMore = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <circle cx="3.5" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="12.5" cy="8" r="1.25" />
  </svg>
);
export const IconBold = () => (
  <svg {...base}>
    <path d="M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z" />
  </svg>
);
export const IconList = () => (
  <svg {...base}>
    <path d="M6 4h7.5M6 8h7.5M6 12h7.5M2.75 4h.01M2.75 8h.01M2.75 12h.01" />
  </svg>
);
