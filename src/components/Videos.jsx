
import { useEffect } from "react"
import { getVideos } from "../mockApi.js"
//import { data } from "react-router-dom"



export default function Videos() {
 useEffect(() => {
  getVideos().then((data) => {
   console.log("getVideos returned:", data)
  }, [])
 })
 return (
  <div>
   <h1>Available Videos</h1>
   <p>Video list will go here.</p>
  </div>
 )
}


