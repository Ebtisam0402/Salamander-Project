import { Link, useParams } from 'react-router-dom'
import { getThumbnail } from '../mockApi.js'

export default function Preview() {
  const { filename } = useParams()

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview: {filename}</h1>
        <img className="text-slate-600 text-lg mb-6" src=' /salamander1.jpg' alt='salamander image' />
        <Link to="/videos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Back to videos</Link>
      </div>
    </div>
  )
}