import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getCurrentUser } from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-xl">UNIVERSITAS STATS</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Link to="/" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Beranda</Link>
              <Link to="/statistics" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Statistik</Link>
              <Link to="/comparison" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Perbandingan</Link>
              <Link to="/about" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Tentang</Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {authenticated ? (
              <div className="flex items-center">
                <span className="text-gray-200 mr-3">{user.username}</span>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link>
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
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Beranda</Link>
            <Link to="/statistics" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Statistik</Link>
            <Link to="/comparison" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Perbandingan</Link>
            <Link to="/about" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Tentang</Link>
            {authenticated ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
