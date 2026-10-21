import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "../lib/utils";
import { useApp } from "../context/AppState";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function PrimaryButton({ className, children, loading, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground disabled:opacity-50",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, loading, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-ink bg-card px-5 text-[15px] font-semibold text-ink disabled:opacity-50",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" /> : null}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...props }: ButtonProps & { label: string }) {
  return (
    <button aria-label={label} className={cn("press grid h-12 w-12 place-items-center rounded-full bg-card/90 text-ink", className)} {...props}>
      {children}
    </button>
  );
}

export function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

export const inputClass = "field";

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-primary">{error}</span> : null}
    </label>
  );
}

export function InputField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const fieldId = id || props.name || label;
  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-1.5 block text-[13px] font-medium text-foreground">{label}</span>
      <input id={fieldId} className={cn("field", error && "field-error", className)} aria-invalid={Boolean(error)} {...props} />
      {error ? <span className="mt-1 block text-xs text-primary">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <textarea
        className={cn("field min-h-28 py-3", error && "field-error")}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="mt-1 block text-xs text-primary">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onScroll = (event: Event) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const rect = open ? buttonRef.current?.getBoundingClientRect() : null;
  const frame = open ? buttonRef.current?.closest(".device")?.getBoundingClientRect() : null;
  const boundsTop = frame?.top ?? 0;
  const boundsBottom = frame?.bottom ?? (typeof window === "undefined" ? 0 : window.innerHeight);
  const spaceBelow = rect ? boundsBottom - rect.bottom : 0;
  const spaceAbove = rect ? rect.top - boundsTop : 0;
  const openUp = Boolean(rect && spaceBelow < 180 && spaceAbove > spaceBelow);
  const maxHeight = rect ? Math.max(96, Math.min(220, (openUp ? spaceAbove : spaceBelow) - 20)) : 220;

  return (
    <div className="relative" ref={rootRef}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn("field flex items-center justify-between gap-2 text-left", error && "field-error", open && "border-primary")}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label || "Select"}</span>
        <ChevronDown size={18} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && rect ? (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          className="overflow-auto rounded-xl border border-line bg-card py-1 shadow-lg"
          style={{
            position: "fixed",
            left: rect.left,
            width: rect.width,
            maxHeight,
            zIndex: 80,
            top: openUp ? undefined : rect.bottom + 6,
            bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
          }}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm",
                  active ? "bg-primary/10 font-semibold text-primary" : "text-foreground",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {active ? <Check size={16} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {error ? <span className="mt-1 block text-xs text-primary">{error}</span> : null}
    </div>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-[18px] font-semibold">{title}</h2>
      {action ? (
        <button className="text-sm font-semibold text-primary" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Approved" || status === "Paid" || status === "completed" || status === "Confirmed"
      ? "bg-success/15 text-success"
      : status === "Sent" || status === "Due" || status === "assigned"
        ? "bg-warning/15 text-warning"
        : status === "cancelled" || status === "Cancelled"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground";
  const label = status === "completed" ? "Completed" : status === "cancelled" ? "Cancelled" : status === "assigned" ? "Assigned" : status === "confirmed" ? "Confirmed" : status;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", tone)}>{label}</span>;
}

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex gap-1.5">
        {steps.map((step, index) => (
          <span key={step} className={cn("h-1.5 flex-1 rounded-full", index <= current ? "bg-primary" : "bg-line")} />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Step {current + 1} of {steps.length} · {steps[current]}
      </p>
    </div>
  );
}

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="under-status flex items-center gap-2 px-3 pb-2">
      {onBack ? (
        <IconButton label="Back" onClick={onBack} className="bg-transparent">
          <ChevronLeft />
        </IconButton>
      ) : (
        <span className="w-12" />
      )}
      <h1 className="font-display flex-1 truncate text-center text-[17px] font-semibold">{title}</h1>
      <div className="grid w-12 place-items-center">{right}</div>
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press h-10 shrink-0 rounded-full px-3.5 text-sm font-medium",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-1 rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          className={cn("h-10 rounded-lg text-xs font-semibold", value === option.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ServiceCard({
  image,
  title,
  description,
  price,
  onClick,
}: {
  image: string;
  title: string;
  description?: string;
  price: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="lift card flex w-full items-center gap-3 p-2.5 text-left">
      <img src={image} alt="" className="h-20 w-20 rounded-xl object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] font-semibold">{title}</span>
        {description ? <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{description}</span> : null}
        <span className="mt-1 block text-sm font-semibold text-primary">{price}</span>
      </span>
      <ChevronRight className="text-muted-foreground" size={18} />
    </button>
  );
}

export function ProjectCard({
  image,
  title,
  location,
  cost,
  onClick,
  compact,
}: {
  image: string;
  title: string;
  location: string;
  cost: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button onClick={onClick} className={cn("lift card overflow-hidden text-left", compact ? "w-[230px] shrink-0" : "w-full")}>
      <img src={image} alt="" className={cn("w-full object-cover", compact ? "h-32" : "h-36")} />
      <span className="block p-3">
        <span className="block truncate font-display text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{location}</span>
        <span className="mt-1 block text-sm font-semibold text-primary">{cost}</span>
      </span>
    </button>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[20px] font-bold text-primary">{value}</div>
      <div className="mt-1 text-[11px] leading-tight text-white/80">{label}</div>
    </div>
  );
}

export function EstimateSummaryCard({
  name,
  type,
  date,
  total,
  status,
  onClick,
}: {
  name: string;
  type: string;
  date: string;
  total: string;
  status: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="lift card w-full p-4 text-left">
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block font-display text-[15px] font-semibold">{name}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {type} · {date}
          </span>
        </span>
        <StatusBadge status={status} />
      </span>
      <span className="mt-3 block font-display text-xl font-bold text-primary">{total}</span>
    </button>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5 text-warning" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={14} fill={index < Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="handle" />
        <h2 className="font-display mb-3 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop items-center px-6" onClick={onClose}>
      <div className="card w-full p-5" role="dialog" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action, onAction, icon }: { title: string; body: string; action?: string; onAction?: () => void; icon?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 text-primary">{icon || <ClipboardArt />}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action ? (
        <div className="mt-4 w-full">
          <PrimaryButton onClick={onAction}>{action}</PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}

export function ClipboardArt() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect x="16" y="12" width="40" height="50" rx="8" stroke="currentColor" strokeWidth="2.5" />
      <rect x="28" y="8" width="16" height="8" rx="3" fill="currentColor" />
      <path d="M26 32h20M26 42h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function SuccessMark() {
  return (
    <div className="check-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-success text-white">
      <Check size={40} strokeWidth={3} />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="card flex gap-3 p-3">
          <div className="skel h-16 w-16" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skel h-3 w-2/3" />
            <div className="skel h-3 w-1/2" />
            <div className="skel h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function useWarmLoad(ms = 480) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return loading;
}

export function useCountUp(value: number) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return display;
}

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map((toast) => (
        <button key={toast.id} className="toast text-left" onClick={() => dismissToast(toast.id)}>
          <span className="block text-sm font-semibold">{toast.title}</span>
          {toast.body ? <span className="mt-0.5 block text-xs text-white/70">{toast.body}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="absolute inset-x-4 bottom-24 z-30 rounded-2xl bg-ink p-4 text-white">
      <p className="font-display text-sm font-semibold">No internet connection</p>
      <p className="mt-1 text-xs text-white/70">Saved estimates on this phone are still available. Reconnect to book or share.</p>
      {onRetry ? (
        <button className="mt-3 text-sm font-semibold text-primary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <span className={cn("relative h-7 w-12 rounded-full transition-colors", checked ? "bg-primary" : "bg-line")}>
        <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
