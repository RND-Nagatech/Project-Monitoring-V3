import React, { useState } from 'react';
import { LogIn, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoginForm: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ userId: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();

  // Load saved credentials from local storage on component mount (auto-fill only)
  // Agar auto-fill hanya sekali saat mount
  const [autoFilled, setAutoFilled] = useState(false);
  React.useEffect(() => {
    if (autoFilled) return;
    const savedUserId = localStorage.getItem('userId');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedRememberMe && savedUserId && savedPassword) {
      setUserId(savedUserId);
      setPassword(savedPassword);
      setRememberMe(true);
    } else {
      setRememberMe(false);
    }
    setAutoFilled(true);
  }, [autoFilled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ userId: '', password: '' });
    setIsLoading(true);

    // Validation
    let hasErrors = false;
    const newFieldErrors = { userId: '', password: '' };

    if (!userId.trim()) {
      newFieldErrors.userId = 'User id belum diisi';
      hasErrors = true;
    }

    if (!password.trim()) {
      newFieldErrors.password = 'Password belum diisi';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Use the new login function from context
      await login({ username: userId.trim(), password });
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('userId');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
    } catch (error: any) {
      // Default error message
      let errMsg = 'Terjadi kesalahan saat login';
      let newFieldErrors = { userId: '', password: '' };
      // Cek error dari backend
      if (error && typeof error === 'object') {
        // Axios error
        if (error.response && error.response.status === 401) {
          // Cek pesan dari backend
          const msg = error.response.data?.message?.toLowerCase?.() || '';
          if (msg.includes('user') && msg.includes('tidak ditemukan')) {
            newFieldErrors.userId = 'User ID tidak ditemukan';
            errMsg = '';
          } else if (msg.includes('password') && msg.includes('salah')) {
            newFieldErrors.password = 'Password salah';
            errMsg = '';
          } else if (msg.includes('akun') && msg.includes('dinonaktifkan')) {
            errMsg = 'Akun dinonaktifkan';
          } else if (msg.includes('invalid credential') || msg.includes('invalid username or password')) {
            newFieldErrors.userId = 'User ID atau password salah';
            newFieldErrors.password = 'User ID atau password salah';
            errMsg = '';
          } else {
            errMsg = 'User ID atau password salah';
          }
        } else if (error.response && error.response.data?.message) {
          errMsg = error.response.data.message;
        } else if (error.message) {
          errMsg = error.message;
        }
      } else if (typeof error === 'string') {
        errMsg = error;
      }
      setFieldErrors(newFieldErrors);
      setError(errMsg);
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
                disabled={isLoading}
              />
              {fieldErrors.userId && (
                <p className="text-red-500 text-xs mt-1 font-light">{fieldErrors.userId}</p>
              )}
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
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-light">{fieldErrors.password}</p>
              )}
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

        </div>
      </div>
    </div>
  );
};

export default LoginForm;