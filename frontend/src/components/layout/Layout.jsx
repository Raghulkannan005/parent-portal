import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExitToApp as LogoutIcon,
  ArrowBackIos as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Auto-close on mobile, auto-open on desktop
      if (width < 768) {
        setIsSidebarOpen(false);
      } else if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    // Always reset logout confirmation on navigation
    setIsConfirmingLogout(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
    { path: '/students', label: 'Students', icon: <SchoolIcon /> },
    { path: '/homework', label: 'Homework', icon: <AssignmentIcon /> },
    { path: '/messages', label: 'Messages', icon: <MessageIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
  ];

  const handleLogout = () => {
    if (isConfirmingLogout) {
      logout();
      toast.info('You have been logged out');
      navigate('/login');
    } else {
      setIsConfirmingLogout(true);
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setIsConfirmingLogout(false);
      }, 3000);
    }
  };

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col"
        animate={{ 
          x: isSidebarOpen ? 0 : -256,
          boxShadow: isSidebarOpen ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* App logo/title */}
        <div className="p-5 flex items-center justify-between border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <h1 className="text-xl font-bold text-primary-600">Parent Portal</h1>
          </Link>
          {window.innerWidth < 768 && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'User'} {user?.email && `• ${user.email}`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center px-4 py-2 rounded-lg transition-colors ${
              isConfirmingLogout 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isConfirmingLogout ? (
              <>
                <ArrowIcon className="mr-3 h-5 w-5" />
                <span>Confirm Logout</span>
              </>
            ) : (
              <>
                <LogoutIcon className="mr-3" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded focus:outline-none"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <div className="md:hidden text-gray-800 font-medium">
              {/* Show current page title on mobile */}
              {menuItems.find(item => isActive(item.path))?.label || ''}
            </div>
            <div className="flex items-center space-x-3">
              <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px]">
                {user?.email}
              </span>
              <div 
                className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 text-center text-sm text-gray-500 border-t border-gray-100 mt-auto">
          <p>© {new Date().getFullYear()} Parent Portal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;