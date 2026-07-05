import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-brand-blush-dark mb-4">404</h1>
        <p className="text-xl text-brand-charcoal mb-2">Page Not Found</p>
        <p className="text-brand-warm-gray mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
