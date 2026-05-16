export default function Processing() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview Processing Page</h1>
        <p lassName="text-lg text-slate-600 mb-6">This page will show video processing details.</p>
        <div className="bg-slate-200 rounded-xl h-64 flex items-center justify-center">
          <p className="text-slate-500 text-lg">
            Processing preview placeholder
          </p>
        </div>
      </div>
    </div>
  )
}