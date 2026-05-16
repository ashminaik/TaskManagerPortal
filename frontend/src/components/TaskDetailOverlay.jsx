import { X, Download, Calendar, Clock, User, Briefcase, Users, Flag, FileText, Pencil } from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor, getProjectColor } from '../utils/helpers';

export default function TaskDetailOverlay({ task, onClose, statusOptions, onStatusChange, onEdit }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#F5F0E8', border: '2px solid #A8C4E0', borderRadius: '16px' }}
      >
        <div className="sticky top-0 px-8 pt-6 pb-3 flex items-start justify-between z-10" style={{ backgroundColor: '#F5F0E8' }}>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{task.title}</h2>
            <p className="text-sm text-text-secondary mt-1">{task.projectType} · {task.team}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X size={22} className="text-text-secondary" />
          </button>
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-olive text-white text-sm font-medium hover:opacity-90">
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><Flag size={12} /> Priority</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><FileText size={12} /> Status</div>
              {onStatusChange ? (
                <select value={task.status} onChange={(e) => onStatusChange(task._id, e.target.value)} className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(task.status)}`}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
              )}
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><Briefcase size={12} /> Project</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getProjectColor(task.projectType)}`}>{task.projectType}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><Users size={12} /> Team</div>
              <span className="text-sm font-medium text-text-primary">{task.team}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><Calendar size={12} /> Due Date</div>
              <span className="text-sm font-medium text-text-primary">{task.dueDate ? formatDate(task.dueDate) : '—'}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><Clock size={12} /> Due Time</div>
              <span className="text-sm font-medium text-text-primary">{task.dueTime || '—'}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><User size={12} /> Assigned To</div>
              <span className="text-sm font-medium text-text-primary">{task.assignedTo?.email || 'Unassigned'}</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1"><FileText size={12} /> Assignment</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.assignmentStatus === 'Active' ? 'bg-success/20 text-success' : 'bg-soft-red/20 text-danger'}`}>{task.assignmentStatus}</span>
            </div>
          </div>

          {task.description && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Description</h4>
              <div className="bg-white/60 rounded-xl p-4 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {task.files?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Attachments ({task.files.length})</h4>
              <div className="space-y-2">
                {task.files.map((f, i) => (
                  <a key={i} href={`/api/files/${f.filename}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-xl hover:bg-olive/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-olive/10 flex items-center justify-center">
                        <Download size={14} className="text-olive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{f.originalName}</p>
                        <p className="text-xs text-text-secondary">{f.mimetype}</p>
                      </div>
                    </div>
                    <span className="text-xs text-olive font-medium opacity-0 group-hover:opacity-100 transition-opacity">Download →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {task.createdBy && (
            <p className="text-xs text-text-secondary text-right pt-4 border-t border-border-color/50">
              Created by {task.createdBy.email} · {formatDate(task.createdAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
