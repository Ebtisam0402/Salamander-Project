import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { getThumbnail } from '../api.js'

export default function Preview() {
  const { filename } = useParams()

  const [thumbnail, setThumbnail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [color, setColor] = useState("#000000")
  const [tolerance, setTolerance] = useState(50)

  const canvasRef = useRef(null)

  const imgRef = useRef(null)
  const [imageReady, setImageReady] = useState(false)

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return { r, g, b }
  }

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
  useEffect(() => {
    if (!thumbnail) return
    setImageReady(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setImageReady(true)
      // console.log('image loaded:', imgRef.current.naturalWidth, 'x', imgRef.current.naturalHeight)
    }
    img.src = thumbnail
  }, [thumbnail])

  useEffect(() => {
    // console.log('redrawing')
    if (!imageReady) return
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const px = data.data

    const targetR = parseInt(color.slice(1, 3), 16)
    const targetG = parseInt(color.slice(3, 5), 16)
    const targetB = parseInt(color.slice(5, 7), 16)

    for (let i = 0; i < px.length; i += 4) {

      const red = px[i]
      const green = px[i + 1]
      const blue = px[i + 2]

      const redDiff = Math.abs(red - targetR)
      const greenDiff = Math.abs(green - targetG)
      const blueDiff = Math.abs(blue - targetB)

      const distance = redDiff + greenDiff + blueDiff

      if (distance <= tolerance) {
        px[i] = 0
        px[i + 1] = 0
        px[i + 2] = 0
      } else {
        px[i] = 255
        px[i + 1] = 255
        px[i + 2] = 255
      }
    }




    ctx.putImageData(data, 0, 0)



  }, [imageReady, color, tolerance])


  if (error) {
    return (
      <p className="text-red-600 text-xl font-bold">
        Could not load thumbnail: {error}
      </p>
    )
  }

  function handleColorChange(e) {
    setColor(e.target.value)
    console.log("Color:", e.target.value)
  }

  function handleToleranceChange(e) {
    setTolerance(e.target.value)
    console.log("Tolerance:", e.target.value)
  }


  // EARLY RETURN FOR LOADING
  if (loading) {
    return <p>Loading thumbnail...</p>


  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview: {filename}</h1>

        <div className="mb-6 flex flex-col gap-4">

          <div>
            <label className="block font-semibold mb-2">
              Pick Color
            </label>

            <input
              type="color"
              value={color}
              onChange={handleColorChange}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Tolerance: {tolerance}
            </label>

            <input
              type="range"
              min="0"
              max="765"
              value={tolerance}
              onChange={handleToleranceChange}
              className="w-full"
            />
          </div>

        </div>


        <img
          className="rounded-xl mb-6 w-full"
          src={thumbnail}
          alt={filename}
        />

        <canvas
          ref={canvasRef}
          className="border border-slate-400 rounded-xl w-full h-64"
        />

        <Link to="/videos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Back to videos</Link>
      </div>
    </div>
  )
}