import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuth: authenticated, user, updateAuthStatus } = useContext(AuthContext);
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Klik di luar untuk menutup menu profile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  const handleLogout = () => {
    logout();
    updateAuthStatus();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const closeAllMenus = () => {
      setIsMenuOpen(false);
      setIsProfileOpen(false);
  }

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'border-sky-500 text-slate-900'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
    }`;
    
  const mobileNavLinkClasses = ({ isActive }) =>
    `block py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200 ${
        isActive
        ? 'border-l-4 border-sky-500 bg-sky-50 text-sky-700'
        : 'border-l-4 border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
    }`;

  const NAV_LINKS = [
      { to: "/", label: "Beranda" },
      { to: "/statistics", label: "Statistik" },
      { to: "/comparison", label: "Perbandingan" },
      { to: "/about", label: "Tentang" },
  ];

  const ICONS = {
    menu: <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-slate-800">
                UNISTATS
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {NAV_LINKS.map(link => (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                    {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side: Auth buttons / User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {authenticated ? (
              <div className="ml-3 relative" ref={profileMenuRef}>
                <div>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} type="button" className="bg-white p-2 rounded-full flex text-sm text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                    {ICONS.user}
                    <span className="ml-2 font-medium">{user.username}</span>
                  </button>
                </div>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                    {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex="-1">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex="-1">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none text-sm font-semibold transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" aria-controls="mobile-menu" aria-expanded="false">
              {isMenuOpen ? ICONS.close : ICONS.menu}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {NAV_LINKS.map(link => (
                <NavLink key={`mobile-${link.to}`} to={link.to} className={mobileNavLinkClasses} onClick={closeAllMenus}>
                    {link.label}
                </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {authenticated ? (
                <div className="px-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-slate-200 p-2 rounded-full text-slate-600">
                           {ICONS.user}
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium text-slate-800">{user.username}</div>
                            <div className="text-sm font-medium text-slate-500">{user.role}</div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        {user.role === 'admin' && (
                            <Link to="/admin" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100">Admin Panel</Link>
                        )}
                        <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 space-y-1">
                    <Link to="/login" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100">Login</Link>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;