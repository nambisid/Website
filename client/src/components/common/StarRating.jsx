import { HiStar, HiOutlineStar } from 'react-icons/hi';

const StarRating = ({ rating, count, size = 16, interactive = false, onChange }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className="text-brand-gold hover:scale-110 transition-transform"
        >
          {i <= rating ? <HiStar size={size} /> : <HiOutlineStar size={size} />}
        </button>
      );
    } else {
      stars.push(
        i <= rating ? (
          <HiStar key={i} size={size} className="text-brand-gold" />
        ) : (
          <HiOutlineStar key={i} size={size} className="text-brand-linen" />
        )
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {count !== undefined && (
        <span className="text-sm text-brand-warm-gray ml-1">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
