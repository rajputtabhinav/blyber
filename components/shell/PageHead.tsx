interface PageHeadProps {
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHead({ title, meta, actions, className }: PageHeadProps) {
  return (
    <div className={"page-head " + (className ?? "")}>
      <div style={{ minWidth: 0 }}>
        <h1 className="page-title">{title}</h1>
        {meta && <div className="page-head-meta">{meta}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
