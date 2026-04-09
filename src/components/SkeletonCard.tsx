const SkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
    <div className="aspect-square bg-muted" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="flex justify-between mt-3">
        <div className="h-6 bg-muted rounded w-16" />
        <div className="h-9 w-9 bg-muted rounded-xl" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
