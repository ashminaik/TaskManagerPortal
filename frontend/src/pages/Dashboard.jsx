import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardAPI, tasksAPI } from '../api/axios';

const COLORS = { STEM: '#3B82F6', 'NON_STEM': '#8B5CF6', TECHNICAL: '#22C55E' };
const TEAM_SHADES = {
  Valor: '#3B82F6', Vindex: '#60A5FA',
  Evals: '#8B5CF6',
  Fenrir: '#22C55E', Kensei: '#4ADE80', Jaeger: '#86EFAC',
};
const BAR_COLORS = { STEM: '#3B82F6', 'NON_STEM': '#8B5CF6', TECHNICAL: '#22C55E' };
const STATUS_COLORS = { Done: '#22C55E', 'In Progress': '#3B82F6', Overdue: '#EF4444', 'To Do': '#F59E0B' };

const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E293B', color: '#fff', padding: '8px 12px', fontSize: '12px', lineHeight: 1.4 }}>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.payload.fill || p.color, display: 'inline-block' }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

function DonutCard({ title, data, total, colors }) {
  return (
    <div className="bg-white border border-[#E5E7EB]" style={{ borderRadius: '4px' }}>
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h4 className="text-sm font-semibold text-[#1F2A44]">{title}</h4>
      </div>
      <div className="p-5 flex flex-col items-center">
        <div style={{ width: 160, height: 160, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={colors?.[i] || '#ccc'} />)}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span className="text-2xl font-bold text-[#1F2A44]">{total}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[#667085]">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colors?.[i] }} />
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarCard({ title, data, color }) {
  return (
    <div className="bg-white border border-[#E5E7EB]" style={{ borderRadius: '4px', borderTop: `3px solid ${color}` }}>
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h4 className="text-sm font-semibold text-[#1F2A44]">{title}</h4>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={Math.max(data.length * 50 + 30, 80)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="value" radius={[0, 0, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={data[i].fill || color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [teamData, setTeamData] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [overdueByTeam, setOverdueByTeam] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.tasksByTeam(),
      dashboardAPI.tasksByStatus(),
      dashboardAPI.overdueByTeam(),
      tasksAPI.getAll({ status: 'Overdue' }),
    ]).then(([team, status, overdue, overdueTasksRes]) => {
      setTeamData(team.data.data || []);
      setStatusData(status.data.data || {});
      setOverdueByTeam(overdue.data.data || []);
      setOverdueTasks(overdueTasksRes.data.tasks || []);
      setLoading(false);
    });
  }, []);

  const totalTasks = Object.values(statusData).reduce((a, b) => a + b, 0);
  const totalOverdue = statusData.Overdue || 0;

  const projectTotals = {};
  teamData.forEach((d) => {
    if (!projectTotals[d.project]) projectTotals[d.project] = 0;
    projectTotals[d.project] += d.count;
  });

  const totalDonut = Object.entries(projectTotals).map(([name, value]) => ({ name, value }));
  const totalColors = Object.entries(projectTotals).map(([name]) => COLORS[name] || '#ccc');

  const PROJECTS = ['STEM', 'NON_STEM', 'TECHNICAL'];
  const projectDonuts = PROJECTS.map((proj) => {
    const items = teamData.filter((d) => d.project === (proj === 'NON_STEM' ? 'NON_STEM' : proj));
    return { project: proj, total: items.reduce((s, i) => s + i.count, 0), data: items.map((d) => ({ name: d.team, value: d.count, fill: TEAM_SHADES[d.team] || '#ccc' })) };
  });

  const projectBars = PROJECTS.map((proj) => {
    const items = teamData.filter((d) => d.project === (proj === 'NON_STEM' ? 'NON_STEM' : proj));
    return { project: proj, color: COLORS[proj], data: items.map((d) => ({ name: d.team, value: d.count, fill: TEAM_SHADES[d.team] || COLORS[proj] })) };
  });

  const overdueBarData = overdueByTeam.map((d) => ({ name: d.team, value: d.overdueCount, fill: TEAM_SHADES[d.team] || '#EF4444' }));

  if (loading) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1F2A44]">Dashboard</h1>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A44] mb-4">Tasks Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['STEM', 'NON_STEM', 'TECHNICAL'].map((project) => {
            const projKey = project === 'NON_STEM' ? 'NON_STEM' : project;
            const projectData = teamData.filter((d) => d.project === projKey).map((d) => ({ team: d.team, tasks: d.count }));
            return (
              <div key={project} className="bg-white border border-[#E5E7EB] rounded p-5" style={{ borderRadius: '4px' }}>
                <h4 className="text-sm font-semibold text-[#1F2A44] mb-3">{project}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="team" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="tasks" fill={BAR_COLORS[project]} radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#1F2A44] mb-1">Total Tasks</h2>
        <p className="text-4xl font-bold text-[#1F2A44] mb-6">{totalTasks}</p>
        <div className="max-w-md">
          <DonutCard title="Tasks by Project" data={totalDonut} total={totalTasks} colors={totalColors} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A44] mb-4">Tasks by Status</h3>
        <div className="bg-white border border-[#E5E7EB] rounded p-6" style={{ borderRadius: '4px' }}>
          <div className="w-full h-10 flex overflow-hidden" style={{ borderRadius: '4px' }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => {
              const count = statusData[status] || 0;
              return count > 0 ? (
                <div key={status} style={{ width: `${(count / totalTasks) * 100}%`, backgroundColor: color }}
                  className="h-full flex items-center justify-center text-xs font-medium text-white">
                  {count}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#667085]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block" style={{ backgroundColor: '#22C55E', borderRadius: '50%' }} /> Done: {statusData['Done'] || 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block" style={{ backgroundColor: '#3B82F6', borderRadius: '50%' }} /> In Progress: {statusData['In Progress'] || 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block" style={{ backgroundColor: '#EF4444', borderRadius: '50%' }} /> Overdue: {totalOverdue}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block" style={{ backgroundColor: '#F59E0B', borderRadius: '50%' }} /> To Do: {statusData['To Do'] || 0}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[#1F2A44] mb-4">Total Tasks Per Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectDonuts.map((p) => (
            <DonutCard key={p.project} title={p.project} data={p.data} total={p.total} colors={p.data.map((d) => d.fill)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[#1F2A44] mb-4">Tasks by Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectBars.map((p) => (
            <BarCard key={p.project} title={p.project} data={p.data} color={p.color} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[#1F2A44] mb-1">Overdue Tasks</h3>
        <p className="text-3xl font-bold text-[#EF4444] mb-4">{totalOverdue}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded p-6" style={{ borderRadius: '4px' }}>
            <h4 className="text-sm font-semibold text-[#1F2A44] mb-4">Overdue by Project</h4>
            <div className="w-full h-10 flex overflow-hidden" style={{ borderRadius: '4px' }}>
              {overdueByTeam.map((d) => {
                const w = totalOverdue > 0 ? (d.overdueCount / totalOverdue) * 100 : 0;
                return d.overdueCount > 0 ? (
                  <div key={d.team} style={{ width: `${w}%`, backgroundColor: TEAM_SHADES[d.team] || '#EF4444' }}
                    className="h-full flex items-center justify-center text-xs font-medium text-white">
                    {d.overdueCount}
                  </div>
                ) : null;
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#667085]">
              {overdueByTeam.map((d) => (
                <span key={d.team} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 inline-block rounded-full" style={{ backgroundColor: TEAM_SHADES[d.team] || '#EF4444' }} />
                  {d.team}: {d.overdueCount}
                </span>
              ))}
              {overdueByTeam.length === 0 && <span>No overdue tasks</span>}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded p-6" style={{ borderRadius: '4px' }}>
            <h4 className="text-sm font-semibold text-[#1F2A44] mb-4">Overdue Task List</h4>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-[#667085]">No overdue tasks.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overdueTasks.map((t) => (
                  <div key={t._id} className="flex items-center justify-between py-2 px-3 bg-[#FEF2F2] rounded text-sm">
                    <span className="text-[#1F2A44] font-medium truncate flex-1">{t.title}</span>
                    <span className="text-xs text-[#667085] ml-2 whitespace-nowrap">{t.projectType} · {t.team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
