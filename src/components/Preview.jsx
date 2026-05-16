import { Link, useParams } from 'react-router-dom'

export default function Preview() {
 const { filename } = useParams()

 return (
  <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
   <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
    <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview: {filename}</h1>
    <p className="text-slate-600 text-lg mb-6">Thumbnail and tuning controls will go here in a future pair program.</p>
    <Link to="/videos"
     className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
     Back to videos</Link>
   </div>
  </div>
 )
}