import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'

function fakeStream(deviceId = 'front') {
  const track = { stop: vi.fn(), getSettings: () => ({ deviceId }) }
  return { getTracks: () => [track], getVideoTracks: () => [track] }
}

function mockMedia(getUserMedia) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia,
      enumerateDevices: vi.fn().mockResolvedValue([
        { kind: 'videoinput', deviceId: 'front', label: 'FaceTime HD Camera' },
        { kind: 'videoinput', deviceId: 'usb', label: 'USB Webcam' },
        { kind: 'audioinput', deviceId: 'mic', label: 'Mic' },
      ]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  })
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

test('starts the selfie camera and lists video inputs', async () => {
  const getUserMedia = vi.fn().mockResolvedValue(fakeStream())
  mockMedia(getUserMedia)
  render(<App />)

  expect(await screen.findByRole('option', { name: 'USB Webcam' })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: 'Mic' })).not.toBeInTheDocument()
  expect(getUserMedia).toHaveBeenCalledWith({
    audio: false,
    video: expect.objectContaining({ facingMode: 'user' }),
  })
  expect(screen.getByLabelText('Camera')).toHaveValue('front')
})

test('toggles mirroring and remembers it', async () => {
  mockMedia(vi.fn().mockResolvedValue(fakeStream()))
  render(<App />)

  const button = screen.getByRole('button', { name: 'Mirrored' })
  expect(button).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(button)
  expect(screen.getByRole('button', { name: 'Unmirrored' })).toHaveAttribute('aria-pressed', 'false')
  expect(localStorage.getItem('mirrored')).toBe('false')
})

test('explains a blocked camera and can retry', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const denied = Object.assign(new Error('denied'), { name: 'NotAllowedError' })
  const getUserMedia = vi.fn().mockRejectedValueOnce(denied).mockResolvedValue(fakeStream())
  mockMedia(getUserMedia)
  render(<App />)

  expect(await screen.findByRole('alert')).toHaveTextContent(/camera access is blocked/i)
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByRole('option', { name: 'USB Webcam' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('falls back to the default camera when the saved one is gone', async () => {
  localStorage.setItem('currentDevice', 'unplugged')
  const missing = Object.assign(new Error('gone'), { name: 'OverconstrainedError' })
  const getUserMedia = vi.fn().mockRejectedValueOnce(missing).mockResolvedValue(fakeStream())
  mockMedia(getUserMedia)
  render(<App />)

  expect(await screen.findByRole('option', { name: 'USB Webcam' })).toBeInTheDocument()
  expect(getUserMedia).toHaveBeenLastCalledWith({
    audio: false,
    video: expect.objectContaining({ facingMode: 'user' }),
  })
  expect(localStorage.getItem('currentDevice')).toBeNull()
})
