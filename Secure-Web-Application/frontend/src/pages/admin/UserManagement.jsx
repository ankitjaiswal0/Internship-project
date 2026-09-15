import { useState, useEffect } from 'react';
import api from '../../axios';
import { Users, Power, ShieldAlert } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to update user status.');
    }
  };
  
  const changeUserRole = async (userId, newRole) => {
    if(!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role.');
    }
  }

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-500" size={32} />
          User Management
        </h1>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{u.username}</span>
                      <span className="text-xs text-slate-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select 
                      value={u.role}
                      onChange={(e) => changeUserRole(u.id, e.target.value)}
                      className={`bg-slate-900 border border-slate-700 rounded text-xs font-bold px-2 py-1 outline-none ${u.role === 'ADMIN' ? 'text-purple-400' : 'text-blue-400'}`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right flex justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${u.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
