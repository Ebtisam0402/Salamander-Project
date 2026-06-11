import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  getThumbnail,
  submitProcessingJob,
  getJobStatus
} from '../api.js'

// Create the Preview component
export default function Preview() {
  // Get the video filename from the URL
  const { filename } = useParams()

  // Store the video URL
  const [thumbnail, setThumbnail] = useState("")
  const [loading, setLoading] = useState(true) // Track if video is loading
  const [error, setError] = useState("") // Store error message

  const [color, setColor] = useState("#000000") // Store selected target color
  const [tolerance, setTolerance] = useState(50) // Store tolerance slider value

  const [jobId, setJobId] = useState(null)// Store backend processing job ID
  const [jobStatus, setJobStatus] = useState(null) // Store job status result

  const canvasRef = useRef(null) // Reference to the canvas element

  const videoRef = useRef(null) // Reference to the video element
  const [imageReady, setImageReady] = useState(false) // Track when video is ready to draw

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return { r, g, b }
  }

  useEffect(() => { // Run when filename changes
    getThumbnail(filename) // Get video URL from API
      .then((url) => {
        setThumbnail(url) // Save video URL
        setLoading(false) // Stop loading
      })
      .catch((err) => { // If error happens
        //console.error(err)
        setError(err.message) // Save error message
        setLoading(false) // Stop loading
      })

  }, [filename])// Re-run when filename changes


  useEffect(() => { // Redraw canvas when video/settings change
    // console.log('redrawing')
    if (!imageReady) return // Stop if video is not ready
    //const img = imgRef.current
    const img = videoRef.current // Get video element
    const video = videoRef.current // Get canvas element

    const canvas = canvasRef.current
    if (!img || !canvas) return // Stop if either is missing

    if (!video.videoWidth || !video.videoHeight) return // Stop if video size is not ready

    canvas.width = video.videoWidth // Get video element
    canvas.height = video.videoHeight // Get canvas element

    const ctx = canvas.getContext('2d') // Get canvas drawing tools
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height) // Draw current video frame

    // const ctx = canvas.getContext('2d')
    // ctx.drawImage(img, 0, 0)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height) // Read pixels
    const px = data.data // Get pixel array

    const targetR = parseInt(color.slice(1, 3), 16) // Convert selected color red value
    const targetG = parseInt(color.slice(3, 5), 16) // Convert selected color green value
    const targetB = parseInt(color.slice(5, 7), 16) // Convert selected color blue value

    let sumX = 0 // Add up detected pixel x positions
    let sumY = 0 // Add up detected pixel y positions
    let count = 0 // Count detected pixels

    for (let i = 0; i < px.length; i += 4) { // Loop through pixels, 4 values at a time
      const pixelIndex = i / 4 // Convert array index to pixel number
      const x = pixelIndex % canvas.width // Find x position of pixel
      const y = Math.floor(pixelIndex / canvas.width) // Find y position of pixel

      const red = px[i] // Current pixel red value
      const green = px[i + 1] // Current pixel green value
      const blue = px[i + 2] // Current pixel blue value

      const redDiff = Math.abs(red - targetR) // Difference from target red
      const greenDiff = Math.abs(green - targetG) // Difference from target green
      const blueDiff = Math.abs(blue - targetB) // Difference from target blue

      const distance = redDiff + greenDiff + blueDiff // Total color difference

      if (distance <= tolerance) {  // If pixel is close enough to selected color
        px[i] = 0 // Make red channel black
        px[i + 1] = 0 // Make green channel black
        px[i + 2] = 0 // Make blue channel black

        sumX += x // Add x to centroid total
        sumY += y // Add y to centroid total
        count++ // Count this detected pixel
      } else { // If pixel is not close to selected color
        px[i] = 255 // Make red channel white
        px[i + 1] = 255 // Make green channel white
        px[i + 2] = 255  // Make blue channel white
      }
    }

    ctx.putImageData(data, 0, 0)  // Put edited pixels back on canvas

    if (count > 0) { // Only draw dot if pixels were detected
      const centroidX = sumX / count // Calculate center x
      const centroidY = sumY / count // Calculate center y

      ctx.beginPath() // Start drawing dot
      ctx.arc(centroidX, centroidY, 8, 0, Math.PI * 2) // Draw circle
      ctx.fillStyle = 'red' // Make dot red
      ctx.fill() // Fill the circle
    }

  }, [imageReady, color, tolerance]) // Re-run when video or settings change

  useEffect(() => { // Poll backend job status
    if (!jobId) return // Stop if no job ID yet

    const interval = setInterval(async () => { // Check every 2 seconds
      const status = await getJobStatus(jobId) // Ask backend for status
      setJobStatus(status) // Save status in state

      if (status.status === "done") { // If finished
        clearInterval(interval) // Stop polling
      }
    }, 2000)  // Poll every 2 seconds

    return () => clearInterval(interval) // Clean up interval
  }, [jobId]) // Re-run when job ID changes


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
    setTolerance(Number(e.target.value))
    console.log("Tolerance:", e.target.value)
  }


  // EARLY RETURN FOR LOADING
  if (loading) {
    return <p>Loading thumbnail...</p>


  }

  async function handleProcessVideo() {
    try {
      const job = await submitProcessingJob(
        filename,
        color,
        tolerance
      )

      setJobId(job.jobId)
      setJobStatus({ status: "processing" })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview: {filename}</h1>

        <div className="mb-6 flex flex-col gap-4">

          <div>
            <label className="block font-semibold mb-2">
              Pick Color
            </label>
            {/* <p>{thumbnail}</p> */}

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


        {/* <img
          className="rounded-xl mb-6 w-full"
          src={thumbnail}
          alt={filename}
        />

        <canvas
          ref={canvasRef}
          className="border border-slate-400 rounded-xl w-full h-64"
        /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Original Video</h2>

            {/* <video
              ref={videoRef}
              controls
              muted
              preload="metadata"
              className="rounded-xl w-full border border-slate-400"
              src={thumbnail}
              onLoadedData={() => setImageReady(true)}
              onPlay={() => setImageReady((ready) => !ready)}
              onTimeUpdate={() => setImageReady((ready) => !ready)}
            /> */}
            <video
              key={thumbnail}
              ref={videoRef}
              controls
              muted
              preload="auto"
              className="rounded-xl w-full  border border-slate-400"
              onLoadedMetadata={() => {
                console.log("video loaded:", videoRef.current.videoWidth, videoRef.current.videoHeight)
                setImageReady(true)
              }}
              onError={() => {
                console.log("video error", videoRef.current.error)
              }}
            >
              <source src={thumbnail} type="video/mp4" />
            </video>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Processed Preview</h2>

            <canvas
              ref={canvasRef}
              className="border border-slate-400 rounded-xl w-full "
            />
          </div>
        </div>

        <Link to="/videos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Back to videos</Link>

        <button
          type="button"
          onClick={handleProcessVideo}
          className="bg-green-600 text-white px-5 py-3 rounded-lg mr-4"
        >
          Process Video With These Settings
        </button>

        {jobStatus && (
          <div>
            <p>Status: {jobStatus.status}</p>

            {jobStatus.status === "done" && (
              <a
                href={jobStatus.resultUrl}
                download
                className="text-blue-600 underline"
              >
                Download CSV
              </a>

            )}
          </div>
        )}
      </div>
    </div>
  )
}