export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
