import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

const Error403 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertOctagon className="h-24 w-24 text-red-500 mb-6" />
      <h1 className="text-6xl font-bold text-white mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-slate-300 mb-4">Access Denied</h2>
      <p className="text-slate-400 max-w-md mb-8">
        You do not have the required permissions to access this resource. This incident has been logged.
      </p>
      <Link to="/" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-md font-medium transition-colors">
        Return to Home
      </Link>
    </div>
  );
};

export default Error403;
