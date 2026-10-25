/**
 * The course mark: a chat bubble holding a command-line prompt (`>_`), with a
 * small spark beside it, a prompt that makes something. Custom-drawn for this
 * course. Callers control size via `className`; the colours are fixed (violet
 * bubble, cyan spark) so the mark looks the same in light and dark themes.
 */
export function PromptLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="#7C3AED"
        d="M5.5 4h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H9.2l-4 3.3A.75.75 0 0 1 4 19.7v-2.9A4 4 0 0 1 1.5 13V8a4 4 0 0 1 4-4Z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 8.6 8.2 10.6 5.5 12.6M10 12.6h4"
      />
      <path
        fill="#22D3EE"
        d="M20.2.5c.25 1.75 1.55 3.05 3.3 3.3-1.75.25-3.05 1.55-3.3 3.3-.25-1.75-1.55-3.05-3.3-3.3 1.75-.25 3.05-1.55 3.3-3.3Z"
      />
    </svg>
  );
}
