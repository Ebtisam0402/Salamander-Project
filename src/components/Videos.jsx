
import { useEffect, useState } from "react"
import { getVideos } from "../mockApi.js"
//import { data } from "react-router-dom"



export default function Videos() {
    const [videos, setVideos] = useState([]);
 useEffect(() => {
  getVideos().then((data) => setVideos(data))
   //console.log("getVideos returned:", data)
  
 }, [])
 return (
  <div>
   <h1>Available Videos</h1>
     <ul>
        {videos.map((filename) => (
          <li key={filename}>{filename}</li>
        ))}
      </ul>

   
  </div>
 )
}


