import {
  midpoint,
  getQuadLength,
  getGradient,
  convertDestToRegularShape
} from "../utils/helpers";

import getImageRect from "../utils/getImageRect";

import {
  updateColor,
  updateSelectionPath,
  updateStagingPosition,
  updateLayerPosition,
  setStampData,
  putHistoryData,
  setCropIsActive
} from "../actions/redux/index";

import draw from "../reducers/custom/drawingReducer";
import manipulate from "../reducers/custom/manipulateReducer";
import selection from "../reducers/custom/selectionReducer";

import render from "../actions/redux/renderCanvas";

class ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData) {
    this.targetLayer = targetLayer;
    this.layerCanvas = layerCanvas;
    this.dispatch = dispatch;
    this.translateData = translateData;

    this.usesStaging = true;

    /* By default, actions render after 
    mouse mousemove and after mouseup.*/
    this.renderOnStart = false;
    this.renderOnMove = true;
    this.renderOnEnd = true;
  }

  _moveStaging(layer = this.targetLayer) {
    this.dispatch(updateStagingPosition(layer));
  }

  _clearStaging() {
    this.layerCanvas.staging
      .getContext("2d")
      .clearRect(0, 0, this.layerCanvas.staging.width, this.layerCanvas.staging.height);
  }

  _selectionStart(ev) {
    if (ev.shiftKey) {
      this.addToSelection = true;
    } else {
      this.layerCanvas.selection
        .getContext("2d")
        .clearRect(0, 0, this.layerCanvas.selection.width, this.layerCanvas.selection.height);
    }
  }

  _getCoordinates(ev, params={}) {
    let x = (ev.nativeEvent.offsetX + this.translateData.x) / this.translateData.zoom - this.translateData.offX,
      y = (ev.nativeEvent.offsetY + this.translateData.y) / this.translateData.zoom - this.translateData.offY;
    if (params.autoCrop) {
      x = Math.min(Math.max(x, 0), this.translateData.documentWidth - 1);
      y = Math.min(Math.max(y, 0), this.translateData.documentHeight - 1); 
    }
    return { x, y };
  }

  _setLockedAxis(ev) {
    /* 
      Determines which axis should be "locked" in certain functions.
    */
    if (!this.origin) {
      throw new Error("setLockedAxis requires an origin to be stored");
    }

    const { x, y } = this._getCoordinates(ev)
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

  start(...args) {
    this.onStart(...args);

    if (this.usesStaging) {
      this._moveStaging();
    }

    if (this.renderOnStart) {
      this.dispatch(render());
    };
  }

  onStart() {}

  move(...args) {
    this.onMove(...args);

    if (this.renderOnMove) {
      this.dispatch(render());
    };
  }

  onMove() {}

  end(...args) {

    this.onEnd(...args);
    
    if (this.usesStaging) {
      this._clearStaging();
    }

    if (this.renderOnEnd) {
      this.dispatch(render());
    };
  }

  onEnd() {}
}

export class FreeDrawAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.lastEndpoint = params.lastEndpoint;
    this.setLastEndpoint = params.setLastEndpoint;
    this.renderOnStart = true;
    this.isSelectionTool = targetLayer === "selection";
  }

  start(ev, ...args) {
    if (this.usesStaging) {
      this._moveStaging();
    }

    this.origin = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});

    this.coords = this.origin;

    this.onStart(ev, ...args);

    if (this.renderOnStart) {
      this.dispatch(render());
    }
  }

  move(ev, ...args) {
    this._setLockedAxis(ev);
    let {x, y} = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    }
    this.coords = {x, y}

    this.onMove(ev, ...args);

    if (this.renderOnMove) {
      this.dispatch(render())
    };
  }

  end(...args) {

    this.onEnd(...args);
    
    if (this.setLastEndpoint) {
      this.setLastEndpoint(this.coords);
    }

    if (this.usesStaging) {
      this._clearStaging();
    }

    if (this.renderOnEnd) {
      this.dispatch(render());
    };
  }
}

