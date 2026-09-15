import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const Error404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <HelpCircle className="h-24 w-24 text-slate-500 mb-6" />
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-md font-medium transition-colors">
        Return to Home
      </Link>
    </div>
  );
};

export default Error404;
