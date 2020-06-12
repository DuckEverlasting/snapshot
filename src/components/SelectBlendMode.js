import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { updateLayerBlendMode } from "../actions/redux";

import render from "../actions/redux/renderCanvas";

export default function SelectBlendMode() {
  const activeLayer = useSelector(state => state.main.present.activeLayer);
  const layerSettings = useSelector(state => state.main.present.layerSettings);

  const dispatch = useDispatch();

  const handleChange = ev => {
    dispatch(updateLayerBlendMode(activeLayer, ev.target.value));
    dispatch(render())
  }
  return (
    <select disabled={!activeLayer} value={activeLayer ? layerSettings[activeLayer].blend : "null-value"} onChange={handleChange}>
      {
        !activeLayer && <option value="null-value"></option>
      }
      <option value="source-over">Normal</option>
      <option value="source-in">source-in</option>
      <option value="source-out">source-out</option>
      <option value="source-atop">source-atop</option>
      <option value="destination-over">destination-over</option>
      <option value="destination-in">destination-in</option>
      <option value="destination-out">destination-out</option>
      <option value="destination-atop">destination-atop</option>
      <option value="lighter">lighter</option>
      <option value="xor">xor</option>
      <option value="multiply">multiply</option>
      <option value="screen">screen</option>
      <option value="overlay">overlay</option>
      <option value="darken">darken</option>
      <option value="lighten">lighten</option>
      <option value="color-dodge">color-dodge</option>
      <option value="color-burn">color-burn</option>
      <option value="hard-light">hard-light</option>
      <option value="soft-light">soft-light</option>
      <option value="difference">difference</option>
      <option value="exclusion">exclusion</option>
      <option value="hue">hue</option>
      <option value="saturation">saturation</option>
      <option value="color">color</option>
      <option value="luminosity">luminosity</option>
    </select>
  )
}
