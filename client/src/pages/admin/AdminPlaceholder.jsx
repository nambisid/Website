import { HiOutlineSparkles } from 'react-icons/hi';

const AdminPlaceholder = ({ title, description }) => (
  <div className="space-y-6">
    <div className="animate-(--animate-fade-down)">
      <h1 className="text-3xl font-serif text-brand-charcoal">{title}</h1>
      <p className="text-brand-warm-gray mt-1">{description}</p>
    </div>
    <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blush/30 text-brand-blush-dark flex items-center justify-center mb-4 animate-(--animate-float)">
        <HiOutlineSparkles size={28} />
      </div>
      <h2 className="font-serif text-xl mb-2">Coming in the next wave</h2>
      <p className="text-brand-warm-gray max-w-md mx-auto text-sm">
        The backend endpoints are ready — this admin screen is queued for the next
        build pass. Tell Claude to continue and this becomes a working management
        page in minutes.
      </p>
    </div>
  </div>
);

export default AdminPlaceholder;
