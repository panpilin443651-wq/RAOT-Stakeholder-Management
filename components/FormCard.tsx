export function FormCard({
  title,
  code,
  children,
  actions,
}: {
  title: string;
  code?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded border border-[var(--line)] bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-raot-50 px-5 py-3">
        <h1 className="font-medium text-raot-800">
          {title}
          {code && <span className="ml-1.5 text-[var(--ink-muted)]">[{code}]</span>}
        </h1>
        {actions && <div className="ml-auto flex items-center gap-2 no-print">{actions}</div>}
      </header>
      <div className="px-5 py-6">{children}</div>
    </section>
  );
}

/** หัวข้อย่อยภายในฟอร์ม */
export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--line)] pt-6 first:border-0 first:pt-0">
      {title && <h2 className="mb-4 font-medium text-raot-700">{title}</h2>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default FormCard;
