export default function InversionesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-24 bg-gray-800 rounded-full mb-6" />
        <div className="h-10 w-80 bg-gray-800 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-gray-800 rounded mb-12" />

        <div className="bg-[#111118] rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex gap-2 mb-6">
            <div className="h-9 w-24 bg-gray-800 rounded-lg" />
            <div className="h-9 w-28 bg-gray-800 rounded-lg" />
          </div>
          <div className="h-72 bg-gray-800/40 rounded-xl" />
        </div>

        <div className="bg-[#111118] rounded-2xl border border-gray-800 p-8 mb-8">
          <div className="h-6 w-48 bg-gray-800 rounded mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-800/40 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="bg-[#111118] rounded-2xl border border-gray-800 p-8 mb-8">
          <div className="h-6 w-56 bg-gray-800 rounded mb-6" />
          <div className="h-80 bg-gray-800/40 rounded-xl" />
        </div>

        <div className="bg-[#111118] rounded-xl border border-gray-800 p-6 mb-8">
          <div className="h-6 w-52 bg-gray-800 rounded mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-16 bg-gray-800/40 rounded-xl" />
            <div className="h-16 bg-gray-800/40 rounded-xl" />
            <div className="h-16 bg-gray-800/40 rounded-xl" />
          </div>
          <div className="h-32 bg-gray-800/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
