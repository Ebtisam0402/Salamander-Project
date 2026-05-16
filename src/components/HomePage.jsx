export default function HomePage() {
  //const videos = [1, 2]

  return (

    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-4">Salamander Tracker</h1>
      <p className="text-xl text-slate-700 max-w-2xl mb-8">Pick a video from the Videos page to start analyzing.</p>
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full">

        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Welcome
        </h2>

        <p className="text-slate-600 leading-relaxed">
          This project allows you to preview videos, process salamander tracking,
          and explore analysis results using a simple React interface.
        </p>

      </div>

    </div>
    // <main className="video-grid">
    //   {videos.map((video) => (
    //     <div className="video-card" key={video}>
    //       <div className="video-line"></div>
    //       <p>Video Title</p>

    //       <div className="card-buttons">
    //         <button>Preview</button>
    //         <button>Playback</button>
    //       </div>
    //     </div>
    //   ))}
    // </main>
  )
}