export class PencilAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.color = params.color;
    this.clip = params.clip;
  }

  onStart(ev) {
    if (this.isSelectionTool) {
      this._selectionStart(ev);
    }
    if (this.lastEndpoint && ev.shiftKey && this.targetLayer !== "selection") {
      this.destArray = [this.lastEndpoint, this.origin];
    } else {
      this.destArray = [this.origin];
    }
  }

  onMove() {
    this.destArray = [...this.destArray, this.coords];

    if (this.isSelectionTool) {
      const params = {
        destArray: this.destArray,
        orig: this.origin,
        width: 1,
        strokeColor: "rgba(0, 0, 0, 1)",
        dashPattern: [7, 7],
        clearFirst: true
      }
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: "drawQuad",
        params
      });
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: "drawQuad",
        params: {...params, dashOffset: 7}
      });
    } else {
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: "drawQuad",
        params: {
          destArray: this.destArray,
          orig: this.destArray[0],
          width: this.width,
          strokeColor: this.color,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY},
          clearFirst: true
        }
      });
    }
  }

  onEnd() {
    if (this.isSelectionTool) {
      if (this.destArray.length < 2) {
        return this.dispatch(updateSelectionPath(null));
      }
      
      let path;
      if (this.clip !== null && this.addToSelection) {
        path = new Path2D(this.clip);
      } else {
        path = new Path2D();
      }
      path = selection(path, {
        action: "drawQuadPath",
        params: { orig: this.destArray[0], destArray: this.destArray }
      });
      this.dispatch(updateSelectionPath(path));
    } else {
      const activeCtx = this.layerCanvas[this.targetLayer].getContext("2d")
      if (this.destArray.length > 1) {
        this.dispatch(putHistoryData(
          this.targetLayer,
          activeCtx,
          () => draw(activeCtx, {
            action: "drawQuad",
            params: {
              orig: this.destArray[0],
              destArray: this.destArray,
              width: this.width,
              strokeColor: this.color,
              clip: this.clip,
              clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
            }
          })
        ));
      }
    }
  }
}

export class BrushAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.opacity = params.opacity;
    this.hardness = params.hardness;
    this.clip = params.clip;
    this.gradient = getGradient(params.color, params.hardness);
    this.processing = document.createElement('canvas');
  }

  onStart(ev) {
    this.processing.width = this.layerCanvas.staging.width;
    this.processing.height = this.layerCanvas.staging.height;
    this.processing.getContext("2d").imageSmoothingEnabled = false;
    if (this.lastEndpoint && ev.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          gradient: this.gradient,
          width: this.width,
          hardness: this.hardness,
          density: 0.25,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
      manipulate(this.layerCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.processing.getContext("2d"),
          globalAlpha: this.opacity / 100,
          clearFirst: true
        },
      });
    }
    this.lastDest = this.origin;
  }

  onMove() {
    const newMid = midpoint(this.lastDest, this.coords);

    if (
      getQuadLength(
        this.lastMid || this.lastDest,
        this.lastDest,
        newMid
      ) <
      this.width * 0.25
    ) {
      return;
    }

    draw(this.processing.getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        orig: this.lastMid || this.lastDest,
        destArray: [this.lastMid || this.lastDest, this.lastDest, newMid],
        gradient: this.gradient,
        width: this.width,
        hardness: this.hardness,
        density: 0.25,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.layerCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        globalAlpha: this.opacity / 100,
        clearFirst: true
      },
    });
    this.lastDest = this.coords;
    this.lastMid = newMid;
  }

  onEnd() {
    this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.layerCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
  }
}

