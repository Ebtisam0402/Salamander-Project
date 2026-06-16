
import { useEffect, useState } from "react"
import { getVideos } from "../api.js"
import { Link } from "react-router-dom"
//import { data } from "react-router-dom"



export default function Videos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getVideos().then((data) => {
      setVideos(data)
      setLoading(false)

    })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])
  if (loading) {
    return <p className="p-6 text-xl">Loading videos...</p>
  }
  if (error) {
    return <p className="p-6 text-red-500">Could not load videos: {error}</p>
  }
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Available Videos</h1>

      {videos.length === 0 ? (
        <p>No videos available.</p>
      ) : (

        <ul className="flex flex-wrap gap-4">
          {videos.map((filename) => (
            <li key={filename}
              className="inline-block bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow"
            >

              <Link to={`/preview/${filename}`}
                className="text-lg font-medium text-blue-700 hover:text-blue-900 hover:underline">{filename}</Link>

            </li>

          ))}
        </ul>
      )}

    </div>
  )
}


