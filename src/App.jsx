import { useCallback, useEffect, useRef, useState } from 'react'
import DeviceDrop from './DeviceDrop'
import './App.css'

const DEVICE_KEY = 'currentDevice'
const MIRROR_KEY = 'mirrored'

// localStorage can throw in private windows or when storage is blocked
function readStore(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function describeError(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access is blocked. Allow the camera for quickmirror.me in your browser settings (usually the camera icon in the address bar), then try again.'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return "We couldn't find a camera. Plug one in or turn it on, then try again."
    case 'NotReadableError':
    case 'AbortError':
      return 'Your camera is busy. Close other apps using it (Zoom, Teams, FaceTime…) and try again.'
    case 'NotSupportedError':
      return "This browser can't use a camera here. Try the latest Chrome, Safari, Firefox, or Edge."
    default:
      return 'Something went wrong starting your camera. Try again or switch browsers.'
  }
}

export default function App() {
  const video = useRef(null)
  const stage = useRef(null)
  const stream = useRef(null)
  const request = useRef(0)
  const [devices, setDevices] = useState([])
  const [currentDevice, setCurrentDevice] = useState(() => readStore(DEVICE_KEY) || '')
  const [mirrored, setMirrored] = useState(() => readStore(MIRROR_KEY) !== 'false')
  const [status, setStatus] = useState('starting')
  const [error, setError] = useState('')

  const stopVideo = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }, [])

  const listDevices = useCallback(async () => {
    const all = await navigator.mediaDevices.enumerateDevices()
    setDevices(all.filter((device) => device.kind === 'videoinput'))
  }, [])

  const startVideo = useCallback(
    async (deviceId) => {
      const thisRequest = ++request.current
      stopVideo()
      setStatus('starting')

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(describeError({ name: 'NotSupportedError' }))
        setStatus('error')
        return
      }

      const constraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // Without a saved camera, ask for the selfie camera on phones
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
      }

      try {
        const vidStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints })
        // A newer request (or unmount) won the race, so drop this stream
        if (thisRequest !== request.current) {
          vidStream.getTracks().forEach((track) => track.stop())
          return
        }
        stream.current = vidStream
        video.current.srcObject = vidStream
        const activeId = vidStream.getVideoTracks()[0]?.getSettings?.().deviceId
        if (activeId) setCurrentDevice(activeId)
        setStatus('live')
        // Camera labels are only available after permission is granted
        listDevices()
      } catch (e) {
        if (thisRequest !== request.current) return
        // A remembered camera that's gone shouldn't block the default one
        if (deviceId && (e.name === 'OverconstrainedError' || e.name === 'NotFoundError')) {
          writeStore(DEVICE_KEY, '')
          setCurrentDevice('')
          startVideo('')
          return
        }
        console.error(e)
        setError(describeError(e))
        setStatus('error')
      }
    },
    [listDevices, stopVideo]
  )

  function changeDevice(deviceId) {
    setCurrentDevice(deviceId)
    writeStore(DEVICE_KEY, deviceId)
    startVideo(deviceId)
  }

  function toggleMirror() {
    setMirrored((m) => {
      writeStore(MIRROR_KEY, String(!m))
      return !m
    })
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else stage.current.requestFullscreen()
  }

  useEffect(() => {
    startVideo(readStore(DEVICE_KEY) || '')
    const mediaDevices = navigator.mediaDevices
    mediaDevices?.addEventListener?.('devicechange', listDevices)
    return () => {
      request.current++
      mediaDevices?.removeEventListener?.('devicechange', listDevices)
      stopVideo()
    }
  }, [startVideo, listDevices, stopVideo])

  return (
    <section className="stage" ref={stage} aria-label="Webcam mirror">
      <video
        ref={video}
        id="mirror"
        className={mirrored ? 'mirrored' : ''}
        autoPlay
        playsInline
        muted
        aria-label="Live view from your camera"
      />

      {status !== 'live' && (
        <div className="notice" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'starting' ? (
            <p>Starting your camera… allow access when your browser asks.</p>
          ) : (
            <>
              <p>{error}</p>
              <button type="button" onClick={() => startVideo(currentDevice)}>
                Try again
              </button>
            </>
          )}
        </div>
      )}

      <a className="maker" href="https://gantlaborde.com" title="Made by Gant Laborde">
        <img src="/gant.webp" width="111" height="144" alt="Gant Laborde" />
      </a>

      <div className="controls">
        <button type="button" aria-pressed={mirrored} onClick={toggleMirror}>
          {mirrored ? 'Mirrored' : 'Unmirrored'}
        </button>
        <DeviceDrop select={currentDevice} devices={devices} onChange={changeDevice} />
        {document.fullscreenEnabled && (
          <button type="button" className="icon" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        <a className="about-link icon" href="#about" aria-label="About QuickMirror" title="About QuickMirror">
          ?
        </a>
      </div>
    </section>
  )
}
