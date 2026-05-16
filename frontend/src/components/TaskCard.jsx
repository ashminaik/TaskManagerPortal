import { Paperclip, User, Calendar } from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor, getProjectColor } from '../utils/helpers';

export default function TaskCard({ task, onClick, statusOptions, onStatusChange }) {
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  let deadline = null;
  if (task.dueDate) {
    const [h = 23, m = 59] = (task.dueTime || '23:59').split(':').map(Number);
    const d = new Date(task.dueDate);
    d.setHours(h, m, 0, 0);
    deadline = d.getTime();
  }

  const urgent =
    deadline &&
    task.status !== 'Done' &&
    task.status !== 'Overdue' &&
    deadline - Date.now() < TWO_HOURS &&
    deadline - Date.now() > 0;

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`relative bg-white rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer ${
        urgent
          ? 'border-2 border-danger'
          : 'border border-border-color'
      }`}
      style={urgent ? { boxShadow: '0 0 14px rgba(212, 106, 106, 0.5), 0 0 28px rgba(212, 106, 106, 0.2)' } : {}}
    >
      {urgent && (
        <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold animate-pulse z-10">
          URGENT
        </span>
      )}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-text-primary font-semibold text-base leading-snug flex-1">
          {task.title}
        </h4>
        {task.files?.length > 0 && (
          <Paperclip size={14} className="text-text-secondary ml-2 mt-1" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProjectColor(task.projectType)}`}>{task.projectType}</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-text-secondary">{task.team}</span>
      </div>

      {task.assignedTo ? (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-olive/20 flex items-center justify-center">
            <User size={12} className="text-olive" />
          </div>
          <span className="text-xs text-text-secondary">{task.assignedTo.email?.split('@')[0]}</span>
        </div>
      ) : (
        <p className="text-xs text-text-secondary mb-3">Unassigned</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Calendar size={12} />
          {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
          {onStatusChange ? (
            <select value={task.status} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); onStatusChange(task._id, e.target.value); }} className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(task.status)}`}>
              {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          ) : (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
          )}
        </div>
      </div>
    </div>
  );
}
