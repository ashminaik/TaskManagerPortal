import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, UserPlus, Trash2 } from 'lucide-react';
import { usersAPI } from '../api/axios';
import { getProjectColor } from '../utils/helpers';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PROJECT_TEAMS = {
  STEM: ['Valor', 'Vindex'],
  NON_STEM: ['Evals'],
  TECHNICAL: ['Fenrir', 'Kensei', 'Jaeger'],
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const [nameFilter, setNameFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', project: 'TECHNICAL', team: 'Fenrir' });

  const [delProject, setDelProject] = useState('');
  const [delTeam, setDelTeam] = useState('');
  const [delSearch, setDelSearch] = useState('');

  const fetchMembers = () => {
    usersAPI.getAll().then(({ data }) => {
      setMembers(data.users);
      setLoading(false);
    });
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter((m) => {
    if (nameFilter && !m.name?.toLowerCase().includes(nameFilter.toLowerCase()) && !m.email?.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (projectFilter && m.project !== projectFilter) return false;
    if (teamFilter && m.team !== teamFilter) return false;
    return true;
  });

  const deleteFiltered = members.filter((m) => {
    if (delProject && m.project !== delProject) return false;
    if (delTeam && m.team !== delTeam) return false;
    if (delSearch && !m.name?.toLowerCase().includes(delSearch.toLowerCase()) && !m.email?.toLowerCase().includes(delSearch.toLowerCase())) return false;
    return true;
  });

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!/^[\w.+-]+@ethara\.ai$/i.test(addForm.email)) { toast.error('Only @ethara.ai emails allowed'); return; }
    try {
      await usersAPI.create(addForm);
      toast.success('Member added');
      setAddOpen(false);
      setAddForm({ email: '', password: '', project: 'TECHNICAL', team: 'Fenrir' });
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    await usersAPI.delete(id);
    toast.success('Member deleted');
    fetchMembers();
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const hasFilters = nameFilter || projectFilter || teamFilter;

  const projectColumns = { TECHNICAL: [], STEM: [], 'NON_STEM': [] };
  filtered.forEach((m) => { if (m.project && projectColumns[m.project]) projectColumns[m.project].push(m); });

  const renderMemberRow = (m) => (
    <div key={m._id} className="bg-white rounded-2xl border border-border-color overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-hover-highlight/50 transition-colors" onClick={() => toggleExpand(m._id)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-olive/20 flex items-center justify-center text-olive font-bold">{m.name?.[0]?.toUpperCase() || m.email[0].toUpperCase()}</div>
          <div><p className="text-sm font-semibold text-text-primary">{m.name || m.email}</p><p className="text-xs text-text-secondary">{m.email}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProjectColor(m.project)}`}>{m.project || '—'}</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-text-secondary">{m.team || '—'}</span>
          <span className="text-xs text-olive font-medium">{expanded[m._id] ? 'Show Less' : 'Show More'}</span>
          {expanded[m._id] ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </div>
      </div>
      {expanded[m._id] && (
        <div className="px-5 pb-5 border-t border-border-color/50 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-text-secondary mb-0.5">Project</p><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getProjectColor(m.project)}`}>{m.project || '—'}</span></div>
            <div><p className="text-xs text-text-secondary mb-0.5">Team</p><p className="text-sm text-text-primary">{m.team || '—'}</p></div>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-2">Tasks Assigned ({m.assignedTaskCount})</p>
            {m.assignedTaskCount > 0 ? (
              <div className="space-y-1">{m.assignedTaskTitles.map((title, i) => (<div key={i} className="flex items-center gap-2 py-1.5 px-3 bg-hover-highlight rounded-lg text-sm text-text-primary"><div className="w-1.5 h-1.5 rounded-full bg-olive" />{title}</div>))}</div>
            ) : <p className="text-sm text-text-secondary italic">No tasks assigned</p>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Members</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} placeholder="Search by name or email..." className="pl-9 pr-4 py-2.5 rounded-full border border-border-color text-sm bg-white text-text-primary w-56 focus:outline-none focus:ring-2 focus:ring-olive/30" />
        </div>
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setTeamFilter(''); }} className="pr-8 py-2.5 rounded-full border border-border-color text-sm bg-white text-text-primary" style={{ paddingLeft: '1rem', paddingRight: '2.25rem' }}>
          <option value="">All Projects</option>
          <option value="STEM">STEM</option>
          <option value="NON_STEM">NON STEM</option>
          <option value="TECHNICAL">TECHNICAL</option>
        </select>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="pr-8 py-2.5 rounded-full border border-border-color text-sm bg-white text-text-primary" style={{ paddingLeft: '1rem', paddingRight: '2.25rem' }}>
          <option value="">All Teams</option>
          {(projectFilter ? PROJECT_TEAMS[projectFilter] : Object.values(PROJECT_TEAMS).flat()).map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>

        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-olive text-olive text-sm font-medium hover:bg-olive hover:text-white transition-colors ml-auto">
          <UserPlus size={14} /> Add Member
        </button>
        <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-soft-red text-soft-red text-sm font-medium hover:bg-soft-red hover:text-white transition-colors">
          <Trash2 size={14} /> Delete Member
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-color p-5 animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-text-secondary text-lg">No members found.</p></div>
      ) : hasFilters ? (
        <div className="space-y-3">{filtered.map(renderMemberRow)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(projectColumns).map(([project, columnMembers]) => (
            <div key={project} className="space-y-3">
              <h3 className={`text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full inline-block ${project === 'TECHNICAL' ? 'bg-soft-yellow/30 text-text-primary' : project === 'STEM' ? 'bg-soft-pink/40 text-text-primary' : 'bg-soft-blue/40 text-text-primary'}`}>{project}</h3>
              {columnMembers.length === 0 ? <p className="text-text-secondary text-sm italic pl-1">No members</p> : <div className="space-y-3">{columnMembers.map(renderMemberRow)}</div>}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-text-secondary text-center">Showing {filtered.length} of {members.length} members</p>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email (@ethara.ai)</label>
            <input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="name@ethara.ai" className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input type="password" required value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min 6 characters" className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Project Type</label>
              <select value={addForm.project} onChange={(e) => setAddForm({ ...addForm, project: e.target.value, team: PROJECT_TEAMS[e.target.value][0] })} className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white">
                <option value="STEM">STEM</option><option value="NON_STEM">NON STEM</option><option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Team</label>
              <select value={addForm.team} onChange={(e) => setAddForm({ ...addForm, team: e.target.value })} className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white">
                {PROJECT_TEAMS[addForm.project]?.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-6 py-2.5 rounded-full border border-border-color text-text-secondary text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-full bg-btn-primary text-white text-sm font-medium hover:opacity-90">Add Member</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDelProject(''); setDelTeam(''); setDelSearch(''); }} title="Delete Member">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select value={delProject} onChange={(e) => { setDelProject(e.target.value); setDelTeam(''); }} className="px-4 py-2.5 rounded-full border border-border-color text-sm bg-white" style={{ paddingRight: '2.25rem' }}>
              <option value="">All Projects</option>
              <option value="STEM">STEM</option><option value="NON_STEM">NON STEM</option><option value="TECHNICAL">TECHNICAL</option>
            </select>
            <select value={delTeam} onChange={(e) => setDelTeam(e.target.value)} className="px-4 py-2.5 rounded-full border border-border-color text-sm bg-white" style={{ paddingRight: '2.25rem' }}>
              <option value="">All Teams</option>
              {(delProject ? PROJECT_TEAMS[delProject] : Object.values(PROJECT_TEAMS).flat()).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="text" value={delSearch} onChange={(e) => setDelSearch(e.target.value)} placeholder="Search name..." className="pl-9 pr-4 py-2.5 rounded-full border border-border-color text-sm bg-white w-48" />
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {deleteFiltered.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">No members match these filters.</p>
            ) : (
              deleteFiltered.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-hover-highlight/50">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{m.name || m.email}</p>
                    <p className="text-xs text-text-secondary">{m.email} · {m.project} · {m.team}</p>
                  </div>
                  <button onClick={() => handleDelete(m._id)} className="px-3 py-1.5 rounded-full bg-soft-red/10 text-soft-red text-xs font-medium hover:bg-soft-red hover:text-white transition-colors">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
