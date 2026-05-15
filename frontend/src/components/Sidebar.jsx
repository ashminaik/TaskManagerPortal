import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, LogOut, User, Mail, Briefcase, Users, Pencil, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/axios';
import toast from 'react-hot-toast';

const PROJECT_TEAMS = {
  STEM: ['Valor', 'Vindex'],
  NON_STEM: ['Evals'],
  TECHNICAL: ['Fenrir', 'Kensei', 'Jaeger'],
};

export default function Sidebar({ onToggle }) {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', project: '', team: '' });

  const navItems = [
    ...(user?.role === 'admin'
      ? [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/members', icon: Users, label: 'Members' },
          { to: '/assign', icon: UserCheck, label: 'Assign Tasks' },
        ]
      : []),
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  ];

  const startEdit = () => {
    setProfileForm({
      name: user?.name || user?.email?.split('@')[0] || '',
      project: user?.project || '',
      team: user?.team || '',
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    const { data } = await authAPI.updateProfile(profileForm);
    updateUser(data.user);
    setEditing(false);
    toast.success('Profile updated');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col z-40">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white font-bold text-lg leading-tight">
          Ethara Mock Task Manager
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {user?.role === 'admin' ? 'Admin Panel' : 'Member Panel'}
        </p>
      </div>

      <nav className="px-4 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onToggle}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-olive text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {editing && user?.role === 'admin' ? (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Edit Profile
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-white/50 text-xs ml-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 mt-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-olive"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs ml-1">Project</label>
              <select
                value={profileForm.project}
                onChange={(e) => setProfileForm({ ...profileForm, project: e.target.value })}
                className="w-full px-3 py-2 mt-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-olive"
              >
                <option value="STEM">STEM</option>
                <option value="NON_STEM">NON STEM</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs ml-1">Team</label>
              <select
                value={profileForm.team}
                onChange={(e) => setProfileForm({ ...profileForm, team: e.target.value })}
                className="w-full px-3 py-2 mt-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-olive"
              >
                {(PROJECT_TEAMS[profileForm.project] || []).map((t) => (
                  <option key={t} value={t} className="text-text-primary">{t}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-full text-xs text-white/60 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 py-2 rounded-full bg-olive text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider px-1">
              Profile
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={startEdit}
                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white/80"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 px-1">
              <User size={14} className="text-white/50" />
              <span className="text-white/80 text-sm">{user?.name || user?.email?.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Mail size={14} className="text-white/50" />
              <span className="text-white/80 text-sm truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Briefcase size={14} className="text-white/50" />
              <span className="text-white/80 text-sm">{user?.project || '—'}</span>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Users size={14} className="text-white/50" />
              <span className="text-white/80 text-sm">{user?.team || '—'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-full text-white/60 hover:bg-white/10 transition-colors text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
