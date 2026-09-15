import { useState, useEffect } from 'react';
import api from '../../axios';
import { ShieldAlert, Users, CheckCircle, XCircle, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [securityStatus, setSecurityStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedControl, setSelectedControl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, logsRes, statusRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/logs'),
        api.get('/admin/security-status')
      ]);
      setStats(statsRes.data);
      setRecentLogs(logsRes.data.slice(0, 5)); // Just get top 5
      setSecurityStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;

  const severityColors = {
    INFO: 'bg-blue-500/20 text-blue-400',
    LOW: 'bg-green-500/20 text-green-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    CRITICAL: 'bg-red-500/20 text-red-400',
    WARNING: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={stats?.total_users} icon={<Users />} color="blue" />
        <StatCard title="Active Users" value={stats?.active_users} icon={<CheckCircle />} color="green" />
        <StatCard title="Successful Logins" value={stats?.successful_logins} icon={<Activity />} color="emerald" />
        <StatCard title="Failed Logins" value={stats?.failed_logins} icon={<XCircle />} color="red" />
        <StatCard title="Security Alerts" value={stats?.security_alerts} icon={<AlertTriangle />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-blue-500" /> Security Score</h2>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-green-500" strokeWidth="3" strokeDasharray={`${stats?.security_score}, 100`} strokeLinecap="round" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{stats?.security_score}</span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">System is well protected against common vulnerabilities.</p>
        </div>

        {/* Security Status */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Implemented Security Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {securityStatus.map(control => (
              <div key={control.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="font-medium text-sm">{control.name}</span>
                </div>
                <button 
                  onClick={() => setSelectedControl(control)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold">Recent Security Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Event</th>
                <th className="p-3">User</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
                <th className="p-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30">
                  <td className="p-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.username}</td>
                  <td className="p-3 font-mono text-xs">{log.ip_address}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[log.severity] || severityColors.INFO}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">No recent events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Details Modal */}
      {selectedControl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="text-blue-500" />
              {selectedControl.name}
            </h3>
            <p className="text-slate-300 mb-6">{selectedControl.details}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedControl(null)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };
  
  return (
    <div className={`rounded-lg p-4 border flex flex-col gap-2 ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold">{value !== undefined ? value : '-'}</span>
    </div>
  );
};

export default AdminDashboard;
