// export default function Processing() {
//   return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
//       <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
//         <h1 className="text-4xl font-bold text-blue-700 mb-4">Preview Processing Page</h1>
//         <p className="text-lg text-slate-600 mb-6">This page will show video processing details.</p>
//         <div className="bg-slate-200 rounded-xl h-64 flex items-center justify-center">
//           <p className="text-slate-500 text-lg">
//             Processing preview placeholder
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

export default function Processing() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">
          Video Processing Overview
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          This application tracks salamander movement by detecting a selected
          color, identifying the largest connected region, calculating its
          centroid, and exporting the results to a CSV file.
        </p>

        <div className="bg-slate-100 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Processing Workflow
          </h2>

          <ol className="list-decimal list-inside space-y-3 text-slate-700">
            <li>Select a video from the Videos page.</li>
            <li>Choose a target color using the color picker.</li>
            <li>Adjust the tolerance slider to tune detection.</li>
            <li>Preview the binarized image in real time.</li>
            <li>Locate the largest connected region.</li>
            <li>Display the centroid with a red marker.</li>
            <li>Submit the processing job.</li>
            <li>Download the generated CSV file.</li>
            <li>View a movement graph based on the CSV data.</li>
          </ol>
        </div>

        <div className="bg-slate-100 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            CSV Output
          </h2>

          <p className="mb-3 text-slate-700">
            Each row contains the time and centroid position of the salamander.
          </p>

          <pre className="bg-white p-4 rounded-lg overflow-auto">
{`seconds,x,y
0.0,190,430
1.0,210,420
2.0,195,428`}
          </pre>
        </div>

        <div className="bg-slate-100 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Features Implemented
          </h2>

          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>Live video preview</li>
            <li>Color selection and tolerance tuning</li>
            <li>Real-time binarization</li>
            <li>Largest connected region detection</li>
            <li>Centroid visualization</li>
            <li>Background job processing</li>
            <li>CSV export</li>
            <li>Movement graph visualization</li>
          </ul>
        </div>
      </div>
    </div>
  )
}