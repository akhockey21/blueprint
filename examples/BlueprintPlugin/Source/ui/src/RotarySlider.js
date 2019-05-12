import { Colors } from './Constants';
import React, { Component } from 'react';
import { View, Image, Text } from './Blueprint';


class RotarySlider extends Component {
  constructor(props) {
    super(props);

    this._onMeasure = this._onMeasure.bind(this);
    this._onMouseDrag = this._onMouseDrag.bind(this);
    this._renderVectorGraphics = this._renderVectorGraphics.bind(this);

    this.state = {
      width: 0,
      height: 0,
      value: 0.0,
    };
  }

  _onMeasure(width, height) {
    this.setState({
      width: width,
      height: height,
    });
  }

  _onMouseDrag(mouseX, mouseY, mouseDownX, mouseDownY) {
    // Component vectors
    let dx = mouseX - mouseDownX;
    let dy = mouseDownY - mouseY;

    // Delta
    let dm = dx + dy;
    let sensitivity = (1.0 / 400.0);
    // TODO: This might be a little funky because the state value could update
    // in between successive calls to this method, in which case this calculation
    // might get nudged around weirdly. Should probably hold onto the value state
    // at the time the drag started?
    let value = Math.max(0.0, Math.min(1.0, this.state.value + dm * sensitivity));

    // TODO: This "NativeMethods" interface is just a proxy to __BlueprintNative__
    // to check that you've actually registered it before pushing the call.
    // NativeMethods.setParameterValueNotifyingHost(this.props.paramId, value);
    if (typeof this.props.paramId === 'string' && this.props.paramId.length > 0) {
      __BlueprintNative__.setParameterValueNotifyingHost(this.props.paramId, value);
    }

    this.setState({
      value: value,
    });
  }

  _renderVectorGraphics(value, width, height) {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * 0.5;
    const strokeWidth = 2.0;

    // Animate the arc by stroke-dasharray, where the length of the dash is
    // related to the value property and the length of the space takes up the
    // rest of the circle.
    const arcCircumference = 1.5 * Math.PI * radius;
    const dashArray = [value * arcCircumference, 2.0 * Math.PI * radius];

    // Note that we nudge the radius by half the stroke width; this is because
    // the stroke will extend outwards in both directions from the given coordinates,
    // which gets clipped if we try to draw the circle perfectly on the edge of the
    // image. We nudge it in so that no part of the path gets clipped.
    return `
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="${cx}"
          cy="${cy}"
          r="${radius - (strokeWidth / 2)}"
          stroke="#66FDCF"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${dashArray.join(',')}"
          fill="none" />
      </svg>
    `;
  }

  render() {
    const {value, width, height} = this.state;

    return (
      <View {...this.props} onMeasure={this._onMeasure} onMouseDrag={this._onMouseDrag}>
        <Image {...styles.canvas} source={this._renderVectorGraphics(value, width, height)} />
        {this.props.children}
      </View>
    );
  }

}

const styles = {
  canvas: {
    'flex': 1.0,
    'height': '100%',
    'width': '100%',
    'position': 'absolute',
    'left': 0.0,
    'top': 0.0,
    'interceptClickEvents': false,
    'transform-rotate': Math.PI * 1.25,
  },
};

export default RotarySlider;
