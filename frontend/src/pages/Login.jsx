import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PROJECT_TEAMS = {
  STEM: ['Valor', 'Vindex'],
  NON_STEM: ['Evals'],
  TECHNICAL: ['Fenrir', 'Kensei', 'Jaeger'],
};

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState('member');
  const [signupProject, setSignupProject] = useState('TECHNICAL');
  const [signupTeam, setSignupTeam] = useState('Fenrir');

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/tasks'} replace />;
  }

  const validateDomain = (email) => {
    if (!/^[\w.+-]+@ethara\.ai$/i.test(email)) {
      setError('Only @ethara.ai email addresses are allowed');
      return false;
    }
    return true;
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@ethara.ai');
      setPassword('password123');
    } else {
      setEmail('member@ethara.ai');
      setPassword('password123');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateDomain(email)) return;

    setLoading(true);
    try {
      const userData = mode === 'signin'
        ? await login(email, password)
        : await register(email, password, signupRole, signupRole === 'member' ? signupProject : null, signupRole === 'member' ? signupTeam : null);

      navigate(userData.role === 'admin' ? '/dashboard' : '/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg border border-border-color p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Ethara Mock Task Manager</h1>
          <p className="text-text-secondary mt-2 text-sm">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-hover-highlight rounded-full p-1">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-olive text-white' : 'text-text-secondary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-olive text-white' : 'text-text-secondary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' && (
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="flex-1 py-2.5 rounded-full text-sm font-medium border border-olive text-olive hover:bg-olive hover:text-white transition-colors"
            >
              Login as Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('member')}
              className="flex-1 py-2.5 rounded-full text-sm font-medium border border-soft-blue text-text-primary hover:bg-soft-blue hover:text-white transition-colors"
            >
              Login as Member
            </button>
          </div>
        )}

        {error && (
          <div className="bg-soft-red/20 border border-soft-red text-danger px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email (@ethara.ai)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ethara.ai"
              required
              className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-olive/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-olive/30 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('admin')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      signupRole === 'admin' ? 'bg-sidebar text-white' : 'border border-border-color text-text-secondary'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('member')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      signupRole === 'member' ? 'bg-sidebar text-white' : 'border border-border-color text-text-secondary'
                    }`}
                  >
                    Member
                  </button>
                </div>
              </div>

              {signupRole === 'member' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Project</label>
                    <select
                      value={signupProject}
                      onChange={(e) => { setSignupProject(e.target.value); setSignupTeam(PROJECT_TEAMS[e.target.value][0]); }}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
                    >
                      <option value="STEM">STEM</option>
                      <option value="NON_STEM">NON STEM</option>
                      <option value="TECHNICAL">TECHNICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Team</label>
                    <select
                      value={signupTeam}
                      onChange={(e) => setSignupTeam(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border-color rounded-xl text-sm bg-white"
                    >
                      {PROJECT_TEAMS[signupProject]?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-btn-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-text-secondary text-center mt-4">
          Only @ethara.ai email addresses are accepted
        </p>
      </div>
    </div>
  );
}
