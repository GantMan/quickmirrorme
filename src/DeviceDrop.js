import React from 'react';

class DeviceDrop extends React.Component {

  render () {
    const devices = this.props.devices
    const optionItems = devices && devices.map((device) =>
      <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
    );

    console.log("I'm told to select", this.props.select)
    return (
      <div>
        <select onChange={(event) => this.props.onChange(event.target.value)} value={this.props.select}>
          <option disabled={!!this.props.select} value={"None"}>Choose a Camera</option>
          {optionItems}
        </select>
      </div>
    )
  }
}

export default DeviceDrop
