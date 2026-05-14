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


    <div>

      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/videos">Videos</Link>
        {' | '}
        <Link to="/processing">Processing</Link>
      </nav>

    </div>
  )
}