export class FilterBrushAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.filter = params.filter;
    this.filterInput = params.filterInput;
    this.hardness = params.hardness;
    this.clip = params.clip;
    this.gradient = getGradient("rgba(0, 0, 0, 1)", params.hardness);
    this.processing = document.createElement('canvas');
    this.filtered = document.createElement('canvas');
  }

  onStart(ev) {
    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    this.processing.width = ctx.canvas.width;
    this.processing.height = ctx.canvas.height;
    this.filtered.width = ctx.canvas.width;
    this.filtered.height = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.filter(imageData.data, this.filterInput);
    this.filtered.getContext("2d").putImageData(imageData, 0, 0);
    if (this.lastEndpoint && ev.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          gradient: this.gradient,
          width: this.width,
          hardness: this.hardness,
          density: 0.25,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
      manipulate(this.layerCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.processing.getContext("2d"),
          clearFirst: true
        }
      });
      manipulate(this.layerCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.filtered.getContext("2d"),
          composite: "source-in"
        }
      });
    }
    this.lastDest = this.origin;
  }

  onMove() {
    const newMid = midpoint(this.lastDest, this.coords);

    if (
      getQuadLength(
        this.lastMid || this.lastDest,
        this.lastDest,
        newMid
      ) <
      this.width * 0.25
    ) {
      return;
    }

    draw(this.processing.getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        orig: this.lastMid || this.lastDest,
        destArray: [this.lastMid || this.lastDest, this.lastDest, newMid],
        gradient: this.gradient,
        width: this.width,
        hardness: this.hardness,
        density: 0.25,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.layerCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        clearFirst: true
      }
    });
    manipulate(this.layerCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.filtered.getContext("2d"),
        composite: "source-in"
      }
    });
    this.lastDest = this.coords;
    this.lastMid = newMid;
  }

  async onEnd() {
    await this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "blend",
        params: {
          source: this.layerCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
    this.filtered = null;
  }
}

export class StampAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.hardness = params.hardness;
    this.clip = params.clip;
    this.opacity = params.opacity;
    this.gradient = getGradient("rgba(0, 0, 0, 1)", params.hardness);
    this.processing = document.createElement('canvas');
    this.stampCanvas = params.stampData.canvas;
    this.stampOrigin = params.stampData.origin;
    this.stampDestination = params.stampData.destination;
  }

  onStart(ev) {
    if (ev.altKey) {
      this.dispatch(setStampData({
        canvas: this.layerCanvas[this.targetLayer],
        origin: this.origin,
        destination: null
      }, false));
      this.stampCanvas = null;
      return;
    } else if (!this.stampCanvas) {
      return;
    }

    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    this.processing.width = ctx.canvas.width;
    this.processing.height = ctx.canvas.height;
    this.lastDest = this.origin;
    if (!this.stampDestination) {
      this.stampDestination = this.origin;
      this.dispatch(setStampData({
        origin: this.origin
      }));
    }
    this.stampOffset = {
      x: this.stampOrigin.x - this.stampDestination.x,
      y: this.stampOrigin.y - this.stampDestination.y,
    };
    if (this.lastEndpoint && ev.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          gradient: this.gradient,
          width: this.width,
          hardness: this.hardness,
          density: 0.25,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
      manipulate(this.layerCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.processing.getContext("2d"),
          globalAlpha: this.opacity / 100,
          clearFirst: true
        }
      });
      manipulate(this.layerCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.stampCanvas.getContext("2d"),
          composite: "source-in",
          orig: this.stampOffset
        }
      });
    }
  }

  onMove() {
    if (!this.stampCanvas) return;

    const newMid = midpoint(this.lastDest, this.coords);

    if (
      getQuadLength(
        this.lastMid || this.origin,
        this.lastDest,
        newMid
      ) <
      this.width * 0.25
    ) {
      return;
    }

    draw(this.processing.getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        orig: this.origin,
        destArray: [this.lastMid || this.origin, this.lastDest, newMid],
        gradient: this.gradient,
        width: this.width,
        hardness: this.hardness,
        density: 0.25,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.layerCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        globalAlpha: this.opacity / 100,
        clearFirst: true
      }
    });
    manipulate(this.layerCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.stampCanvas.getContext("2d"),
        composite: "source-in",
        orig: this.stampOffset
      }
    });
    this.lastDest = this.coords;
    this.lastMid = newMid;
  }

  async onEnd() {
    if (!this.stampCanvas) return;
    await this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.layerCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
  }
}

