const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-3 border-brand-linen border-t-brand-blush-dark rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
