import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-emerald-400">
              <Shield className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl tracking-wider">SecureVault</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link to="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                )}
                
                <Link to="/profile" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
