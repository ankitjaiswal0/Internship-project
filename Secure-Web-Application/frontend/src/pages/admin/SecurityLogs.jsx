import { useState, useEffect } from 'react';
import api from '../../axios';
import { FileText, Filter, Search } from 'lucide-react';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Client side filtering for user

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAction) params.append('action', filterAction);
      if (filterStatus) params.append('status', filterStatus);
      
      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="text-slate-400" size={32} />
          Audit Logs
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <Filter size={16} className="text-slate-400 ml-2" />
            <select 
              className="bg-transparent border-none text-sm focus:ring-0 text-slate-200 p-2 cursor-pointer outline-none"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="" className="bg-slate-800">All Actions</option>
              <option value="Login" className="bg-slate-800">Login</option>
              <option value="Logout" className="bg-slate-800">Logout</option>
              <option value="Password Changed" className="bg-slate-800">Password Changed</option>
              <option value="Registration" className="bg-slate-800">Registration</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <select 
              className="bg-transparent border-none text-sm focus:ring-0 text-slate-200 p-2 cursor-pointer outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="" className="bg-slate-800">All Status</option>
              <option value="Success" className="bg-slate-800">Success</option>
              <option value="Failed" className="bg-slate-800">Failed</option>
            </select>
          </div>

          {/* User Search */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 px-3">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search User..."
              className="bg-transparent border-none text-sm focus:ring-0 text-slate-200 p-1.5 outline-none w-32"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30">
                    <td className="p-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-medium">{log.username}</td>
                    <td className="p-4">{log.action}</td>
                    <td className="p-4 font-mono text-xs">{log.ip_address}</td>
                    <td className="p-4 font-semibold text-xs text-slate-400">{log.severity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No logs found matching criteria.</td>
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

export default SecurityLogs;
