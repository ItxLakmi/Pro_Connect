/**
 * Format date to relative time (e.g., "2 hours ago", "just now")
 */
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  // Just now (0-30 seconds)
  if (diffInSeconds < 30) {
    return 'just now';
  }

  // Minutes (30 seconds - 59 minutes)
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Hours (1-23 hours)
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Days (1-6 days)
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Week or more - show date
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Format date to full format with time (e.g., "Jun 4, 2026 at 2:30 PM")
 */
export const getFullDateTime = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
