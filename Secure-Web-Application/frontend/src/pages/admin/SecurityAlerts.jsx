import { useState, useEffect } from 'react';
import api from '../../axios';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock } from 'lucide-react';

const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/admin/security-alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (id, status) => {
    try {
      await api.patch(`/admin/security-alerts/${id}`, { status });
      // Update local state
      setAlerts(alerts.map(alert => alert.id === id ? { ...alert, status } : alert));
    } catch (err) {
      console.error('Failed to update alert status', err);
    }
  };

  const getSeverityStyle = (severity) => {
    const styles = {
      LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    };
    return styles[severity] || styles.MEDIUM;
  };

  const getStatusIcon = (status) => {
    if (status === 'RESOLVED') return <CheckCircle size={18} className="text-green-500" />;
    if (status === 'REVIEWED') return <ShieldAlert size={18} className="text-blue-500" />;
    return <Clock size={18} className="text-yellow-500" />;
  };

  if (loading) return <div className="text-center py-10">Loading Alerts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="text-orange-500" size={32} />
          Security Alerts
        </h1>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-slate-800 rounded-lg">
            No security alerts generated.
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityStyle(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-lg font-medium">{alert.message}</span>
                </div>
                
                <div className="text-sm text-slate-400 flex flex-wrap gap-4">
                  <span>User: <span className="text-slate-200">{alert.username}</span></span>
                  <span>Time: <span className="text-slate-200">{new Date(alert.timestamp).toLocaleString()}</span></span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2 text-sm font-medium bg-slate-900 px-3 py-1.5 rounded-full">
                  {getStatusIcon(alert.status)}
                  {alert.status}
                </div>
                
                {alert.status !== 'RESOLVED' && (
                  <div className="flex gap-2 mt-2">
                    {alert.status === 'NEW' && (
                      <button 
                        onClick={() => updateAlertStatus(alert.id, 'REVIEWED')}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                      className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