export class EraserAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData, params);
    this.composite = params.composite;
    this.width = params.width;
    this.clip = params.clip;
    this.gradient = getGradient("rgba(0, 0, 0, 1)", 100, params.hardness);
    this.usesStaging = false;
  }

  onStart(ev) {
    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    const viewWidth = Math.floor(ctx.canvas.width);
    const viewHeight = Math.floor(ctx.canvas.height);
    this.prevImgData = ctx.getImageData(0, 0, viewWidth, viewHeight);
    if (this.lastEndpoint && ev.shiftKey) {
      draw(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          gradient: this.gradient,
          width: this.width,
          hardness: this.hardness,
          density: 0.25,
          composite: this.composite,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
    }
    this.lastDest = this.origin;
  }

  onMove() {
    const newMid = midpoint(this.lastDest, this.coords);

    if (
      getQuadLength(
        this.lastMid || this.origin,
        this.lastDest,
        newMid
      ) <
      this.width * 0.25
    ) {
      return;
    }

    draw(this.layerCanvas[this.targetLayer].getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        orig: this.origin,
        destArray: [this.lastMid || this.origin, this.lastDest, newMid],
        gradient: this.gradient,
        width: this.width,
        hardness: this.hardness,
        density: 0.25,
        composite: this.composite,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    this.lastDest = this.coords;
    this.lastMid = newMid;
  }

  onEnd() {
    this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      null,
      this.prevImgData
    ));
    this.prevImgData = null;
  }
}

export class ShapeAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.drawActionType = params.drawActionType;
    this.regularOnShift = params.regularOnShift;
    this.color = params.color;
    this.width = params.width;
    this.clip = params.clip;
    this.isSelectionTool = this.targetLayer === "selection";
  }

  onStart(ev) {
    this.origin = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});
    if (this.isSelectionTool) {
      this._selectionStart(ev);
    }
  }

  onMove(ev) {
    this.dest = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});
    if (this.regularOnShift && ev.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    if (this.isSelectionTool) {
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: this.drawActionType,
        params: {
          orig: this.origin,
          dest: this.dest,
          width: 1,
          strokeColor: "rgba(0, 0, 0, 1)",
          dashPattern: [7, 7],
          clearFirst: true
        }
      })
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: this.drawActionType,
        params: {
          orig: this.origin,
          dest: this.dest,
          width: 1,
          strokeColor: "rgba(255, 255, 255, 1)",
          dashPattern: [7, 7],
          dashOffset: 7
        }
      })
    } else {
      draw(this.layerCanvas.staging.getContext("2d"), {
        action: this.drawActionType,
        params: {
          orig: this.origin,
          dest: this.dest,
          width: this.width,
          strokeColor: this.color,
          fillColor: this.color,
          clearFirst: true,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      })
    };
  }

  onEnd() {
    if (this.isSelectionTool) {
      let path;
      if (!this.dest) {
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
      }
      this.dispatch(updateSelectionPath(path));
    } else {
      const activeCtx = this.layerCanvas[this.targetLayer].getContext("2d")
      if (this.dest) {
        this.dispatch(putHistoryData(
          this.targetLayer,
          activeCtx,
          () => draw(activeCtx, {
            action: this.drawActionType,
            params: {
              orig: this.origin,
              dest: this.dest,
              width: this.width,
              strokeColor: this.color,
              fillColor: this.color,
              clip: this.clip,
              clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
            }
          })
        ));
      }
    }
  }
}

