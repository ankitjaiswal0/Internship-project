import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../axios';
import { User, Shield, Key, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setMessage({ text: 'Password changed successfully! You will need to log in again.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <User className="text-blue-500" size={32} />
        Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 md:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <div className="text-lg bg-slate-900/50 p-2 rounded border border-slate-700">{user.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <div className="text-lg bg-slate-900/50 p-2 rounded border border-slate-700">{user.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <div className="text-md bg-slate-900/50 p-2 rounded border border-slate-700 font-semibold text-blue-400">{user.role}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <div className="text-md bg-slate-900/50 p-2 rounded border border-slate-700 text-green-400 font-semibold">Active</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 pt-4">
              Account created: {new Date(user.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Account Security Summary */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Shield className="text-green-500" size={20} /> Security Status
          </h2>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700/50">
              <span className="text-sm font-medium">Authentication</span>
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                <CheckCircle size={12} /> SECURE
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700/50">
              <span className="text-sm font-medium">Data Encryption</span>
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                <CheckCircle size={12} /> ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700/50">
              <span className="text-sm font-medium">Failed Logins</span>
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                <CheckCircle size={12} /> NONE RECENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-2xl">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Key className="text-blue-500" size={20} /> Change Password
        </h2>
        
        {message.text && (
          <div className={`p-3 rounded mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long and contain uppercase, lowercase, and a number.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
