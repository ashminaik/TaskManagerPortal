export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'High':
      return 'bg-danger text-white';
    case 'Medium':
      return 'bg-warning text-text-primary';
    case 'Low':
      return 'bg-success text-white';
    default:
      return 'bg-gray-200 text-text-secondary';
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'Done':
      return 'bg-success text-white';
    case 'In Progress':
      return 'bg-soft-blue text-text-primary';
    case 'Overdue':
      return 'bg-danger text-white';
    case 'To Do':
      return 'bg-soft-yellow text-text-primary';
    default:
      return 'bg-gray-200 text-text-secondary';
  }
}

export function getProjectColor(project) {
  switch (project) {
    case 'STEM':
      return 'bg-soft-pink text-text-primary';
    case 'NON_STEM':
      return 'bg-soft-blue text-text-primary';
    case 'TECHNICAL':
      return 'bg-soft-yellow text-text-primary';
    default:
      return 'bg-gray-200 text-text-secondary';
  }
}

export function getRoleBadge(role) {
  return role === 'admin'
    ? 'bg-olive/20 text-olive px-2 py-0.5 rounded-full text-xs font-medium'
    : 'bg-soft-blue/30 text-text-primary px-2 py-0.5 rounded-full text-xs font-medium';
}
