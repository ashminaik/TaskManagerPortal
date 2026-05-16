import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { tasksAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Spinner from '../components/Spinner';

export default function PendingTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    const params = {};
    if (filter) params.priority = filter;
    const { data } = await tasksAPI.getAll(params);
    const pending = data.tasks.filter((t) => t.status === 'To Do' || t.status === 'In Progress');
    setTasks(pending);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    await tasksAPI.updateStatus(taskId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
    fetchTasks();
  };

  const TWO_HOURS = 2 * 60 * 60 * 1000;

  const isUrgent = (task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate).getTime();
    const now = Date.now();
    return (due - now) < TWO_HOURS && (due - now) > 0;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Pending Tasks</h1>

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
          <p className="text-text-secondary text-lg">No pending tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="relative">
              <div
                className={
                  isUrgent(task)
                    ? 'rounded-2xl animate-pulse'
                    : 'rounded-2xl'
                }
                style={
                  isUrgent(task)
                    ? { boxShadow: '0 0 16px rgba(212, 106, 106, 0.6), 0 0 32px rgba(212, 106, 106, 0.3)' }
                    : {}
                }
              >
                <div
                  className={
                    isUrgent(task)
                      ? 'rounded-2xl border-2 border-danger'
                      : 'rounded-2xl'
                  }
                >
                  <TaskCard
                    task={task}
                    statusOptions={['To Do', 'In Progress', 'Done']}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
              {isUrgent(task) && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold animate-pulse">
                  URGENT
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
