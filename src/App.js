import './App.css';
import {useEffect, useRef, useState} from 'react'
import DeviceDrop from './DeviceDrop'

function App() {
  const mirror = useRef(null)
  const [stream, setStream] = useState()
  const [devices, setDevices] = useState()
  const [currentDevice, setCurrentDevice] = useState(localStorage.getItem("currentDevice"))
  const [mirrored, setMirrored] = useState(true)

  async function setupVideo(useDevice) {
    console.log('Setting up with ', currentDevice)
    listMediaDevices()
    const maxWidth = window.innerWidth - 18; // subtract scrollbar
    const maxHeight = window.innerHeight;
    const deviceId = useDevice ? { exact: useDevice } : null

    const videoConstraints = {
      deviceId,
      width: { ideal: maxWidth, max: maxWidth},
      height: { ideal: maxHeight, max: maxHeight},
      facingMode: 'environment' // rear facing if possible options === user, environment, left and right
    }

    const video = mirror.current
    video.width = maxWidth
    video.height = maxHeight

    try {
      const vidStream = await navigator.mediaDevices.getUserMedia({audio: false, video: videoConstraints})
      setStream(vidStream) // store for cleanup

      const videoInputs = vidStream.getVideoTracks()
      console.log(`YO the video device I am seeing is ${videoInputs[0].label}`)

      if ('srcObject' in video) {
        video.srcObject = vidStream
      } else {
        video.src = window.URL.createObjectURL(vidStream)
      }

    } catch (e) {
      localStorage.clear()
      alert("Something went wrong for this device!  Please change browsers, try again, or contribute to the site's open source!")
      console.log(e)
    }
  }

  function killVideo() {
    stream && stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  async function listMediaDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter((dev) => dev.kind === "videoinput")
    setDevices(videoDevices)
  }

  async function changeDevice(dd) {
    setCurrentDevice(dd)
    // store for next time
    localStorage.setItem('currentDevice', dd);
    killVideo()
    setupVideo(dd)
  }

  useEffect(() => {
    setupVideo(currentDevice)
    // cleanup is returned
    return killVideo
  }, [])

  return (
    <div className="App">
      <main>
        <video ref={mirror} id="mirror" className={mirrored ? "mirrored" : ""} autoPlay />
      </main>
      <div className="App-footer">
        <p>
          By <a href="https://gantlaborde.com">Gant</a> &amp; <a href="https://infinite.red/">Infinite Red</a>
        </p>
        <button onClick={() => setMirrored(m => !m)}>{mirrored ? "Mirrored" : "Unmirrored"}</button>
        <DeviceDrop select={currentDevice} devices={devices} onChange={changeDevice} />
      </div>
    </div>
  );
}

export default App;
