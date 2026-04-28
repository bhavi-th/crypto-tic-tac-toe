import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// Build a compact list of page numbers with "…" gaps for long ranges.
const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const NavBtn = ({ onClick, disabled, children, label }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-9 h-9 rounded-lg bg-surface-tonal-a10 hover:bg-surface-tonal-a20 disabled:bg-transparent disabled:text-surface-a30 disabled:cursor-not-allowed text-primary-a40 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <NavBtn onClick={() => onPageChange(1)} disabled={isFirst} label="First page">
        <ChevronsLeft className="w-4 h-4" />
      </NavBtn>
      <NavBtn
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </NavBtn>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span
            key={`gap-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-surface-a40 font-label text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg font-label text-sm font-semibold transition-colors ${
              p === currentPage
                ? 'bg-primary-a0 text-white'
                : 'bg-surface-tonal-a10 hover:bg-surface-tonal-a20 text-primary-a40'
            }`}
          >
            {p}
          </button>
        )
      )}

      <NavBtn
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </NavBtn>
      <NavBtn onClick={() => onPageChange(totalPages)} disabled={isLast} label="Last page">
        <ChevronsRight className="w-4 h-4" />
      </NavBtn>
    </div>
  );
};

export default Pagination;
