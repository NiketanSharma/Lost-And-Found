import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiUser, FiArrowRight, FiSearch, FiInfo } from 'react-icons/fi';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  // Demo user quick login buttons for convenience
  const fillDemoUser = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('AdminPass123!');
    } else if (userType === 'alex') {
      setUsername('alex_turner');
      setPassword('Password123!');
    } else {
      setUsername('sarah_connor');
      setPassword('Password123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <FiSearch className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Findr<span className="text-blue-600">.</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Report items, manage claims, and connect with your community.
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <FiInfo className="w-4 h-4 text-blue-600" />
            <span>Quick Demo Accounts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoUser('alex')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-lg font-semibold text-blue-700 transition-colors"
            >
              Alex Turner (Student)
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('sarah')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-lg font-semibold text-blue-700 transition-colors"
            >
              Sarah Connor (Finder)
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('admin')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-lg font-semibold text-slate-700 transition-colors"
            >
              Admin Staff
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <FiUser className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
