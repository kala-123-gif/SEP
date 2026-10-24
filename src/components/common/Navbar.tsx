import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  UploadCloud,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
  Bookmark,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">Skill Exchange</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Student Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Academic Resources & Peer Learning</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/resources"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/resources')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Semester Library
              </Link>
              
<Link
  to="/projects-opportunities"
  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive('/projects-opportunities')
      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
  }`}
>
  Projects & Opportunities
</Link>

              <Link
                to="/upload"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/upload')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload Resource
              </Link>
              {user.email.toLowerCase() === 'suryakalagollapalli268@gmail.com' && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'text-indigo-600 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/profile')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/resources"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          )}

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {profile && (
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {profile.displayName || user.displayName || 'Student'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {profile.branch} • Sem {profile.semester}
                    </p>
                  </div>
                )}
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-200 overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm hover:ring-indigo-400 transition"
                  title="View Profile"
                >
                  {profile?.photoURL || user.photoURL ? (
                    <img
                      src={profile?.photoURL || user.photoURL || ''}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(profile?.displayName || user.displayName || 'S').charAt(0).toUpperCase()}</span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
                <p className="text-sm font-bold text-slate-900">
                  {profile?.displayName || user.displayName || 'Student'}
                </p>
                <p className="text-xs text-slate-500">
                  {user.email} • {profile?.branch} (Sem {profile?.semester})
                </p>
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive('/') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/resources"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive('/resources') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700'
                }`}
              >
                Semester Library
              </Link>
              
<Link
  to="/projects-opportunities"
  onClick={() => setMobileMenuOpen(false)}
  className={`block px-3 py-2 rounded-lg text-base font-medium ${
    isActive('/projects-opportunities')
      ? 'text-indigo-600 bg-indigo-50 font-semibold'
      : 'text-slate-700'
  }`}
>
  Projects & Opportunities
</Link>

              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive('/upload') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700'
                }`}
              >
                Upload Resource
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive('/profile') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700'
                }`}
              >
                Student Profile
              </Link>
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/resources"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Browse Catalog
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-base font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow"
              >
                Sign Up as Student
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
