import { Link } from "react-router-dom"

export default function Header() {
  return (
    // <header className="header">
    //   <button>Salamander Tracker</button>

    //   <Link to="/">
    //     <button>Home</button>
    //   </Link>

    //   <Link to="/processing">
    //     <button>Preview Processing</button>
    //   </Link>

    //   <Link to="/search">
    //     <button>Search</button>
    //   </Link>
    // </header>
    <header className="bg-slate-800 text-white shadow-md">

      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">
          Salamander Tracker
        </h1>
        <nav className="flex gap-6 text-lg">
          <Link to="/" className="hover:text-yellow-300 transition-colors">Home</Link>
          {' | '}
          <Link to="/videos" className="hover:text-yellow-300 transition-colors">Videos</Link>
          {' | '}
          <Link to="/processing" className="hover:text-yellow-300 transition-colors">Processing Overview</Link>
        </nav>

      </div>
    </header>
  )
}