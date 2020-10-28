import './App.css';
import {useEffect, useRef} from 'react'

function App() {
  const mirror = useRef(null)

  async function setupVideo() {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const videoConstraints = {
      width: { ideal: maxWidth, max: maxWidth},
      height: { ideal: maxHeight, max: maxHeight},
      facingMode: 'environment' // rear facing if possible
    }

    const video = mirror.current
    video.width = maxWidth
    video.height = maxHeight

    try {
      const vidStream = await navigator.mediaDevices.getUserMedia({audio: false, video: videoConstraints})

      const videoInputs = vidStream.getVideoTracks()
      console.log(`YO the video device I am seeing is ${videoInputs[0].label}`)

      if ('srcObject' in video) {
        video.srcObject = vidStream
      } else {
        video.src = window.URL.createObjectURL(vidStream)
      }

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    setupVideo()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          QuickMirror
        </p>
      </header>
      <main>
        <video ref={mirror} id="mirror" autoPlay />
      </main>
    </div>
  );
}

export default App;
