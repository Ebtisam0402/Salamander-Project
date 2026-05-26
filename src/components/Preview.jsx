import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getThumbnail } from '../mockApi.js'

export default function Preview() {
const { filename } = useParams()

  const [thumbnail, setThumbnail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getThumbnail(filename)
      .then((url) => {
        setThumbnail(url)
        setLoading(false)
      })
      .catch((err) => {
        //console.error(err)
        setError(err.message)
        setLoading(false)
      })
  }, [filename])

    if (error) {
    return (
      <p className="text-red-600 text-xl font-bold">
        Could not load thumbnail: {error}
      </p>
    )
  }

  // EARLY RETURN FOR LOADING
  if (loading) {
    return <p>Loading thumbnail...</p>
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview: {filename}</h1>
            <img
            className="rounded-xl mb-6 w-full"
            src={thumbnail}
            alt={filename}
          />
        
        <Link to="/videos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Back to videos</Link>
      </div>
    </div>
  )
}