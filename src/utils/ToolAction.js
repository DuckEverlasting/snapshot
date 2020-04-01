import {
  midpoint,
  getQuadLength,
  getGradient,
  convertDestToRegularShape
} from "../utils/helpers";

import {
  updateColor,
  updateSelectionPath,
  updateStagingPosition,
  putHistoryData
} from "../actions/redux/index";

import draw from "../reducers/custom/drawingReducer";
import manipulate from "../reducers/custom/manipulateReducer";
import selection from "../reducers/custom/selectionReducer";

function selectionStart(ev) {
  if (ev.shiftKey) {
    this.addToSelection = true;
    this.layerData.selection
      .getContext("2d")
      .clearRect(0, 0, this.layerData.selection.width, this.layerData.selection.height);
  }
}

class ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData) {
    this.layerData = layerData;
    this.activeLayer = activeLayer;
    this.dispatch = dispatch;
    this.translateData = translateData;
  }

  _moveStaging(layer = this.activeLayer) {
    this.dispatch(updateStagingPosition(layer));
  }

  _clearStaging() {
    this.layerData.staging
      .getContext("2d")
      .clearRect(0, 0, this.layerData.staging.width, this.layerData.staging.height);
  }

  _setLockedAxis(ev) {
    /* 
      Determines which axis should be "locked" in certain functions.
    */
    if (!this.origin) {
      throw new Error("setLockedAxis requires an origin to be stored");
    }

    const [x, y] = [ev.nativeEvent.offsetX + this.translateData.x, ev.nativeEvent.offsetY + this.translateData.y];

    if (this.lockedAxis && !ev.shiftKey) {
      this.lockedAxis = null;
    } else if (!this.lockedAxis && ev.shiftKey) {
      if (Math.abs(this.origin.x - x) < Math.abs(this.origin.y - y)) {
        this.lockedAxis = "x";
      } else {
        this.lockedAxis = "y";
      }
    }
  };

  start() {}

  move() {}

  end() {}
}

export class PencilAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData, params) {
    super(layerData, activeLayer, dispatch, translateData);
    this.isSelectionTool = params.isSelectionTool;
    this.width = params.width;
    this.color = params.color;
    this.clip = params.clip;
  }

  start(ev) {
    this._clearStaging();
    this.origin = {
      x: ev.nativeEvent.offsetX + this.translateData.x,
      y: ev.nativeEvent.offsetY + this.translateData.y
    };
    this.destArray = [this.origin];
    if (this.isSelectionTool) {
      selectionStart(ev);
      this._moveStaging("selection");
    } else {
      this._moveStaging();
    }
  }

  move(ev) {
    this._setLockedAxis(ev);
    let x = ev.nativeEvent.offsetX + this.translateData.x, 
      y = ev.nativeEvent.offsetY + this.translateData.y;
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    }

    this.destArray = [...this.destArray, {x, y}];

    draw(this.layerData.staging.getContext("2d"), {
      action: "drawQuad",
      params: {
        width: this.width,
        strokeColor: this.color,
        orig: this.origin,
        destArray: this.destArray,
        clip: this.clip,
        dashPattern: this.dashPattern,
        clearFirst: true
      }
    });

  }

  end() {
    if (this.isSelectionTool) {
      let path;
      if (this.destArray.length < 2) {
        path = null;
      } else {
        if (this.clip !== null && this.addToSelection) {
          path = new Path2D(this.clip);
        } else {
          path = new Path2D();
        }
        path = selection(path, {
          action: "drawQuadPath",
          params: { orig: this.origin, destArray: this.destArray }
        });
        const selectCtx = this.layerData.selection.getContext("2d");
        this.dispatch(putHistoryData(
          "selection",
          selectCtx,
          () => draw(selectCtx, {
            action: "drawQuadPath",
            params: {
              orig: this.origin,
              destArray: this.destArray,
              width: this.width,
              strokeColor: this.color,
              dashPattern: this.dashPattern,
            }
          })
        ));
      }
      this.dispatch(updateSelectionPath(path));
    } else {
      const activeCtx = this.layerData[this.activeLayer].getContext("2d")
      if (this.destArray.length > 1) {
        this.dispatch(putHistoryData(
          this.activeLayer,
          activeCtx,
          () => draw(activeCtx, {
            action: "drawQuad",
            params: {
              orig: this.origin,
              destArray: this.destArray,
              width: this.width,
              strokeColor: this.color,
              clip: this.clip
            }
          })
        ));
      }
    }
    this._clearStaging();
  }
}