export class EyeDropperAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.renderOrder = params.renderOrder;
    this.modifier = window.navigator.platform.includes("Mac")
      ? "metaKey"
      : "ctrlKey";
    this.usesStaging = false;
  }

  onStart(ev) {
    let color;
    for (let i = this.renderOrder.length - 1; i >= 0; i--) {
      const ctx = this.layerCanvas[this.renderOrder[i]].getContext("2d");
      const {x, y} = this._getCoordinates(ev);
      const pixel = ctx.getImageData(x, y, 1, 1);
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

  onMove(ev) {
    if (this.isDrawing) {
      this.start(ev);
    }
  }
}

export class MoveAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.alwaysFire = true;
    this.usesStaging = false;
    this.renderOnEnd = false;
  }

  onStart(ev) {
    this.origin = {x: ev.screenX, y: ev.screenY};
    this.offsetOrigin = {x: this.translateData.offX, y: this.translateData.offY};
    this.offset = this.offsetOrigin;
    this.sizeOrigin = {w: this.layerCanvas[this.targetLayer].width, h: this.layerCanvas[this.targetLayer].height};
    this.rectOrigin = getImageRect(this.layerCanvas[this.targetLayer]);
  }

  manualStart() {
    this.start({screenX: 0, screenY: 0});
  }

  onMove(ev) {
    if (this.throttle) {return};
    this._setLockedAxis(ev);
    let [x, y] = [ev.screenX, ev.screenY]
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    }
    this.throttle = true;
    setTimeout(() => this.throttle = false, 25);
    const newOffset = {
      x: Math.floor(this.offsetOrigin.x - (this.origin.x - x) / this.translateData.zoom),
      y: Math.floor(this.offsetOrigin.y - (this.origin.y - y) / this.translateData.zoom)
    }
    this.offset = newOffset;
    this.dispatch(updateLayerPosition(
      this.targetLayer,
      null,
      newOffset,
      true
    ));
  }

  onEnd(groupWithPrevious) {
    const canvas = this.layerCanvas[this.targetLayer];
    const canvasRect = getImageRect(canvas);
    let newOffset, newSize, redrawData;
    if (canvasRect === null) {
      newOffset = {
        x: 0,
        y: 0
      }
      newSize = {
        w: this.translateData.documentWidth,
        h: this.translateData.documentHeight
      }
    } else {
      redrawData = canvas.getContext("2d").getImageData(canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h);
      newOffset = {
        x: Math.min(0, this.offset.x + canvasRect.x),
        y: Math.min(0, this.offset.y + canvasRect.y)
      }
      newSize = {
        w: Math.max(this.translateData.documentWidth - newOffset.x, this.offset.x + canvasRect.x + canvasRect.w),
        h: Math.max(this.translateData.documentHeight - newOffset.y, this.offset.y + canvasRect.y + canvasRect.h)
      }
    }
    this.dispatch(async dispatch => {
      await dispatch(updateLayerPosition(
        this.targetLayer,
        newSize,
        newOffset,
        true
      ));
      if (redrawData) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = newSize.w;
        canvas.height = newSize.h;
        canvas.getContext("2d").putImageData(
          redrawData,
          Math.max(0, this.offset.x + canvasRect.x),
          Math.max(0, this.offset.y + canvasRect.y)
        );
      }
      this.dispatch(putHistoryData(this.targetLayer, this.layerCanvas[this.targetLayer].getContext("2d"), null, null, {
        oldMove: {
          offset: this.offsetOrigin,
          size: this.sizeOrigin,
          rect: this.rectOrigin
        },
        newMove: {
          offset: newOffset,
          size: newSize,
          rect: canvasRect
        }
      }, {groupWithPrevious}));
      this.dispatch(render());
    });
  }

  manualEnd(offsetDelta, groupWithPrevious) {
    this.offset = offsetDelta;
    this.end(groupWithPrevious);
  }
}

// export class MagicFillAction extends ToolActionBase {
//   constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
//     super(targetLayer, layerCanvas, dispatch, translateData);
//     this.colorArray = params.colorArray;
//     this.tolerance = params.tolerance;
//     this.clip = params.clip;
//     this.usesStaging = false;
//     this.renderOnStart = true;
//     this.renderOnMove = false;
//     this.renderOnEnd = false;
//   }

