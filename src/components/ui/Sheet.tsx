import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type SheetPlacement = 'bottom' | 'left';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  placement?: SheetPlacement;
  bodyClassName?: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

const PLACEMENT_CLASSES: Record<SheetPlacement, string> = {
  bottom:
    'inset-x-0 bottom-0 max-h-[calc(100dvh-1rem)] rounded-t-[var(--radius-sheet)] border-t',
  left:
    'inset-y-0 left-0 w-[min(30rem,calc(100vw-2rem))] rounded-r-[var(--radius-sheet)] border-r',
};

export function Sheet({
  open,
  onClose,
  label,
  placement = 'bottom',
  bodyClassName = 'p-4',
  children,
}: SheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.getElementById('root');
    const wasInert = background?.hasAttribute('inert') ?? false;
    const previousAriaHidden = background?.getAttribute('aria-hidden') ?? null;
    const previousOverflow = document.body.style.overflow;

    if (background) {
      background.setAttribute('inert', '');
      background.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]')
      );
      if (focusable.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (active === sheet || !sheet.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (background) {
        if (previousAriaHidden === null) background.removeAttribute('aria-hidden');
        else background.setAttribute('aria-hidden', previousAriaHidden);
        if (!wasInert) background.removeAttribute('inert');
      }
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Close ${label}`}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
      />
      <section
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute flex flex-col overflow-hidden border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-sheet)] ${PLACEMENT_CLASSES[placement]}`}
      >
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-2">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--color-text)]">
            {label}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className={`scrollbar-thin min-h-0 flex-1 overflow-auto overscroll-contain ${bodyClassName}`}>
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
