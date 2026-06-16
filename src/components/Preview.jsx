import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  getThumbnail,
  submitProcessingJob,
  getJobStatus
} from '../api.js'

export default function Preview() {
  const { filename } = useParams()

  const [csvData, setCsvData] = useState([])

  const [thumbnail, setThumbnail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [color, setColor] = useState("#000000")
  const [tolerance, setTolerance] = useState(50)

  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const canvasRef = useRef(null)
  const videoRef = useRef(null)
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
        setError(err.message)
        setLoading(false)
      })
  }, [filename])

  useEffect(() => {
    if (!imageReady) return

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return
    if (!video.videoWidth || !video.videoHeight) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const px = data.data



    const targetR = parseInt(color.slice(1, 3), 16)
    const targetG = parseInt(color.slice(3, 5), 16)
    const targetB = parseInt(color.slice(5, 7), 16)

    // let sumX = 0
    // let sumY = 0
    // let count = 0

    for (let i = 0; i < px.length; i += 4) {
      // const pixelIndex = i / 4
      // const x = pixelIndex % canvas.width
      // const y = Math.floor(pixelIndex / canvas.width)

      const red = px[i]
      const green = px[i + 1]
      const blue = px[i + 2]

      // const redDiff = Math.abs(red - targetR)
      // const greenDiff = Math.abs(green - targetG)
      // const blueDiff = Math.abs(blue - targetB)

      // const distance = redDiff + greenDiff + blueDiff

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

        // sumX += x
        // sumY += y
        // count++
      } else {
        px[i] = 255
        px[i + 1] = 255
        px[i + 2] = 255
      }
    }

    ctx.putImageData(data, 0, 0)

    // After binarizing pixels, find largest connected black region
    const visited = new Set()
    let largestGroup = []

    function key(x, y) {
      return `${x},${y}`
    }

    function isBlack(x, y) {
      const index = (y * canvas.width + x) * 4
      return px[index] === 0 && px[index + 1] === 0 && px[index + 2] === 0
    }

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

    // if (count > 0) {
    //   const centroidX = sumX / count
    //   const centroidY = sumY / count

    //   ctx.beginPath()
    //   ctx.arc(centroidX, centroidY, 8, 0, Math.PI * 2)
    //   ctx.fillStyle = 'red'
    //   ctx.fill()
    // }
  }, [imageReady, color, tolerance])

  useEffect(() => {
    if (!jobId) return

    const interval = setInterval(async () => {
      const status = await getJobStatus(jobId)
      setJobStatus(status)


      if (status.status == "done" && status.resultUrl) {
        loadCsvData(status.resultUrl)
      }
      if (status.status === "done" || status.status === "error") {
        clearInterval(interval)
      }

    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  function handleColorChange(e) {
    setColor(e.target.value)
    console.log("Color:", e.target.value)
  }

  function handleToleranceChange(e) {
    setTolerance(Number(e.target.value))
    console.log("Tolerance:", e.target.value)
  }

  async function handleProcessVideo() {
    try {
      setSubmitting(true)
      setError("")
      setJobStatus(null)
      const job = await submitProcessingJob(filename, color, tolerance)

      setJobId(job.jobId)
      setJobStatus({ status: "processing" })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p>Loading thumbnail...</p>
  }

  if (error) {
    return (
      <p className="text-red-600 text-xl font-bold">
        Could not load thumbnail: {error}
      </p>
    )
  }

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

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Preview: {filename}
        </h1>

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
              max="442"
              value={tolerance}
              onChange={handleToleranceChange}
              className="w-full"
            />
          </div>
        </div>

        {/* <img
          className="rounded-xl mb-6 w-full border border-slate-400"
          src={thumbnail}
          alt={`Thumbnail for ${filename}`}
        /> */}



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
            // className="bg-green-600 text-white px-5 py-3 rounded-lg"
            className="bg-green-600 text-white px-5 py-3 rounded-lg disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Process Video With These Settings"}
          </button>
        </div>

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
          </div>
        )}
      </div>
    </div>
  )
}