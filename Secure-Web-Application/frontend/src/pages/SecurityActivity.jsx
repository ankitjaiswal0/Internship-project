import { useState, useEffect } from 'react';
import api from '../axios';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SecurityActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/user/activity');
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch security logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading activity...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Shield className="h-8 w-8 text-emerald-400 mr-3" />
        <h1 className="text-3xl font-bold text-white">Security Activity</h1>
      </div>
      
      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-md mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-slate-400">No activity recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-medium">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {log.ip_address || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.status === 'Success' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="h-3 w-3 mr-1" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityActivity;
