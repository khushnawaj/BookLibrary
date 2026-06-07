export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#DDD4C4] rounded-2xl overflow-hidden animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
            <div className="h-10 w-10 rounded-full bg-[#EDE6D8] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-28 rounded-full bg-[#EDE6D8]" />
              <div className="h-2.5 w-20 rounded-full bg-[#F0EBE3]" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#F0EBE3] shrink-0" />
          </div>

          {/* Content lines */}
          <div className="px-4 sm:px-5 pb-3.5 space-y-2">
            <div className="h-3 w-full rounded-full bg-[#F0EBE3]" />
            <div className="h-3 w-5/6 rounded-full bg-[#F0EBE3]" />
            <div className="h-3 w-4/6 rounded-full bg-[#EDE6D8]" />

            {/* Occasional image block */}
            {i === 1 && (
              <div className="mt-3 h-44 w-full rounded-xl bg-[#EDE6D8]" />
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-t border-[#F0EBE3]">
            {[60, 72, 48].map((w) => (
              <div key={w} className="h-7 rounded-xl bg-[#F0EBE3]" style={{ width: w }} />
            ))}
            <div className="ml-auto h-7 w-7 rounded-xl bg-[#F0EBE3]" />
          </div>
        </div>
      ))}
    </div>
  );
}
