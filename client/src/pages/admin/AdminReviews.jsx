import { useEffect, useState } from 'react';
import { HiOutlineCheck, HiOutlineX, HiOutlineStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getReviewsForModeration, moderateReview } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | approved

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getReviewsForModeration({ limit: 100 });
      setReviews(data.data || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleModerate = async (review, isApproved) => {
    try {
      await moderateReview(review._id, isApproved);
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, isApproved } : r))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Reviews</h1>
        <p className="text-brand-warm-gray mt-1">
          Approve or hide customer reviews.
        </p>
      </div>

      <div className="flex gap-2 animate-(--animate-fade-up)">
        {['all', 'pending', 'approved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-brand-charcoal text-white'
                : 'bg-white border border-brand-linen hover:bg-brand-cream'
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'pending'
                ? reviews.filter((r) => !r.isApproved).length
                : f === 'approved'
                ? reviews.filter((r) => r.isApproved).length
                : reviews.length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
          <p className="text-brand-warm-gray">
            {filter === 'pending'
              ? 'No reviews waiting for moderation. 🎉'
              : 'No reviews yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r, idx) => (
            <article
              key={r._id}
              className="bg-white rounded-2xl border border-brand-linen p-5 animate-(--animate-fade-up)"
              style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
            >
              <header className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-brand-charcoal">
                    {r.user?.firstName} {r.user?.lastName}
                  </p>
                  <p className="text-xs text-brand-warm-gray">
                    on {r.product?.name || 'Unknown product'}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    r.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {r.isApproved ? 'Approved' : 'Hidden'}
                </span>
              </header>

              <div className="flex items-center gap-0.5 mb-2 text-brand-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HiOutlineStar
                    key={i}
                    size={16}
                    className={i < r.rating ? 'fill-current' : 'opacity-30'}
                  />
                ))}
              </div>

              {r.title && (
                <h4 className="font-serif text-base mb-1.5">{r.title}</h4>
              )}
              {r.comment && (
                <p className="text-sm text-brand-warm-gray leading-relaxed mb-3">
                  {r.comment}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-brand-linen">
                <p className="text-xs text-brand-warm-gray">
                  {new Date(r.createdAt).toLocaleDateString()}
                  {r.isVerifiedPurchase && (
                    <span className="ml-2 text-brand-sage-dark font-medium">
                      ✓ Verified purchase
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  {r.isApproved ? (
                    <button
                      onClick={() => handleModerate(r, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-error hover:bg-red-50 rounded-lg font-medium"
                    >
                      <HiOutlineX size={14} />
                      Hide
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(r, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-sage-dark hover:bg-green-50 rounded-lg font-medium"
                    >
                      <HiOutlineCheck size={14} />
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
