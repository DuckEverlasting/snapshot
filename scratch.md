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