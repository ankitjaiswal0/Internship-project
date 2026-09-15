import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Welcome back, {user.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Your Profile</h2>
          </div>
          <p className="text-slate-400 mb-4">View and manage your account details.</p>
          <Link to="/profile" className="text-blue-400 hover:text-blue-300 font-medium">
            Go to Profile &rarr;
          </Link>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-emerald-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Security Activity</h2>
          </div>
          <p className="text-slate-400 mb-4">Review your recent logins and security events.</p>
          <Link to="/security-activity" className="text-emerald-400 hover:text-emerald-300 font-medium">
            View Activity &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
