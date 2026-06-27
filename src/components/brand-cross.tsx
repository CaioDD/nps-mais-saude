export default function BrandCross({ className = '' }: { className?: string }) {
  return (
    <span className={`cross ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <rect x="9.5" y="3" width="5" height="18" rx="2.5" fill="currentColor" />
        <rect x="3" y="9.5" width="18" height="5" rx="2.5" fill="currentColor" />
      </svg>
    </span>
  );
}
