export default function HomePage() {
  const videos = [1, 2, 3, 4, 5, 6]

  return (
    <main className="video-grid">
      {videos.map((video) => (
        <div className="video-card" key={video}>
          <div className="video-line"></div>
          <p>Video Title</p>

          <div className="card-buttons">
            <button>Preview</button>
            <button>Playback</button>
          </div>
        </div>
      ))}
    </main>
  )
}