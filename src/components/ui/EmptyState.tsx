interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {icon && (
        <div className="mb-5 w-14 h-14 rounded-2xl bg-panel border border-border flex items-center justify-center text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#e6edf3] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted mb-7 max-w-xs leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
