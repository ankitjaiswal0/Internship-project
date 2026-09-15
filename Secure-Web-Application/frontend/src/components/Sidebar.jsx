import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, AlertTriangle, ShieldCheck, Activity, KeyRound, User, FileText } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Security Alerts', path: '/admin/alerts', icon: <AlertTriangle size={20} /> },
    { name: 'Login Activity', path: '/admin/login-activity', icon: <Activity size={20} /> },
    { name: 'Audit Logs', path: '/admin/logs', icon: <FileText size={20} /> },
    { name: 'Security Testing', path: '/admin/security-testing', icon: <ShieldCheck size={20} /> }
  ];
  
  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Security Activity', path: '/security-activity', icon: <Activity size={20} /> },
    { name: 'Change Password', path: '/change-password', icon: <KeyRound size={20} /> }
  ];
  
  const links = user.role === 'ADMIN' ? adminLinks : userLinks;
  
  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-64px)] hidden md:block">
      <div className="py-4 px-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          {user.role === 'ADMIN' ? 'Admin Navigation' : 'User Navigation'}
        </div>
        {links.map((link) => (
          <NavLink 
            key={link.path} 
            to={link.path}
            end={link.path === '/admin' || link.path === '/dashboard'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 font-medium' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
