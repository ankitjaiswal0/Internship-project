import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Users, Activity } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="text-center py-12">
      <Shield className="h-24 w-24 mx-auto text-emerald-400 mb-6" />
      <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Welcome to SecureVault</h1>
      <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
        A demonstration of secure web application principles, including Authentication, Role-Based Access Control, and modern security defenses.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto text-left">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <Lock className="h-8 w-8 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Secure Auth</h3>
          <p className="text-slate-400">HttpOnly cookies, CSRF tokens, rate limiting, and robust password hashing.</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <Users className="h-8 w-8 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">RBAC</h3>
          <p className="text-slate-400">Strict separation between USER and ADMIN roles at the API level.</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <Activity className="h-8 w-8 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Audit Logging</h3>
          <p className="text-slate-400">Comprehensive logging of security events and access attempts.</p>
        </div>
      </div>

      <div className="flex justify-center space-x-6">
        {user ? (
          <>
            <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-md font-bold transition-colors">
              Go to Dashboard
            </Link>
            <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-md font-bold transition-colors">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-md font-bold transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-md font-bold transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