export class BrushAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData, params) {
    super(layerData, activeLayer, dispatch, translateData);
    this.composite = params.composite;
    this.width = params.width;
    this.clip = params.clip;
    this.gradient = getGradient(params.color, params.opacity, params.hardness);
  }

  start(ev) {
    const ctx = this.layerData[this.activeLayer].getContext("2d");
    const viewWidth = Math.ceil(ctx.canvas.width);
    const viewHeight = Math.ceil(ctx.canvas.height);
    this.prevImgData = ctx.getImageData(0, 0, viewWidth, viewHeight);
    this.origin = {
      x: ev.nativeEvent.offsetX + this.translateData.x,
      y: ev.nativeEvent.offsetY + this.translateData.y
    };
    this.lastDest = this.origin;
  }

  move(ev) {
    this._setLockedAxis(ev);
    let x, y;
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    } else {
      [x, y] = [
        ev.nativeEvent.offsetX + this.translateData.x,
        ev.nativeEvent.offsetY + this.translateData.y
      ];
    }

    const newMid = midpoint(this.lastDest, {x, y});

    if (
      getQuadLength(
        this.lastMid || this.origin,
        this.lastDest,
        newMid
      ) <
      this.width * 0.125
    ) {
      return;
    }

    draw(this.layerData[this.activeLayer].getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        destArray: [this.lastMid || this.origin, this.lastDest, newMid],
        gradient: this.gradient,
        width: this.width,
        density: 0.125,
        composite: this.composite
      }
    });
    this.lastDest = {x, y};
    this.lastMid = newMid;
  }

  end() {
    this.dispatch(putHistoryData(
      this.activeLayer,
      this.layerData[this.activeLayer].getContext("2d"),
      null,
      this.prevImgData
    ));
    this.prevImgData = null;
  }
}

export class ShapeAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData, params) {
    super(layerData, activeLayer, dispatch, translateData);
    this.isSelectionTool = params.isSelectionTool;
    this.drawActionType = params.drawActionType;
    this.regularOnShift = params.regularOnShift;
    this.color = params.color;
    this.dashPattern = params.dashPattern;
    this.clip = params.clip;
  }

  start(ev) {
    this._clearStaging();
    this.origin = {
      x: ev.nativeEvent.offsetX + this.translateData.x,
      y: ev.nativeEvent.offsetY + this.translateData.y
    };
    if (this.isSelectionTool) {
      selectionStart(ev);
      this._moveStaging("selection");
    } else {
      this._moveStaging();
    }
  }

  move(ev) {
    this.dest = {
      x: ev.nativeEvent.offsetX + this.translateData.x,
      y: ev.nativeEvent.offsetY + this.translateData.y
    };
    if (this.regularOnShift && ev.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    draw(this.layerData.staging.getContext("2d"), {
      action: this.drawActionType,
      params: {
        orig: this.origin,
        dest: this.dest,
        width: this.width,
        strokeColor: this.color,
        fillColor: this.color,
        dashPattern: this.dashPattern,
        clearFirst: true,
        clip: this.clip
      }
    });
  }

  end() {
    if (this.isSelectionTool) {
      let path;
      if (this.dest) {
        path = null;
      } else {
        if (this.clip !== null && this.addToSelection) {
          path = new Path2D(this.clip);
        } else {
          path = new Path2D();
        }
        path = selection(path, {
          action: this.drawActionType,
          params: { orig: this.origin, dest: this.dest }
        });
        const selectCtx = this.layerData.selection.getContext("2d");
        this.dispatch(putHistoryData(
          "selection",
          selectCtx,
          () => draw(selectCtx, {
            action: this.drawActionType,
            params: {
              orig: this.origin,
              dest: this.dest,
              width: this.width,
              strokeColor: this.color,
              dashPattern: this.dashPattern,
            }
          })
        ));
      }
      this.dispatch(updateSelectionPath(path));
    } else {
      const activeCtx = this.layerData[this.activeLayer].getContext("2d")
      if (this.dest) {
        this.dispatch(putHistoryData(
          this.activeLayer,
          activeCtx,
          () => draw(activeCtx, {
            action: this.drawActionType,
            params: {
              orig: this.origin,
              dest: this.dest,
              width: this.width,
              strokeColor: this.color,
              fillColor: this.color,
              clip: this.clip
            }
          })
        ));
      }
    }
    this._clearStaging();
  }
}

