import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { tasksAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
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
    await tasksAPI.updateStatus(taskId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
    fetchTasks();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border-color p-5 animate-pulse h-40" />
          ))}
        </div>
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

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedTask(null); }} title="Task Details">
        {selectedTask && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Title</p>
                <p className="text-text-primary font-medium">{selectedTask.title}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Status</p>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(selectedTask._id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${getStatusColor(selectedTask.status)}`}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Project</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getProjectColor(selectedTask.projectType)}`}>
                  {selectedTask.projectType}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Team</p>
                <p className="text-text-primary">{selectedTask.team}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Priority</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Due Date</p>
                <p className="text-text-primary">{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '—'}</p>
              </div>
            </div>
            {selectedTask.description && (
              <div>
                <p className="text-xs text-text-secondary mb-1">Description</p>
                <p className="text-text-primary text-sm">{selectedTask.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
