import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminTasks from './pages/AdminTasks';
import MemberTasks from './pages/MemberTasks';
import Members from './pages/Members';
import AssignTasks from './pages/AssignTasks';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-olive/30 border-t-olive rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/tasks'} replace />;
  }

  return <Layout>{children}</Layout>;
}

function TasksPage() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminTasks /> : <MemberTasks />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute allowedRole="admin">
            <Members />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assign"
        element={
          <ProtectedRoute allowedRole="admin">
            <AssignTasks />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
