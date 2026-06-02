import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写所有字段');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.register({ username: username.trim(), email: email.trim(), password });
      navigate('/login', { replace: true });
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || '注册失败，请重试');
      } else {
        setError('注册失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">关系记忆</h1>
          <p className="text-sm text-gray-500 mt-1">Personal Relationship Intelligence</p>
        </div>

        {/* Register card */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200 mb-5">注册</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5" htmlFor="username">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-500"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5" htmlFor="email">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-500"
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5" htmlFor="password">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-500"
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              已有账号？登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
