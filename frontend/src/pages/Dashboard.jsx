import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { dashboardAPI } from '../api/axios';

const PIE_COLORS = ['#9BA86F', '#E8C7D3', '#B7C9EA', '#E9C75B', '#E58D8D'];
const BAR_COLORS = {
  STEM: '#E8C7D3',
  'NON STEM': '#B7C9EA',
  TECHNICAL: '#E9C75B',
};

export default function Dashboard() {
  const [teamData, setTeamData] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [userData, setUserData] = useState([]);
  const [overdueData, setOverdueData] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardAPI.tasksByTeam(),
      dashboardAPI.tasksByStatus(),
      dashboardAPI.tasksPerUser(),
      dashboardAPI.overdueByTeam(),
    ]).then(([team, status, users, overdue]) => {
      setTeamData(team.data.data);
      setStatusData(status.data.data);
      setUserData(users.data.data);
      setOverdueData(overdue.data.data);
    });
  }, []);

  const totalTasks = Object.values(statusData).reduce((a, b) => a + b, 0);

  const filteredUsers = userData.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.name?.toLowerCase().includes(term) ||
      u.project?.toLowerCase().includes(term)
    );
  });
  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Tasks Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['STEM', 'NON STEM', 'TECHNICAL'].map((project) => {
            const projectData = teamData
              .filter((d) => d.project === (project === 'NON STEM' ? 'NON_STEM' : project))
              .map((d) => ({ team: d.team, tasks: d.count }));
            return (
              <div key={project} className="bg-white rounded-2xl border border-border-color p-5">
                <h4 className="text-sm font-semibold text-text-primary mb-3">{project}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="team" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill={BAR_COLORS[project]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Tasks by Status</h3>
        <div className="bg-white rounded-2xl border border-border-color p-6">
          <div className="w-full h-10 rounded-full overflow-hidden flex">
            {Object.entries(statusData).map(([status, count]) =>
              count > 0 ? (
                <div
                  key={status}
                  style={{ width: `${(count / totalTasks) * 100}%` }}
                  className={`h-full flex items-center justify-center text-xs font-medium ${
                    status === 'Done'
                      ? 'bg-success'
                      : status === 'In Progress'
                      ? 'bg-soft-blue'
                      : status === 'Overdue'
                      ? 'bg-danger'
                      : 'bg-soft-yellow'
                  }`}
                >
                  {count}
                </div>
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-success inline-block" /> Done: {statusData['Done'] || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-soft-blue inline-block" /> In Progress: {statusData['In Progress'] || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-danger inline-block" /> Overdue: {statusData['Overdue'] || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-soft-yellow inline-block" /> To Do: {statusData['To Do'] || 0}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Tasks per User</h3>
        <div className="bg-white rounded-2xl border border-border-color p-6">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Filter by user name..."
              className="w-full max-w-sm pl-9 pr-4 py-2 border border-border-color rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive/30"
            />
          </div>
          <div className="space-y-2">
            {displayedUsers.map((u) => (
              <div
                key={u.userId}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-hover-highlight"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center text-olive text-sm font-medium">
                    {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{u.name || u.email}</p>
                    <p className="text-xs text-text-secondary">
                      {u.project || '—'} — {u.team || '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{u.count} tasks</p>
                  <p className="text-xs text-text-secondary truncate max-w-[200px]">
                    {u.taskTitles?.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredUsers.length > 5 && (
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="mt-3 flex items-center gap-1 text-sm text-olive hover:underline"
            >
              {showAllUsers ? (
                <>
                  Show Less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show More ({filteredUsers.length - 5} more) <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Overdue Tasks by Team
        </h3>
        <div className="bg-white rounded-2xl border border-border-color p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overdueData}
                dataKey="overdueCount"
                nameKey="team"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ team, overdueCount }) => `${team}: ${overdueCount}`}
              >
                {overdueData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
