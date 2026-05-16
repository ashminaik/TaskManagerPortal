import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminTasks from './pages/AdminTasks';
import MemberTasks from './pages/MemberTasks';
import Members from './pages/Members';
import AssignTasks from './pages/AssignTasks';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

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
