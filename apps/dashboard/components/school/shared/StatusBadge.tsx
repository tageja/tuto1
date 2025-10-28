interface StatusBadgeProps {
  status?: string | null;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  // Handle undefined/null status
  if (!status) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants.default}`}>
        N/A
      </span>
    );
  }

  // Auto-detect variant from status text
  const statusLower = status.toLowerCase();
  const autoVariant = 
    statusLower.includes('active') || statusLower.includes('present') || statusLower.includes('completed') || statusLower.includes('paid') ? 'success' :
    statusLower.includes('pending') || statusLower.includes('late') ? 'warning' :
    statusLower.includes('absent') || statusLower.includes('cancelled') || statusLower.includes('overdue') ? 'danger' :
    variant;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[autoVariant]}`}>
      {status}
    </span>
  );
}


