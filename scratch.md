PLANS
- restructure input?
  - keep input info in one place, maybe set up a reducer to perform specific actions depending on focus / other variables.
  - have something on state that marks when modifier keys are held down (same with mouse clicks?)


        if (source) {
        state.layerData[source].ctx.save()
        if (state.selectionPath) {
          state.layerData[source].ctx.clip(state.selectionPath)
        }
        newLayerData.ctx.drawImage(state.layerData[source].ctx.canvas, 0, 0)
        state.layerData[source].ctx.restore()
      }


Class Tool
- properties:
    name
    cursor
    drawsTo (selection, active, staging, null)
    onStart(ev, ctx, state)
    start(ev, ctx, state)
    onMove(ev, ctx, state, settings)
    move(ev, ctx, state, settings)
    onEnd(ev, ctx, state, settings)
    end(ev, ctx, state, settings)

start {
  if this.drawsTo === "staging" {
    ctx.clear
  }

  let [x, y] = [
      ev.nativeEvent.offsetX,
      ev.nativeEvent.offsetY
    ];
  let viewWidth, viewHeight;
  state = {
    ...state,
    mouseDown: true,
    origin: [x, y],
    destArray: [],
    lastMid: null,
    heldShift: ev.shiftKey,
  };
  onStart()
}

move {
  let [x, y] = [
    ev.nativeEvent.offsetX,
    ev.nativeEvent.offsetY
  ];
  let params = {
    orig: state.origin,
    dest: [x, y],
    destArray: [[x, y]],
    width: width,
    strokeColor: color,
    fillColor: color,
    clip: selectionPath,
    ignoreHistory: true
  };

  if (state.lockedAxis && !ev.shiftKey) {
    state = { ...state, lockedAxis: "" };
  }

  if (!state.lockedAxis && ev.shiftKey) {
    setLockedAxis(x, y);
  }

  onMove()
}

end {
  state = {
    ...state,
    mouseDown: false,
    hold: true,
    interrupt: false
  };

  const [x, y] = [
    ev.nativeEvent.offsetX,
    ev.nativeEvent.offsetY
  ];

  let params = {
    orig: state.origin,
    dest: [x, y],
    destArray: [[x, y]],
    width: width,
    strokeColor: color,
    fillColor: color,
    clip: selectionPath
  };

  onEnd()

  state = {
    ...state,
    hold: false,
    tool: null,
    lockedAxis: ""
  };
  layerData.staging
    .getContext("2d")
    .clearRect(0, 0, layerData.staging.width, layerData.staging.height);
}