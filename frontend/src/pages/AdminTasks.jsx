import { useState, useEffect, useCallback } from 'react';
import { Plus, UserPlus, ArrowUpDown, Download, Pencil } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { tasksAPI, usersAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { formatDate, getPriorityColor, getStatusColor, getProjectColor } from '../utils/helpers';

const PROJECT_TEAMS = {
  STEM: ['Valor', 'Vindex'],
  NON_STEM: ['Evals'],
  TECHNICAL: ['Fenrir', 'Kensei', 'Jaeger'],
};

export default function AdminTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ priority: '', team: '', project: '', status: '', search: '' });

  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ dueDate: '', dueTime: '', projectType: '', team: '' });

  const [createForm, setCreateForm] = useState({
    title: '', description: '', projectType: 'TECHNICAL', team: 'Fenrir',
    dueDate: '', dueTime: '23:59', priority: 'Medium', files: [],
  });
  const [assignForm, setAssignForm] = useState({ taskId: '', userId: '' });
  const [memberForm, setMemberForm] = useState({ email: '', password: '', project: 'TECHNICAL', team: 'Fenrir' });

  const fetchTasks = useCallback(async () => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const { data } = await tasksAPI.getAll(params);
    setTasks(data.tasks);
  }, [filters]);

  const fetchMembers = useCallback(async () => {
    const { data } = await usersAPI.getAll();
    setMembers(data.users);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTasks(), fetchMembers()]).finally(() => setLoading(false));
  }, [fetchTasks, fetchMembers]);

  const onDrop = useCallback((accepted) => {
    setCreateForm((f) => ({ ...f, files: [...f.files, ...accepted] }));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/zip': ['.zip'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', createForm.title);
    fd.append('description', createForm.description);
    fd.append('projectType', createForm.projectType);
    fd.append('team', createForm.team);
    fd.append('dueDate', createForm.dueDate);
    fd.append('dueTime', createForm.dueTime);
    fd.append('priority', createForm.priority);
    createForm.files.forEach((f) => fd.append('files', f));
    await tasksAPI.create(fd);
    toast.success('Task created');
    setCreateOpen(false);
    setCreateForm({ title: '', description: '', projectType: 'TECHNICAL', team: 'Fenrir', dueDate: '', dueTime: '23:59', priority: 'Medium', files: [] });
    fetchTasks();
  };

  const handleAssign = async () => {
    if (!assignForm.taskId || !assignForm.userId) return;
    await tasksAPI.assign(assignForm.taskId, assignForm.userId);
    toast.success('Task assigned');
    setAssignOpen(false);
    fetchTasks();
  };

  const handleCancelAssignment = async (taskId) => {
    await tasksAPI.cancelAssignment(taskId);
    toast.success('Assignment cancelled');
    fetchTasks();
  };

  const handleSaveEdit = async () => {
    const date = editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined;
    const { data } = await tasksAPI.update(selectedTask._id, {
      dueDate: date,
      dueTime: editForm.dueTime,
      projectType: editForm.projectType,
      team: editForm.team,
    });
    setSelectedTask(data.task);
    setEditing(false);
    toast.success('Task updated');
    fetchTasks();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!/^[\w.+-]+@ethara\.ai$/i.test(memberForm.email)) {
      toast.error('Only @ethara.ai email addresses are allowed');
      return;
    }
    try {
      await usersAPI.create(memberForm);
      toast.success('Member added');
      setAddMemberOpen(false);
      setMemberForm({ email: '', password: '', project: 'TECHNICAL', team: 'Fenrir' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const assignTargetTask = tasks.find((t) => t._id === assignForm.taskId);
  const memberForTeam = assignTargetTask
    ? members.filter((m) => m.project === assignTargetTask.projectType)
    : members;

  const hasFilters = filters.priority || filters.team || filters.project || filters.status || filters.search;

  const projectColumns = { TECHNICAL: [], STEM: [], 'NON_STEM': [] };
  tasks.forEach((t) => {
    if (projectColumns[t.projectType]) projectColumns[t.projectType].push(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setAddMemberOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-color text-text-primary text-sm font-medium hover:bg-hover-highlight transition-colors"
          >
            <UserPlus size={16} /> Add Member
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-sidebar text-white text-sm font-medium hover:opacity-90"
          >
            <Plus size={16} /> Create Task
          </button>
          <button
            onClick={() => { setAssignForm({ taskId: '', userId: '' }); setAssignOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-color text-text-primary text-sm font-medium hover:bg-hover-highlight"
          >
            <ArrowUpDown size={16} /> Assign Task
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-4 py-2 rounded-full border border-border-color text-sm bg-white text-text-primary"
        >
          <option value="">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value, team: '' })}
          className="px-4 py-2 rounded-full border border-border-color text-sm bg-white text-text-primary"
        >
          <option value="">Project</option>
          <option value="STEM">STEM</option>
          <option value="NON_STEM">NON STEM</option>
          <option value="TECHNICAL">TECHNICAL</option>
        </select>
        <select
          value={filters.team}
          onChange={(e) => setFilters({ ...filters, team: e.target.value })}
          className="px-4 py-2 rounded-full border border-border-color text-sm bg-white text-text-primary"
        >
          <option value="">Team</option>
          {Object.values(PROJECT_TEAMS).flat().map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 rounded-full border border-border-color text-sm bg-white text-text-primary"
        >
          <option value="">Status</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Overdue">Overdue</option>
        </select>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search Tasks, Teams, Members..."
          className="px-4 py-2 rounded-full border border-border-color text-sm bg-white text-text-primary w-56"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border-color p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">No tasks yet. Create your first task.</p>
        </div>
      ) : hasFilters ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="relative">
              <TaskCard task={task} onClick={() => { setSelectedTask(task); setEditing(false); setEditForm({ dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', dueTime: task.dueTime || '', projectType: task.projectType, team: task.team }); setDetailOpen(true); }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(projectColumns).map(([project, columnTasks]) => (
            <div key={project} className="space-y-3">
              <h3 className={`text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full inline-block ${
                project === 'TECHNICAL' ? 'bg-soft-yellow/30 text-text-primary' :
                project === 'STEM' ? 'bg-soft-pink/40 text-text-primary' :
                'bg-soft-blue/40 text-text-primary'
              }`}>
                {project}
              </h3>
              {columnTasks.length === 0 ? (
                <p className="text-text-secondary text-sm italic pl-1">No tasks</p>
              ) : (
                columnTasks.map((task) => (
                  <div key={task._id}>
                    <TaskCard task={task} onClick={() => { setSelectedTask(task); setEditing(false); setEditForm({ dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', dueTime: task.dueTime || '', projectType: task.projectType, team: task.team }); setDetailOpen(true); }} />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Task Title *</label>
            <input
              type="text" required value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Project Type</label>
              <select
                value={createForm.projectType}
                onChange={(e) => setCreateForm({ ...createForm, projectType: e.target.value, team: PROJECT_TEAMS[e.target.value][0] })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                <option value="STEM">STEM</option>
                <option value="NON_STEM">NON STEM</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Team</label>
              <select
                value={createForm.team}
                onChange={(e) => setCreateForm({ ...createForm, team: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                {PROJECT_TEAMS[createForm.projectType]?.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Due Date *</label>
              <input
                type="date" required value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Due Time</label>
              <input
                type="time" value={createForm.dueTime}
                onChange={(e) => setCreateForm({ ...createForm, dueTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-olive bg-olive/5' : 'border-border-color'}`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-text-secondary">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-text-secondary/60 mt-1">
              PDF, DOC, DOCX, Images, ZIP — max 10MB each
            </p>
          </div>
          {createForm.files.length > 0 && (
            <div className="space-y-1">
              {createForm.files.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-3 bg-hover-highlight rounded-lg text-sm">
                  <span className="text-text-primary">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, files: createForm.files.filter((_, j) => j !== i) })}
                    className="text-danger text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-full border border-border-color text-text-secondary text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-full bg-btn-primary text-white text-sm font-medium hover:opacity-90">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Task" size="max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Select Task</label>
              <select
                value={assignForm.taskId}
                onChange={(e) => setAssignForm({ ...assignForm, taskId: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                <option value="">Choose a task...</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.projectType} — {t.team})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Select Member</label>
              <select
                value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                <option value="">Choose a member...</option>
                {memberForTeam.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.email} ({m.project} — {m.team})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {tasks.map((t) => (
            <div key={t._id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-hover-highlight/50">
              <div>
                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                <p className="text-xs text-text-secondary">
                  {t.projectType} — {t.team} | {t.assignedTo ? t.assignedTo.email : 'Unassigned'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.assignmentStatus === 'Active' ? 'bg-success/20 text-success' : 'bg-soft-red/20 text-danger'}`}>
                  {t.assignmentStatus}
                </span>
                {t.assignedTo && (
                  <button
                    onClick={() => handleCancelAssignment(t._id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setAssignOpen(false)} className="px-6 py-2.5 rounded-full border border-border-color text-text-secondary text-sm">
              Close
            </button>
            <button onClick={handleAssign} className="px-6 py-2.5 rounded-full bg-btn-primary text-white text-sm font-medium hover:opacity-90">
              Assign
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedTask(null); setEditing(false); }} title="Task Details">
        {selectedTask && (
          <div className="space-y-4">
            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Due Time</label>
                    <input
                      type="time"
                      value={editForm.dueTime}
                      onChange={(e) => setEditForm({ ...editForm, dueTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Project Type</label>
                    <select
                      value={editForm.projectType}
                      onChange={(e) => setEditForm({ ...editForm, projectType: e.target.value, team: PROJECT_TEAMS[e.target.value][0] })}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
                    >
                      <option value="STEM">STEM</option>
                      <option value="NON_STEM">NON STEM</option>
                      <option value="TECHNICAL">TECHNICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Team</label>
                    <select
                      value={editForm.team}
                      onChange={(e) => setEditForm({ ...editForm, team: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
                    >
                      {PROJECT_TEAMS[editForm.projectType]?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => setEditing(false)} className="px-6 py-2.5 rounded-full border border-border-color text-text-secondary text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} className="px-6 py-2.5 rounded-full bg-btn-primary text-white text-sm font-medium hover:opacity-90">
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Title</p>
                    <p className="text-text-primary font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
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
                    <p className="text-text-primary">
                      {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '—'}{selectedTask.dueTime ? ` at ${selectedTask.dueTime}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Assigned To</p>
                    <p className="text-text-primary">{selectedTask.assignedTo?.email || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Assignment</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTask.assignmentStatus === 'Active' ? 'bg-success/20 text-success' : 'bg-soft-red/20 text-danger'}`}>
                      {selectedTask.assignmentStatus}
                    </span>
                  </div>
                </div>
                {selectedTask.description && (
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Description</p>
                    <p className="text-text-primary text-sm">{selectedTask.description}</p>
                  </div>
                )}
                {selectedTask.files?.length > 0 && (
                  <div>
                    <p className="text-xs text-text-secondary mb-2">Attachments</p>
                    <div className="space-y-1">
                      {selectedTask.files.map((f, i) => (
                        <a
                          key={i}
                          href={`/api/files/${f.filename}`}
                          className="flex items-center gap-2 text-sm text-olive hover:underline py-1"
                        >
                          <Download size={14} /> {f.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-olive text-white text-sm font-medium hover:opacity-90"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email (@ethara.ai)</label>
            <input
              type="email" required value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              placeholder="name@ethara.ai"
              className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              type="password" required value={memberForm.password}
              onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Project Type</label>
              <select
                value={memberForm.project}
                onChange={(e) => setMemberForm({ ...memberForm, project: e.target.value, team: PROJECT_TEAMS[e.target.value][0] })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                <option value="STEM">STEM</option>
                <option value="NON_STEM">NON STEM</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Team</label>
              <select
                value={memberForm.team}
                onChange={(e) => setMemberForm({ ...memberForm, team: e.target.value })}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
              >
                {PROJECT_TEAMS[memberForm.project]?.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setAddMemberOpen(false)} className="px-6 py-2.5 rounded-full border border-border-color text-text-secondary text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-full bg-btn-primary text-white text-sm font-medium hover:opacity-90">
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
