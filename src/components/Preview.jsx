import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  getThumbnail,
  submitProcessingJob,
  getJobStatus
} from '../api.js'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

// =====================================================
// PREVIEW COMPONENT
// Main page for viewing a selected video,
// tuning detection settings, processing the video,
// and showing CSV/movement graph results.
// =====================================================
export default function Preview() {
  const { filename } = useParams()

  // =====================================================
  // COMPONENT STATE
  // Stores video information, processing settings,
  // job status, CSV data, and UI state.
  // =====================================================
  const [csvData, setCsvData] = useState([])

  const [thumbnail, setThumbnail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [color, setColor] = useState("#000000")
  const [tolerance, setTolerance] = useState(50)

  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // =====================================================
  // REFS
  // References to the canvas and video elements.
  // =====================================================
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const [imageReady, setImageReady] = useState(false)

  // =====================================================
  // HELPER FUNCTION
  // Converts a hex color (#RRGGBB) into RGB values.
  // =====================================================
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return { r, g, b }
  }

  // =====================================================
  // LOAD VIDEO URL
  // Runs when the selected filename changes.
  // Requests the video URL from the backend.
  // =====================================================
  useEffect(() => {
    getThumbnail(filename)
      .then((url) => {
        setThumbnail(url)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [filename])

  // =====================================================
  // LIVE VIDEO PROCESSING
  // Draws the current video frame onto the canvas,
  // converts it into black and white,
  // finds the largest connected region,
  // and draws the centroid dot.
  // =====================================================
  useEffect(() => {
    if (!imageReady) return

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return
    if (!video.videoWidth || !video.videoHeight) return

    // Copy video size to canvas size.
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame onto canvas.
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Read all pixels from the canvas.
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const px = data.data

    // Convert selected target color into RGB values.
    const targetR = parseInt(color.slice(1, 3), 16)
    const targetG = parseInt(color.slice(3, 5), 16)
    const targetB = parseInt(color.slice(5, 7), 16)

    // =====================================================
    // BINARIZATION ALGORITHM
    // Compare every pixel to the selected color.
    // Matching pixels become black.
    // Non-matching pixels become white.
    // =====================================================
    for (let i = 0; i < px.length; i += 4) {
      const red = px[i]
      const green = px[i + 1]
      const blue = px[i + 2]

      // Euclidean color distance.
      const redDiff = red - targetR
      const greenDiff = green - targetG
      const blueDiff = blue - targetB

      const distance = Math.sqrt(
        redDiff * redDiff +
        greenDiff * greenDiff +
        blueDiff * blueDiff
      )

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

    // Put the edited black-and-white pixels back on canvas.
    ctx.putImageData(data, 0, 0)

    // =====================================================
    // LARGEST CONNECTED REGION DETECTION
    // Finds the largest connected black area,
    // which represents the detected salamander region.
    // =====================================================
    const visited = new Set()
    let largestGroup = []

    function key(x, y) {
      return `${x},${y}`
    }

    function isBlack(x, y) {
      const index = (y * canvas.width + x) * 4
      return px[index] === 0 && px[index + 1] === 0 && px[index + 2] === 0
    }

    // Breadth-first search to collect connected black pixels.
    function bfs(startX, startY) {
      const group = []
      const queue = [[startX, startY]]
      visited.add(key(startX, startY))

      while (queue.length > 0) {
        const [x, y] = queue.shift()
        group.push([x, y])

        const neighbors = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1]
        ]

        for (const [nx, ny] of neighbors) {
          if (
            nx >= 0 &&
            nx < canvas.width &&
            ny >= 0 &&
            ny < canvas.height &&
            !visited.has(key(nx, ny)) &&
            isBlack(nx, ny)
          ) {
            visited.add(key(nx, ny))
            queue.push([nx, ny])
          }
        }
      }

      return group
    }

    // Scan the whole canvas and keep the largest black region.
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (!visited.has(key(x, y)) && isBlack(x, y)) {
          const group = bfs(x, y)

          if (group.length > largestGroup.length) {
            largestGroup = group
          }
        }
      }
    }

    // =====================================================
    // CENTROID DOT
    // Calculates the center of the largest detected region
    // and draws a red dot on the processed preview.
    // =====================================================
    if (largestGroup.length > 0) {
      let sumX = 0
      let sumY = 0

      for (const [x, y] of largestGroup) {
        sumX += x
        sumY += y
      }

      const centroidX = sumX / largestGroup.length
      const centroidY = sumY / largestGroup.length

      ctx.beginPath()
      ctx.arc(centroidX, centroidY, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'red'
      ctx.fill()
    }
  }, [imageReady, color, tolerance])

  // =====================================================
  // JOB STATUS POLLING
  // Checks the backend every 2 seconds until
  // the Java video processing job is done.
  // =====================================================
  useEffect(() => {
    if (!jobId) return

    const interval = setInterval(async () => {
      const status = await getJobStatus(jobId)
      setJobStatus(status)

      if (status.status === "done" && status.resultUrl) {
        await loadCsvData(status.resultUrl)
        clearInterval(interval)
      }

      if (status.status === "error") {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  // =====================================================
  // COLOR PICKER HANDLER
  // Updates selected target color.
  // =====================================================
  function handleColorChange(e) {
    setColor(e.target.value)
    console.log("Color:", e.target.value)
  }

  // =====================================================
  // TOLERANCE SLIDER HANDLER
  // Updates allowed color difference.
  // =====================================================
  function handleToleranceChange(e) {
    setTolerance(Number(e.target.value))
    console.log("Tolerance:", e.target.value)
  }

  // =====================================================
  // PROCESS VIDEO
  // Sends filename, color, and tolerance to the backend.
  // The backend starts the Java centroid finder.
  // =====================================================
  async function handleProcessVideo() {
    try {
      setSubmitting(true)
      setError("")
      setJobStatus(null)
      setCsvData([])

      const job = await submitProcessingJob(filename, color, tolerance)

      setJobId(job.jobId)
      setJobStatus({ status: "processing" })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // =====================================================
  // LOADING STATE
  // Shows while video information is loading.
  // =====================================================
  if (loading) {
    return <p>Loading thumbnail...</p>
  }

  // =====================================================
  // ERROR STATE
  // Shows if video loading or processing fails.
  // =====================================================
  if (error) {
    return (
      <p className="text-red-600 text-xl font-bold">
        Could not load thumbnail: {error}
      </p>
    )
  }

  // =====================================================
  // LOAD CSV DATA
  // Downloads the generated CSV file and converts
  // seconds, x, y rows into JavaScript objects.
  // =====================================================
  async function loadCsvData(resultUrl) {
    const res = await fetch(resultUrl)

    if (!res.ok) {
      throw new Error("Could not load CSV data")
    }

    const text = await res.text()
    const lines = text.trim().split("\n").slice(1)

    const points = lines.map((line) => {
      const [seconds, x, y] = line.split(",")

      return {
        seconds: Number(seconds),
        x: Number(x),
        y: Number(y)
      }
    })

    setCsvData(points)
  }

  // =====================================================
  // MAIN PAGE UI
  // Shows controls, video, processed preview,
  // processing status, CSV download, and graph.
  // =====================================================
  return (
    <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Preview: {filename}
        </h1>

        {/* Tuning controls */}
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
              max="442"
              value={tolerance}
              onChange={handleToleranceChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Video and processed preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Original Video</h2>

            <video
              key={thumbnail}
              ref={videoRef}
              controls
              muted
              preload="auto"
              className="rounded-xl w-full border border-slate-400"
              onLoadedMetadata={() => {
                console.log(
                  "video loaded:",
                  videoRef.current.videoWidth,
                  videoRef.current.videoHeight
                )
                setImageReady(true)
              }}
              onTimeUpdate={() => {
                setImageReady((ready) => !ready)
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
              className="border border-slate-400 rounded-xl w-full"
            />
          </div>
        </div>

        {/* Navigation and process button */}
        <div className="flex gap-4 items-center">
          <Link
            to="/videos"
            className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to videos
          </Link>

          <button
            type="button"
            onClick={handleProcessVideo}
            disabled={submitting}
            className="bg-green-600 text-white px-5 py-3 rounded-lg disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Process Video With These Settings"}
          </button>
        </div>

        {/* Processing results */}
        {jobStatus && (
          <div className="mt-6">
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

            {/* Custom feature: movement graph */}
            {csvData.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">
                  Salamander Movement Graph
                </h2>

                <LineChart
                  width={700}
                  height={350}
                  data={csvData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="seconds" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="x"
                    name="X Position"
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="y"
                    name="Y Position"
                    dot={false}
                  />
                </LineChart>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}