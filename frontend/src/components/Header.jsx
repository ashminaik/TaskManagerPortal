import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getGreeting, getRoleBadge } from '../utils/helpers';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center gap-4 px-8 py-4 bg-transparent">
      <h2 className="text-text-primary text-xl font-semibold whitespace-nowrap">
        {getGreeting()}, {user?.name || user?.email?.split('@')[0] || 'User'}
      </h2>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-olive flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-text-primary">
            {user?.name || user?.email?.split('@')[0]}
          </p>
          <span className={getRoleBadge(user?.role)}>
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
