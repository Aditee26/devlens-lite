export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      {Icon && <Icon className="w-6 h-6 text-ink-300 dark:text-ink-600 mb-3" strokeWidth={1.5} />}
      <h3 className="text-sm font-medium text-ink-800 dark:text-ink-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
