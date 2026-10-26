export default function DeviceDrop({ select, devices, onChange }) {
  return (
    <label className="device-drop">
      <span className="visually-hidden">Camera</span>
      <select onChange={(event) => onChange(event.target.value)} value={select || ''}>
        <option disabled value="">
          Choose a camera
        </option>
        {devices.map((device, i) => (
          <option key={device.deviceId || i} value={device.deviceId}>
            {device.label || `Camera ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  )
}
