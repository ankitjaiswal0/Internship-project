import { useState, useEffect } from 'react';
import api from '../../axios';
import { Activity, Filter } from 'lucide-react';

const LoginActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // '', 'Success', 'Failed'

  useEffect(() => {
    fetchLoginActivity(filter);
  }, [filter]);

  const fetchLoginActivity = async (statusFilter) => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/login-activity?status=${statusFilter}` : '/admin/login-activity';
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch login activity', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="text-blue-500" size={32} />
          Login Activity
        </h1>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <Filter size={16} className="text-slate-400 ml-2" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 text-slate-200 p-2 cursor-pointer outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="" className="bg-slate-800">All Logins</option>
            <option value="Success" className="bg-slate-800">Successful Only</option>
            <option value="Failed" className="bg-slate-800">Failed Only</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading activity...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30">
                    <td className="p-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-medium">{log.username}</td>
                    <td className="p-4">{log.action}</td>
                    <td className="p-4 font-mono text-xs">{log.ip_address}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No login activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginActivity;
