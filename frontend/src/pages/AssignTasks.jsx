import { useState, useEffect, useCallback } from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import { tasksAPI, usersAPI } from '../api/axios';
import toast from 'react-hot-toast';

const PROJECTS = ['TECHNICAL', 'STEM', 'NON_STEM'];
const PROJECT_TEAMS = {
  TECHNICAL: ['Fenrir', 'Kensei', 'Jaeger'],
  STEM: ['Valor', 'Vindex'],
  NON_STEM: ['Evals'],
};
const PROJECT_COLORS = { TECHNICAL: '#E9C75B', STEM: '#E8C7D3', 'NON_STEM': '#B7C9EA' };
const TEAM_COLORS = {
  Fenrir: '#E9C75B', Kensei: '#D4B94A', Jaeger: '#C4A839',
  Valor: '#E8C7D3', Vindex: '#D4A8B8',
  Evals: '#B7C9EA',
};

export default function AssignTasks() {
  const [project, setProject] = useState('');
  const [team, setTeam] = useState('');
  const [taskQuery, setTaskQuery] = useState('');
  const [taskResults, setTaskResults] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [memberMode, setMemberMode] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [allMembers, setAllMembers] = useState([]);

  const [cancelMode, setCancelMode] = useState(false);

  const fetchAllTasks = useCallback(async () => {
    const { data } = await tasksAPI.getAll({});
    setAllTasks(data.tasks);
    setRecentTasks(data.tasks.slice(0, 5));
  }, []);

  const fetchMembers = useCallback(async () => {
    const { data } = await usersAPI.getAll();
    setAllMembers(data.users);
  }, []);

  useEffect(() => {
    fetchAllTasks();
    fetchMembers();
  }, [fetchAllTasks, fetchMembers]);

  useEffect(() => {
    if (!taskQuery.trim()) { setTaskResults([]); return; }
    const filtered = allTasks.filter((t) => {
      const matches = t.title.toLowerCase().includes(taskQuery.toLowerCase());
      const matchesProject = project ? t.projectType === project : true;
      const matchesTeam = team ? t.team === team : true;
      return matches && matchesProject && matchesTeam;
    });
    setTaskResults(filtered.slice(0, 10));
  }, [taskQuery, project, team, allTasks]);

  useEffect(() => {
    if (!memberQuery.trim()) { setMemberResults([]); return; }
    const filtered = allMembers.filter((m) => {
      const matches = (m.email + (m.name || '')).toLowerCase().includes(memberQuery.toLowerCase());
      const matchesTeam = team ? m.team === team : true;
      const matchesProject = project ? m.project === project : true;
      return matches && matchesTeam && matchesProject;
    });
    setMemberResults(filtered.slice(0, 8));
  }, [memberQuery, team, project, allMembers]);

  const availableTeams = project
    ? PROJECT_TEAMS[project] || []
    : Object.values(PROJECT_TEAMS).flat();

  const handleAssign = async (memberId) => {
    if (!selectedTask) return toast.error('Please select a task');
    await tasksAPI.assign(selectedTask._id, memberId);
    toast.success('Task assigned');
    setSelectedTask(null);
    setMemberMode(false);
    setMemberQuery('');
    fetchAllTasks();
  };

  const handleAssignTeam = async () => {
    if (!selectedTask || !team) return toast.error('Select a task and team');
    const teamMembers = allMembers.filter((m) => m.team === team);
    if (teamMembers.length === 0) return toast.error('No members in this team');
    for (const m of teamMembers) {
      await tasksAPI.assign(selectedTask._id, m._id);
    }
    toast.success(`Assigned to ${teamMembers.length} members in ${team}`);
    setSelectedTask(null);
    fetchAllTasks();
  };

  const handleCancel = async (taskId) => {
    await tasksAPI.cancelAssignment(taskId);
    toast.success('Assignment cancelled');
    fetchAllTasks();
  };

  const handleDelete = async (taskId) => {
    await tasksAPI.delete(taskId);
    toast.success('Task deleted');
    fetchAllTasks();
  };

  const assignedTasks = allTasks.filter((t) => t.assignedTo);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assign Tasks</h1>
          <p className="text-text-secondary text-sm mt-1">Fill details to assign tasks to members</p>
        </div>
        <button
          onClick={() => setCancelMode(!cancelMode)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
            cancelMode ? 'bg-danger text-white' : 'border border-border-color text-text-secondary hover:bg-hover-highlight'
          }`}
        >
          <Trash2 size={14} />
          {cancelMode ? 'Done' : 'Cancel Assignments'}
        </button>
      </div>

      {cancelMode && (
        <div
          className="p-6 space-y-2"
          style={{ backgroundColor: '#F5F0E8', border: '2px solid #A8C4E0', borderRadius: '16px' }}
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">Cancel or Delete Assignments</h3>
          {assignedTasks.length === 0 ? (
            <p className="text-text-secondary text-sm">No assigned tasks to cancel.</p>
          ) : (
            assignedTasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-hover-highlight/50">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.title}</p>
                  <p className="text-xs text-text-secondary">
                    {t.projectType} — {t.team} | {t.assignedTo?.email || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCancel(t._id)} className="text-xs px-2 py-1 rounded-full border border-soft-red text-soft-red hover:bg-soft-red/10">
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-6 space-y-5"
          style={{ backgroundColor: '#F5F0E8', border: '2px solid #A8C4E0', borderRadius: '16px' }}
        >
          <h3 className="text-lg font-semibold text-text-primary">Task Details</h3>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Project</p>
            <div className="flex gap-2">
              {PROJECTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setProject(p === project ? '' : p); setTeam(''); setSelectedTask(null); }}
                  style={
                    project === p
                      ? { backgroundColor: PROJECT_COLORS[p], color: '#1F2A44' }
                      : {}
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    project === p
                      ? 'border-transparent'
                      : 'border-border-color text-text-secondary hover:bg-hover-highlight'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Team</p>
            <div className="flex gap-2 flex-wrap">
              {availableTeams.map((t) => (
                <button
                  key={t}
                  onClick={() => setTeam(t === team ? '' : t)}
                  style={
                    team === t
                      ? { backgroundColor: TEAM_COLORS[t] || '#9BA86F', color: '#1F2A44' }
                      : {}
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    team === t
                      ? 'border-transparent'
                      : 'border-border-color text-text-secondary hover:bg-hover-highlight'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Select Task</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2.5 border border-border-color rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive/30"
              />
            </div>
            {taskResults.length > 0 && (
              <div className="mt-2 border border-border-color rounded-xl p-1 max-h-48 overflow-y-auto space-y-0.5">
                {taskResults.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => { setSelectedTask(t); setTaskQuery(''); setTaskResults([]); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedTask?._id === t._id ? 'bg-olive/10 text-olive font-medium' : 'hover:bg-hover-highlight text-text-primary'
                    }`}
                  >
                    <span className="font-medium">{t.title.split(' ').slice(0, 3).join(' ')}</span>
                    <span className="text-text-secondary ml-2 text-xs">— {t.projectType} · {t.team}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedTask && (
              <div className="mt-2 flex items-center justify-between px-4 py-3 bg-olive/10 border border-olive/30 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-olive">{selectedTask.title}</p>
                  <p className="text-xs text-text-secondary">{selectedTask.projectType} · {selectedTask.team} · {selectedTask.priority}</p>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-1 rounded-full hover:bg-olive/20">
                  <X size={16} className="text-olive" />
                </button>
              </div>
            )}
            {!taskQuery && !selectedTask && (
              <div className="mt-3">
                <p className="text-xs font-medium text-text-secondary mb-2">Recent Tasks</p>
                <div className="space-y-1.5">
                  {recentTasks.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        (project && t.projectType !== project) || (team && t.team !== team)
                          ? 'opacity-40 pointer-events-none'
                          : selectedTask?._id === t._id
                          ? 'bg-olive/10 text-olive font-medium'
                          : 'hover:bg-hover-highlight text-text-primary'
                      }`}
                    >
                      <span>{t.title.split(' ').slice(0, 3).join(' ')}</span>
                      <span className="text-text-secondary ml-2 text-xs">— {t.team}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="p-6 space-y-5"
          style={{ backgroundColor: '#F5F0E8', border: '2px solid #A8C4E0', borderRadius: '16px' }}
        >
          <h3 className="text-lg font-semibold text-text-primary">Assign To</h3>

          {!memberMode ? (
            <div className="space-y-3">
              <button
                onClick={() => setMemberMode('individual')}
                className="w-full py-3 rounded-xl border-2 border-dashed border-border-color text-text-secondary text-sm font-medium hover:border-olive hover:text-olive transition-colors"
              >
                + Assign to Individual Member
              </button>
              <button
                onClick={handleAssignTeam}
                className="w-full py-3 rounded-xl border-2 border-dashed border-border-color text-text-secondary text-sm font-medium hover:border-olive hover:text-olive transition-colors"
              >
                + Assign to Entire Team ({team || 'select team first'})
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Search member by name or email..."
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 border border-border-color rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive/30"
                  onKeyDown={(e) => { if (e.key === 'Escape') { setMemberMode(false); setMemberQuery(''); } }}
                />
                <button onClick={() => { setMemberMode(false); setMemberQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-hover-highlight text-text-secondary">
                  <X size={14} />
                </button>
              </div>
              {memberResults.length > 0 && (
                <div className="border border-border-color rounded-xl p-1 max-h-56 overflow-y-auto space-y-0.5">
                  {memberResults.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => handleAssign(m._id)}
                      className="w-full text-left px-3 py-3 rounded-lg hover:bg-hover-highlight flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{m.name || m.email.split('@')[0]}</p>
                        <p className="text-xs text-text-secondary">{m.email} · {m.project} · {m.team}</p>
                      </div>
                      <span className="text-xs text-olive font-medium">Assign →</span>
                    </button>
                  ))}
                </div>
              )}
              {!memberQuery && allMembers.filter(m => team ? m.team === team : true).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2">{team ? `${team} Team Members` : 'All Members'}</p>
                  <div className="space-y-1.5">
                    {allMembers.filter(m => team ? m.team === team : true).slice(0, 6).map((m) => (
                      <button
                        key={m._id}
                        onClick={() => handleAssign(m._id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-hover-highlight flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-text-primary">{m.name || m.email.split('@')[0]}</p>
                          <p className="text-xs text-text-secondary">{m.team}</p>
                        </div>
                        <span className="text-xs text-olive">Assign →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
