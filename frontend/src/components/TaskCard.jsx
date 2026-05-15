import { Paperclip, User, Calendar } from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor, getProjectColor } from '../utils/helpers';

export default function TaskCard({ task, onClick, statusOptions, onStatusChange }) {
  return (
    <div
      onClick={() => onClick?.(task)}
      className="bg-white rounded-2xl border border-border-color p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-text-primary font-semibold text-base leading-snug flex-1">
          {task.title}
        </h4>
        {task.files?.length > 0 && (
          <Paperclip size={14} className="text-text-secondary ml-2 mt-1" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProjectColor(task.projectType)}`}
        >
          {task.projectType}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-text-secondary">
          {task.team}
        </span>
      </div>

      {task.assignedTo ? (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-olive/20 flex items-center justify-center">
            <User size={12} className="text-olive" />
          </div>
          <span className="text-xs text-text-secondary">
            {task.assignedTo.email?.split('@')[0]}
          </span>
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
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {onStatusChange ? (
            <select
              value={task.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); onStatusChange(task._id, e.target.value); }}
              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(task.status)}`}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
