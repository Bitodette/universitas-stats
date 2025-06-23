import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth: authenticated, user, updateAuthStatus } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    updateAuthStatus();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-primary-700 bg-opacity-90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-medium text-lg">UNIVERSITAS STATS</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-1">
              <Link to="/" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600">Beranda</Link>
              <Link to="/statistics" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600">Statistik</Link>
              <Link to="/comparison" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600">Perbandingan</Link>
              <Link to="/about" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600">Tentang</Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {authenticated ? (
              <div className="flex items-center">
                {user.username !== 'admin' && (
                  <span className="text-neutral-100 mr-3">{user.username}</span>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600 mr-2">Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-neutral-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary-600">Login</Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-primary-600">
            <Link to="/" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Beranda</Link>
            <Link to="/statistics" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Statistik</Link>
            <Link to="/comparison" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Perbandingan</Link>
            <Link to="/about" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Tentang</Link>
            {authenticated ? (
              <>
                {user.username !== 'admin' && (
                  <span className="text-neutral-100 block px-3 py-2 rounded-md text-base font-medium">{user.username}</span>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors hover:bg-primary-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-neutral-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary-500">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;