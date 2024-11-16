export default function DocumentsLoading() {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
  
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }