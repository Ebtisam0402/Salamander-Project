import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import HomePage from './components/HomePage'
import Processing from "./components/Processing"
import Search from "./components/Search"

import "./App.css"

export default function App() {
  return(
    
    <div className="app">
      <Header />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/search" element={<Search />} />
      </Routes>
      

    </div>
    
  )
}