export class EyeDropperAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData, params) {
    super(layerData, activeLayer, dispatch, translateData);
    this.layerOrder = params.layerOrder;
    this.modifier = window.navigator.platform.includes("Mac")
      ? "metaKey"
      : "ctrlKey";
  }

  start(ev) {
    let color;
    for (let i = this.layerOrder.length - 1; i >= 0; i--) {
      const ctx = this.layerData[this.layerOrder[i]].getContext("2d");
      const pixel = ctx.getImageData(ev.nativeEvent.offsetX + this.translateData.x, ev.nativeEvent.offsetY + this.translateData.y, 1, 1);
      const data = pixel.data;
      if (data[3] === 0) {
        continue;
      } else {
        color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        break;
      }
    }
    if (color !== undefined) {
      const palette = ev[this.modifier] ? "secondary" : "primary"
      this.isDrawing = true;
      this.dispatch(updateColor(palette, color))
    };
  }

  move(ev) {
    if (this.isDrawing) {
      this.start(ev);
    }
  }
}

export class MoveAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData) {
    super(layerData, activeLayer, dispatch, translateData);
  }

  start(ev) {
    const ctx = this.layerData[this.activeLayer].getContext("2d");
    const viewWidth = Math.ceil(ctx.canvas.width);
    const viewHeight = Math.ceil(ctx.canvas.height);
    this.prevImgData = ctx.getImageData(0, 0, viewWidth, viewHeight);
    this.origin = {
      x: ev.nativeEvent.offsetX + this.translateData.x,
      y: ev.nativeEvent.offsetY + this.translateData.y
    };
    this.lastDest = this.origin;
  }

  move(ev) {
    if (this.throttle) {return};
    this._setLockedAxis(ev);
    let x, y;
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    } else {
      [x, y] = [
        ev.nativeEvent.offsetX + this.translateData.x,
        ev.nativeEvent.offsetY + this.translateData.y
      ];
    }
    this.throttle = true;
    setTimeout(() => this.throttle = false, 25);
    manipulate(this.layerData[this.activeLayer].getContext("2d"), {
      action: "move",
      params: {
        orig: this.lastDest,
        dest: {x, y}
      }
    });
    this.lastDest = {x, y}
  }

  end() {
    this.dispatch(putHistoryData(
      this.activeLayer,
      this.layerData[this.activeLayer].getContext("2d"),
      null,
      this.prevImgData
    ));
    this.prevImgData = null;
  }
}

export class FillAction extends ToolActionBase {
  constructor(layerData, activeLayer, dispatch, translateData, params) {
    super(layerData, activeLayer, dispatch, translateData);
    this.colorArray = params.colorArray;
    this.tolerance = params.tolerance;
    this.clip = params.clip;
  }

  start(ev) {
    this.dispatch(putHistoryData(
      this.activeLayer,
      this.layerData[this.activeLayer].getContext("2d"),
      () => manipulate(this.layerData[this.activeLayer].getContext("2d"), {
        action: "fill",
        params: {
          orig: {
            x: ev.nativeEvent.offsetX + this.translateData.x,
            y: ev.nativeEvent.offsetY + this.translateData.y
          },
          colorArray: this.colorArray,
          tolerance: this.tolerance,
          clip: this.clip
        }
      })
    ));
  }
}
