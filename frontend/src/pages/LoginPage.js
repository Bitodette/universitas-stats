import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login } from '../services/authService';
import { validateApiConnection } from '../services/api';
import { AuthContext } from '../context/AuthContext';

//=================================================================
// 1. KOMPONEN UI INTERNAL (Konsisten dengan halaman lain)
//=================================================================

const Alert = ({ message, type = 'info' }) => {
    const ICONS = {
        info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>,
        warning: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
        error: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    const colors = {
        info: 'bg-sky-100 border-sky-500 text-sky-800',
        warning: 'bg-amber-100 border-amber-500 text-amber-800',
        error: 'bg-rose-100 border-rose-500 text-rose-800',
    };
    return (
        <div className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${colors[type]}`} role="alert">
            <div className="flex-shrink-0">{ICONS[type]}</div>
            <div className="text-sm">{message}</div>
        </div>
    );
};


//=================================================================
// 2. KOMPONEN UTAMA: LoginPage
//=================================================================

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  const navigate = useNavigate();
  const { isAuth, updateAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    const checkApiConnection = async () => {
      const isConnected = await validateApiConnection();
      setApiConnected(isConnected);
      if (!isConnected) {
        setError('Tidak dapat terhubung ke server. Silakan coba lagi nanti atau hubungi administrator.');
      }
    };
    checkApiConnection();
  }, []);

  if (isAuth) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData);
      updateAuthStatus();
      navigate('/');
    } catch (error) {
      if (error.message === 'Network Error') {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(error.message || 'Login gagal. Periksa kembali email dan password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4">
      {/* Spacer atas, mengambil 1 bagian ruang kosong */}
      <div className="flex-grow"></div>
      
      {/* Konten Utama */}
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Selamat Datang</h1>
            <p className="text-slate-500">Silakan login untuk melanjutkan</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          {error && (
            <Alert type="error" message={error} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
                placeholder="anda@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                disabled={loading || !apiConnected}
              >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* FIXED: Spacer bawah, mengambil 3 bagian ruang kosong agar konten terdorong lebih tinggi */}
      <div className="flex-grow-[3]"></div>
    </div>
  );
};

export default LoginPage;