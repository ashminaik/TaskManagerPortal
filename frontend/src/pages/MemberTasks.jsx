import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { tasksAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import TaskDetailOverlay from '../components/TaskDetailOverlay';
import { getPriorityColor, getStatusColor, getProjectColor, formatDate } from '../utils/helpers';

export default function MemberTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    const params = filter ? { priority: filter } : {};
    const { data } = await tasksAPI.getAll(params);
    setTasks(data.tasks);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
    await tasksAPI.updateStatus(taskId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {user && (
        <div className="bg-white rounded-2xl border border-border-color p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-olive/20 flex items-center justify-center text-olive font-bold">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{user?.name || user?.email}</p>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getProjectColor(user.project)}`}>
                {user.project}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                {user.team}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {['', 'High', 'Medium', 'Low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === p
                ? p === 'High' ? 'bg-danger text-white' : p === 'Medium' ? 'bg-warning text-text-primary' : p === 'Low' ? 'bg-success text-white' : 'bg-sidebar text-white'
                : 'bg-white border border-border-color text-text-secondary hover:bg-hover-highlight'
            }`}
          >
            {p || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => { setSelectedTask(task); setDetailOpen(true); }}
              statusOptions={['To Do', 'In Progress', 'Done']}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskDetailOverlay
        task={selectedTask}
        onClose={() => { setDetailOpen(false); setSelectedTask(null); }}
        statusOptions={['To Do', 'In Progress', 'Done']}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