//   onStart(ev) {
//     dispatch(putHistoryData(activeLayer, layerCanvas[activeLayer].getContext("2d"), () => {
//       const tempCanvas = new OffscreenCanvas(layerCanvas[activeLayer].width, layerCanvas[activeLayer].height);
//       tempCanvas.getContext("2d").drawImage(layerCanvas[activeLayer], 0, 0);
//       let pointList = MarchingSquaresOpt.getBlobOutlinePoints(tempCanvas);
//       const ctx = tempCanvas.getContext("2d");
//       const finalPath = new Path2D();
//       function doTheThing(pointList) {
//         let path = MarchingSquaresOpt.getPathFromPointList(pointList);
//         finalPath.addPath(path);
//         ctx.save();
//         ctx.translate(2, 0);
//         ctx.clip(path);
//         ctx.translate(-2, 0);
//         ctx.clearRect(0, 0, documentWidth, documentHeight);
//         ctx.restore();
//         return 1;
//       }
//       let prevLength = null;
//       while (true) {
//         const one = doTheThing(pointList);
//         if (one === 1) {
//           pointList = MarchingSquaresOpt.getBlobOutlinePoints(tempCanvas);
//         }
//         if (!pointList.length || pointList.length === prevLength) break;
//         prevLength = pointList.length;
//       }

//       const finalCtx = layerCanvas[activeLayer].getContext("2d")
//       finalCtx.clearRect(0, 0, documentWidth, documentHeight);
//       finalCtx.save();
//       finalCtx.translate(2, 0);
//       finalCtx.strokeStyle = "rgb(255,0,0)"
//       finalCtx.stroke(finalPath);
//       finalCtx.restore();
//     }))
//   }
// }

export class FillAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.colorArray = params.colorArray;
    this.tolerance = params.tolerance;
    this.clip = params.clip;
    this.usesStaging = false;
    this.renderOnStart = true;
    this.renderOnMove = false;
    this.renderOnEnd = false;
  }

  onStart(ev) {
    this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "fill",
        params: {
          orig: this._getCoordinates(ev),
          colorArray: this.colorArray,
          tolerance: this.tolerance,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      })
    ));
  }
}

export class CropAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, dispatch, translateData);
    this.clip = params.clip;
  }

  onStart(ev) {
    this.origin = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});
    this.layerCanvas.selection.getContext("2d").clearRect(
      0,
      0,
      this.translateData.documentWidth,
      this.translateData.documentHeight
    );
  }

  onMove(ev) {
    this.dest = this._getCoordinates(ev, {autoCrop: this.isSelectionTool});
    if (ev.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    draw(this.layerCanvas.staging.getContext("2d"), {
      action: "drawRect",
      params: {
        orig: this.origin,
        dest: this.dest,
        width: 1,
        strokeColor: "rgba(0, 0, 0, 1)",
        dashPattern: [7, 7],
        clearFirst: true
      }
    })
    draw(this.layerCanvas.staging.getContext("2d"), {
      action: "drawRect",
      params: {
        orig: this.origin,
        dest: this.dest,
        width: 1,
        strokeColor: "rgba(255, 255, 255, 1)",
        dashPattern: [7, 7],
        dashOffset: 7
      }
    })
  }

  onEnd() {
    if (this.dest) {
      this.dispatch(setCropIsActive(true, {
        startDimensions: {
          x: this.origin.x,
          y: this.origin.y,
          w: this.dest.x - this.origin.x,
          h: this.dest.y - this.origin.y
        }
      }))
    } else {
      if (this.clip) {
        const rect = getImageRect(this.layerCanvas.placeholder, this.clip, true);
        this.dispatch(setCropIsActive(true, {
          startDimensions: rect
        }))
      } else {
        this.dispatch(setCropIsActive(true, {
          startDimensions: {
            x: 0,
            y: 0,
            w: this.translateData.documentWidth,
            h: this.translateData.documentHeight
          }
        }))
      }
    }
  }
}
