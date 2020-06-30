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
  putHistoryData
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

  _getCoordinates(ev) {
    return {
      x: (ev.nativeEvent.offsetX + this.translateData.x) / this.translateData.zoom - this.translateData.offX,
      y: (ev.nativeEvent.offsetY + this.translateData.y) / this.translateData.zoom - this.translateData.offY
    };
  }

  _setLockedAxis(ev) {
    /* 
      Determines which axis should be "locked" in certain functions.
    */
    if (!this.origin) {
      throw new Error("setLockedAxis requires an origin to be stored");
    }

    const {x, y} = this._getCoordinates(ev)
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
  }

  start(ev, ...args) {
    if (this.usesStaging) {
      this._moveStaging();
    }

    this.origin = this._getCoordinates(ev);

    this.coords = this.origin;

    this.onStart(ev, ...args);

    if (this.renderOnStart) {
      this.dispatch(render());
    }
  }

  move(ev, ...args) {
    this._setLockedAxis(ev);
    let {x, y} = this._getCoordinates(ev);
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
    if (this.targetLayer === "selection") {
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

    if (this.targetLayer === "selection") {
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
    if (this.targetLayer === "selection") {
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

      const selectCtx = this.layerCanvas.selection.getContext("2d"),
        viewWidth = Math.floor(selectCtx.canvas.width),
        viewHeight = Math.floor(selectCtx.canvas.height);

      this.prevImgData = selectCtx.getImageData(0, 0, viewWidth, viewHeight);
      
      const params = {
        orig: this.destArray[0],
        destArray: this.destArray,
        width: 1,
        strokeColor: "rgba(0, 0, 0, 1)",
        dashPattern: [7, 7],
      }
      draw(selectCtx, {
        action: "drawQuadPath",
        params
      });
      draw(selectCtx, {
        action: "drawQuadPath",
        params: {...params, dashOffset: 7}
      })
      this.dispatch(putHistoryData(
        "selection",
        selectCtx,
        null,
        this.prevImgData
      ));
      this.prevImgData = null;
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
    this.dashPattern = params.dashPattern;
    this.clip = params.clip;
  }

  onStart(ev) {
    this.origin = this._getCoordinates(ev);
    if (this.targetLayer === "selection") {
      this._selectionStart(ev);
    }
  }

  onMove(ev) {
    this.dest = this._getCoordinates(ev);
    if (this.regularOnShift && ev.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    if (this.targetLayer === "selection") {
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
    if (this.targetLayer === "selection") {
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
        const selectCtx = this.layerCanvas.selection.getContext("2d");
        const viewWidth = Math.floor(selectCtx.canvas.width);
        const viewHeight = Math.floor(selectCtx.canvas.height);
        this.prevImgData = selectCtx.getImageData(0, 0, viewWidth, viewHeight);
        draw(selectCtx, {
          action: this.drawActionType,
          params: {
            orig: this.origin,
            dest: this.dest,
            width: 1,
            strokeColor: "rgba(0, 0, 0, 1)",
            dashPattern: [7, 7],
          }
        });
        draw(selectCtx, {
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
        this.dispatch(putHistoryData(
          "selection",
          selectCtx,
          null,
          this.prevImgData
        ));
        this.prevImgData = null;
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
    this.layerOrder = params.layerOrder;
    this.modifier = window.navigator.platform.includes("Mac")
      ? "metaKey"
      : "ctrlKey";
    this.usesStaging = false;
  }

  onStart(ev) {
    let color;
    for (let i = this.layerOrder.length - 1; i >= 0; i--) {
      const ctx = this.layerCanvas[this.layerOrder[i]].getContext("2d");
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
    });
  }

  manualEnd(offsetDelta, groupWithPrevious) {
    this.offset = offsetDelta;
    this.end(groupWithPrevious);
  }
}

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
