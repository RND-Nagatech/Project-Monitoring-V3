import React, { useState } from 'react';
import { LogIn, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dummyUsers } from '../data/dummy';

const LoginForm: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();

  // Load saved credentials from local storage on component mount
  React.useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedPassword = localStorage.getItem('password');
    if (savedUserId && savedPassword) {
      setUserId(savedUserId);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple authentication with dummy data
      const user = dummyUsers.find(u => u.user_id === userId);
      if (user && password === 'password123') {
        // Always save user data for session persistence
        login(user);
        
        // Save credentials for auto-fill only if remember me is checked
        if (rememberMe) {
          localStorage.setItem('userId', userId);
          localStorage.setItem('password', password);
        } else {
          localStorage.removeItem('userId');
          localStorage.removeItem('password');
        }
      } else {
        setError('User ID atau password salah');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 via-purple-500/90 to-pink-400/90"></div>
          <div className="relative z-10 text-white text-center p-8">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-light mb-3">Welcome Back</h2>
            <p className="text-lg font-light opacity-90">Monitoring Inquiry Dashboard</p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
          <div className="text-right mb-6">
            <h1 className="text-xs font-medium text-gray-400 tracking-wider uppercase">MONITORING</h1>
            <h2 className="text-base font-light text-gray-600">INQUIRY SYSTEM</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-light text-gray-800 mb-2">Sign In</h3>
          </div>

          {error && (
            <div className="text-red-500 text-xs mb-4 font-light">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 transition-opacity duration-200 ${isLoading ? 'opacity-75' : 'opacity-100'}`}>
            <div>
              <label htmlFor="userId" className="block text-xs text-gray-500 mb-1 font-light">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Enter your user ID"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-gray-500 mb-1 font-light">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-start text-xs">
              <label className="flex items-center text-gray-500">
                <input
                  type="checkbox"
                  className="mr-2 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-[1.02] transform'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Login...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2 font-medium">Demo Accounts:</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Produksi: prod001</p>
              <p>• QC: qc001</p>
              <p>• Finance: fin001</p>
              <p>• Helpdesk: help001</p>
              <p className="mt-2 text-gray-500 font-medium">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;