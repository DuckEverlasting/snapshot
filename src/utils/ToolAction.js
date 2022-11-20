import {
  midpoint,
  getQuadLength,
  getRadialGradient,
  convertDestToRegularShape,
  canvasIsBlank,
  getCanvas
} from "../utils/helpers";

import getImageRect from "../utils/getImageRect";

import {
  updateColor,
  updateSelectionPath,
  updateStagingPosition,
  updateLayerPosition,
  setStampData,
  putHistoryData,
  setCropIsActive,
  setLastEndpoint,
  setCurrentToolAction
} from "../store/actions/redux";

import draw from "../store/reducers/custom/drawingReducer";
import manipulate from "../store/reducers/custom/manipulateReducer";
import selection from "../store/reducers/custom/selectionReducer";

import render from "../store/actions/redux/renderCanvas";
import { getFillContent } from "../store/actions/custom/ctxActions";

class ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData) {
    this.targetLayer = targetLayer;
    this.layerCanvas = layerCanvas;
    this.utilityCanvas = utilityCanvas;
    this.dispatch = dispatch;
    this.translateData = translateData;

    this.usesStaging = true;

    /* By default, actions render after 
    mouse mousemove and after mouseup.*/
    this.renderOnStart = false;
    this.renderOnMove = true;
    this.renderOnEnd = true;
    this.renderParams = {};
  }

  _moveStaging(layer = this.targetLayer) {
    this.dispatch(updateStagingPosition(layer));
  }

  _clearStaging() {
    this.utilityCanvas.staging
      .getContext("2d")
      .clearRect(0, 0, this.utilityCanvas.staging.width, this.utilityCanvas.staging.height);
  }

  _selectionStart(e) {
    if (e.shiftKey && e.altKey) {
      this.selectionOperation = "intersect";
    } else if (e.shiftKey) {
      this.selectionOperation = "add";
    } else if (e.altKey) {
      this.selectionOperation = "remove";
    } else {
      this.selectionOperation = "new";
    }
  }

  _getCoordinates(e, params={}) {
    let x = (e.nativeEvent.offsetX - this.translateData.x) / this.translateData.zoom - this.translateData.offX,
      y = (e.nativeEvent.offsetY - this.translateData.y) / this.translateData.zoom - this.translateData.offY;
    if (params.autoCrop) {
      x = Math.min(Math.max(x, 0), this.translateData.documentWidth - 1);
      y = Math.min(Math.max(y, 0), this.translateData.documentHeight - 1); 
    }
    return { x, y };
  }

  _setLockedAxis(e) {
    /* 
      Determines which axis should be "locked" in certain functions.
    */
    if (!this.origin) {
      throw new Error("setLockedAxis requires an origin to be stored");
    }

    const { x, y } = this._getCoordinates(e)
    if (this.lockedAxis && !e.shiftKey) {
      this.lockedAxis = null;
    } else if (!this.lockedAxis && e.shiftKey) {
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
      this.dispatch(render(this.renderParams));
    };
  }

  onStart() {}

  move(...args) {
    this.onMove(...args);

    if (this.renderOnMove) {
      this.dispatch(render(this.renderParams));
    };
  }

  onMove() {}

  end(...args) {

    this.onEnd(...args);
    
    if (this.usesStaging) {
      this._clearStaging();
    }

    if (this.renderOnEnd) {
      this.dispatch(render(this.renderParams));
    };
    this.dispatch(setCurrentToolAction(null));
  }

  onEnd() {}
}

export class FreeDrawAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.lastEndpoint = params.lastEndpoint;
    this.renderOnStart = true;
    this.isSelectionTool = targetLayer === "selection";
  }

  start(e, ...args) {
    console.log(e);
    if (this.usesStaging) {
      this._moveStaging();
    }

    this.origin = this._getCoordinates(e, {autoCrop: this.isSelectionTool});

    this.coords = this.origin;

    this.onStart(e, ...args);

    if (this.renderOnStart) {
      this.dispatch(render());
    }
  }

  move(e, ...args) {
    if (!this.isSelectionTool) {
      this._setLockedAxis(e);
    }
    let {x, y} = this._getCoordinates(e, {autoCrop: this.isSelectionTool});
    if (this.lockedAxis === "x") {
      x = this.origin.x;
    } else if (this.lockedAxis === "y") {
      y = this.origin.y;
    }
    this.coords = {x, y}

    this.onMove(e, ...args);

    if (this.renderOnMove) {
      this.dispatch(render())
    };
  }

  end(...args) {

    this.onEnd(...args);
    
    this.dispatch(setLastEndpoint(this.coords));

    if (this.usesStaging) {
      this._clearStaging();
    }

    if (this.renderOnEnd) {
      this.dispatch(render());
    };
  }
}

export class PencilAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.color = params.color;
    this.clip = params.clip;
  }

  onStart(e) {
    if (this.isSelectionTool) {
      this._selectionStart(e);
    }
    if (this.lastEndpoint && e.shiftKey && !this.isSelectionTool) {
      this.destArray = [this.lastEndpoint, this.origin];
    } else {
      this.destArray = [this.origin];
    }
    draw(this.utilityCanvas.staging.getContext("2d"), {
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
      draw(this.utilityCanvas.staging.getContext("2d"), {
        action: "drawQuad",
        params
      });
      draw(this.utilityCanvas.staging.getContext("2d"), {
        action: "drawQuad",
        params: {...params, strokeColor: "rgba(255, 255, 255, 1)", dashOffset: 7, clearFirst: false}
      });
    } else {
      draw(this.utilityCanvas.staging.getContext("2d"), {
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
        return this.dispatch(updateSelectionPath("clear"));
      }
      if (canvasIsBlank(this.utilityCanvas.staging)) return;
      let path = new Path2D();
      path = selection(path, {
        action: "drawQuadPath",
        params: { orig: this.destArray[0], destArray: this.destArray }
      });
      this.dispatch(updateSelectionPath(this.selectionOperation, path));
    } else {
      if (canvasIsBlank(this.utilityCanvas.staging)) return;
      const activeCtx = this.layerCanvas[this.targetLayer].getContext("2d")
      if (this.destArray.length) {
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
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.opacity = params.opacity;
    this.hardness = params.hardness;
    this.clip = params.clip;
    this.density = params.density || 0.2;
    this.brushHead = getRadialGradient(params.color, this.width, this.hardness);
    this.processing = document.createElement('canvas');
  }

  onStart(e) {
    this.processing.width = this.utilityCanvas.staging.width;
    this.processing.height = this.utilityCanvas.staging.height;
    this.processing.getContext("2d").imageSmoothingEnabled = false;
    if (this.lastEndpoint && e.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          brushHead: this.brushHead,
          width: this.width,
          hardness: this.hardness,
          density: this.density,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
      manipulate(this.utilityCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.processing.getContext("2d"),
          globalAlpha: this.opacity / 100,
          clearFirst: true
        },
      });
    } else {
      manipulate(this.utilityCanvas.staging.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.brushHead.getContext("2d"),
          dest: { x: this.origin.x - .5 * this.brushHead.width, y: this.origin.y - .5 * this.brushHead.height },
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY},
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
      this.width * this.density
    ) {
      return;
    }

    draw(this.processing.getContext("2d"), {
      action: "drawQuadPoints",
      params: {
        orig: this.lastMid || this.lastDest,
        destArray: [this.lastMid || this.lastDest, this.lastDest, newMid],
        brushHead: this.brushHead,
        width: this.width,
        hardness: this.hardness,
        density: this.density,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
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
    if (canvasIsBlank(this.utilityCanvas.staging)) return;
    this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.utilityCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
  }
}

export class FilterBrushAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.filter = params.filter;
    this.filterInput = params.filterInput;
    this.hardness = params.hardness;
    this.density = params.density || 0.2;
    this.clip = params.clip;
    this.brushHead = getRadialGradient("rgba(0, 0, 0, 1)", this.width, this.hardness);
    this.processing = document.createElement('canvas');
    this.filtered = document.createElement('canvas');
  }

  onStart(e) {
    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    this.processing.width = ctx.canvas.width;
    this.processing.height = ctx.canvas.height;
    this.filtered.width = ctx.canvas.width;
    this.filtered.height = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.filter(imageData.data, this.filterInput);
    this.filtered.getContext("2d").putImageData(imageData, 0, 0);
    if (this.lastEndpoint && e.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          brushHead: this.brushHead,
          width: this.width,
          hardness: this.hardness,
          density: this.density,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
    } else {
      manipulate(this.processing.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.brushHead.getContext("2d"),
          dest: { x: this.origin.x - .5 * this.brushHead.width, y: this.origin.y - .5 * this.brushHead.height },
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY},
          globalAlpha: this.opacity / 100,
          clearFirst: true
        },
      });
    }
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        clearFirst: true
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.filtered.getContext("2d"),
        composite: "source-in"
      }
    });
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
        brushHead: this.brushHead,
        width: this.width,
        hardness: this.hardness,
        density: this.density,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        clearFirst: true
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
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
    if (canvasIsBlank(this.utilityCanvas.staging)) return;
    await this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "blend",
        params: {
          source: this.utilityCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
    this.filtered = null;
  }
}

export class StampAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.hardness = params.hardness;
    this.clip = params.clip;
    this.opacity = params.opacity;
    this.density = params.density || 0.2;
    this.brushHead = getRadialGradient("rgba(0, 0, 0, 1)", this.width, this.hardness);
    this.processing = document.createElement('canvas');
    this.stampCanvas = params.stampData.canvas;
    this.stampOrigin = params.stampData.origin;
    this.stampDestination = params.stampData.destination;
  }

  onStart(e) {
    if (e.altKey) {
      this.dispatch(setStampData({
        canvas: this.layerCanvas[this.targetLayer],
        origin: this.origin,
        destination: null
      }));
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
      }, {ignoreHistory: true}));
    }
    this.stampOffset = {
      x: this.stampOrigin.x - this.stampDestination.x,
      y: this.stampOrigin.y - this.stampDestination.y,
    };
    if (this.lastEndpoint && e.shiftKey) {
      draw(this.processing.getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          brushHead: this.brushHead,
          width: this.width,
          hardness: this.hardness,
          density: this.density,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
    } else {
      manipulate(this.processing.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.brushHead.getContext("2d"),
          dest: { x: this.origin.x - .5 * this.brushHead.width, y: this.origin.y - .5 * this.brushHead.height },
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY},
          globalAlpha: this.opacity / 100,
          clearFirst: true
        },
      });
    }
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        globalAlpha: this.opacity / 100,
        clearFirst: true
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.stampCanvas.getContext("2d"),
        composite: "source-in",
        orig: this.stampOffset
      }
    });
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
        brushHead: this.brushHead,
        width: this.width,
        hardness: this.hardness,
        density: this.density,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
      action: "paste",
      params: {
        sourceCtx: this.processing.getContext("2d"),
        globalAlpha: this.opacity / 100,
        clearFirst: true
      }
    });
    manipulate(this.utilityCanvas.staging.getContext("2d"), {
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
    if (canvasIsBlank(this.utilityCanvas.staging)) return;
    await this.dispatch(putHistoryData(
      this.targetLayer,
      this.layerCanvas[this.targetLayer].getContext("2d"),
      () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.utilityCanvas.staging.getContext("2d")
        }
      })
    ))
    this.processing = null;
  }
}

export class EraserAction extends FreeDrawAction {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params);
    this.width = params.width;
    this.clip = params.clip;
    this.hardness = params.hardness;
    this.density = params.density || 0.2;
    this.brushHead = getRadialGradient("rgba(0, 0, 0, 1)", this.width, this.hardness);
    this.composite = "destination-out";
    this.usesStaging = false;
  }

  onStart(e) {
    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    const viewWidth = Math.floor(ctx.canvas.width);
    const viewHeight = Math.floor(ctx.canvas.height);
    this.prevImgData = ctx.getImageData(0, 0, viewWidth, viewHeight);
    if (this.lastEndpoint && e.shiftKey) {
      draw(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "drawQuadPoints",
        params: {
          orig: this.lastEndpoint,
          destArray: [this.lastEndpoint, this.origin, this.origin],
          brushHead: this.brushHead,
          width: this.width,
          hardness: this.hardness,
          density: this.density,
          composite: this.composite,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
        }
      });
    } else {
      manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: this.brushHead.getContext("2d"),
          dest: { x: this.origin.x - .5 * this.brushHead.width, y: this.origin.y - .5 * this.brushHead.height },
          composite: this.composite,
          clip: this.clip,
          clipOffset: {x: this.translateData.offX, y: this.translateData.offY},
        },
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
        brushHead: this.brushHead,
        width: this.width,
        hardness: this.hardness,
        density: this.density,
        composite: this.composite,
        clip: this.clip,
        clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
      }
    });
    this.lastDest = this.coords;
    this.lastMid = newMid;
  }

  onEnd() {
    const ctx = this.layerCanvas[this.targetLayer].getContext("2d");
    const currData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!currData.data.some((el, i) => this.prevImgData.data[i] !== el)) return;
    this.dispatch(putHistoryData(
      this.targetLayer,
      ctx,
      null,
      this.prevImgData
    ));
    this.prevImgData = null;
  }
}

export class ShapeAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.drawActionType = params.drawActionType;
    this.regularOnShift = params.regularOnShift;
    this.color = params.color;
    this.width = params.width;
    this.clip = params.clip;
    this.isSelectionTool = this.targetLayer === "selection";
  }

  onStart(e) {
    this.origin = this._getCoordinates(e, {autoCrop: this.isSelectionTool});
    if (this.isSelectionTool) {
      this._selectionStart(e);
    }
  }

  onMove(e) {
    this.dest = this._getCoordinates(e, {autoCrop: this.isSelectionTool});
    if (this.regularOnShift && e.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    if (this.isSelectionTool) {
      draw(this.utilityCanvas.staging.getContext("2d"), {
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
      draw(this.utilityCanvas.staging.getContext("2d"), {
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
      draw(this.utilityCanvas.staging.getContext("2d"), {
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
    if (this.dest && canvasIsBlank(this.utilityCanvas.staging)) {
      return;
    }
    if (this.isSelectionTool) {
      if (!this.dest) {
        this.dispatch(updateSelectionPath("clear"));
      } else {
        let path = new Path2D();
        path = selection(path, {
          action: this.drawActionType,
          params: { orig: this.origin, dest: this.dest }
        });
        this.dispatch(updateSelectionPath(this.selectionOperation, path));
      }
    } else if (this.dest) {
      const activeCtx = this.layerCanvas[this.targetLayer].getContext("2d")
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

export class EyeDropperAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.renderOrder = params.renderOrder;
    this.modifier = window.navigator.platform.includes("Mac")
      ? "metaKey"
      : "ctrlKey";
    this.usesStaging = false;
  }

  onStart(e) {
    let color;
    for (let i = this.renderOrder.length - 1; i >= 0; i--) {
      const ctx = this.layerCanvas[this.renderOrder[i]].getContext("2d");
      const {x, y} = this._getCoordinates(e);
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
      const palette = e[this.modifier] ? "secondary" : "primary"
      this.isDrawing = true;
      this.dispatch(updateColor(palette, color))
    };
  }

  onMove(e) {
    if (this.isDrawing) {
      this.start(e);
    }
  }
}

export class MoveAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.alwaysFire = true;
    this.usesStaging = false;
    this.renderOnEnd = false;
    this.renderParams = { clearAll: true };
  }

  onStart(e) {
    this.origin = {x: e.screenX, y: e.screenY};
    this.offsetOrigin = {x: this.translateData.offX, y: this.translateData.offY};
    this.offset = this.offsetOrigin;
    this.sizeOrigin = {w: this.layerCanvas[this.targetLayer].width, h: this.layerCanvas[this.targetLayer].height};
    this.rectOrigin = getImageRect(this.layerCanvas[this.targetLayer]);
  }

  manualStart() {
    this.start({screenX: 0, screenY: 0});
  }

  onMove(e) {
    if (this.throttle) {return};
    this._setLockedAxis(e);
    let [x, y] = [e.screenX, e.screenY]
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
      {ignoreHistory: true}
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
      const newOffsetRaw = {
        x: Math.max(
          Math.min(0, this.offset.x + canvasRect.x),
          (canvasRect.x + canvasRect.w + this.offset.x) - this.translateData.documentWidth
        ),
        y: Math.max(
          Math.min(0, this.offset.y + canvasRect.y),
          (canvasRect.y + canvasRect.h + this.offset.y) - this.translateData.documentHeight
        )
      }
      newSize = {
        w: Math.max(this.translateData.documentWidth + Math.abs(newOffsetRaw.x), canvasRect.w),
        h: Math.max(this.translateData.documentHeight + Math.abs(newOffsetRaw.y), canvasRect.h)
      }
      // seems wrong, but with current setup layers can't actually have a positive offset since the canvas must always overlap the main drawing space.
      // renaming or reworking in order, for clarity's sake?
      newOffset = {
        x: Math.min(newOffsetRaw.x, 0),
        y: Math.min(newOffsetRaw.y, 0)
      }
    }
    this.dispatch(async dispatch => {
      await dispatch(updateLayerPosition(
        this.targetLayer,
        newSize,
        newOffset
      ));
      if (redrawData) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = newSize.w;
        canvas.height = newSize.h;
        canvas.getContext("2d").putImageData(
          redrawData,
          Math.min(
            Math.max(0, this.offset.x + canvasRect.x),
            newSize.w - canvasRect.w
          ),
          Math.min(
            Math.max(0, this.offset.y + canvasRect.y),
            newSize.h - canvasRect.h
          )
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
      this.dispatch(render(this.renderParams));
    });
  }

  manualEnd(offsetDelta, groupWithPrevious) {
    this.offset = offsetDelta;
    this.end(groupWithPrevious);
  }
}

export class FillAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.colorArray = params.colorArray;
    this.tolerance = params.tolerance;
    this.clip = params.clip;
    this.usesStaging = false;
    this.renderOnStart = true;
    this.renderOnMove = false;
    this.renderOnEnd = false;
    this.isSelectionTool = this.targetLayer === "selection";
    this.selectionTarget = params.selectionTarget;
    this.mainCanvas = params.mainCanvas
  }

  onStart(e) {
    const orig = this._getCoordinates(e);
    if (
      orig.x < 0 ||
      orig.x > this.translateData.documentWidth ||
      orig.y < 0 ||
      orig.y > this.translateData.documentHeight
    ) {
      return;
    }
    if (this.isSelectionTool) {
      this._selectionStart(e);
      let dataCanvas;
      if (this.selectionTarget === "all") {
        dataCanvas = this.mainCanvas;
      } else {
        dataCanvas = getCanvas(this.translateData.documentWidth, this.translateData.documentHeight);
        manipulate(dataCanvas.getContext("2d"), {
          action: "paste",
          params: {
            sourceCtx: this.layerCanvas[this.selectionTarget].getContext("2d"),
            dest: {x: this.translateData.offX, y: this.translateData.offY}
          }
        });
      }
      orig.x -= this.translateData.offX;
      orig.y -= this.translateData.offY;
      const clip = new Path2D();
      clip.rect(1, 1, this.translateData.documentWidth-2, this.translateData.documentHeight-1);
      const maskCanvas = getFillContent(dataCanvas.getContext("2d"), {
        orig,
        colorArray: [0, 0, 0, 255],
        tolerance: this.tolerance,
        clip
      })

      this.dispatch(updateSelectionPath(this.selectionOperation, maskCanvas))
          
    } else {
      this.dispatch(putHistoryData(
        this.targetLayer,
        this.layerCanvas[this.targetLayer].getContext("2d"),
        () => manipulate(this.layerCanvas[this.targetLayer].getContext("2d"), {
          action: "fill",
          params: {
            orig: this._getCoordinates(e),
            colorArray: this.colorArray,
            tolerance: this.tolerance,
            clip: this.clip,
            clipOffset: {x: this.translateData.offX, y: this.translateData.offY}
          }
        })
      ));
    }
  }
}

export class CropAction extends ToolActionBase {
  constructor(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData, params) {
    super(targetLayer, layerCanvas, utilityCanvas, dispatch, translateData);
    this.clip = params.clip;
  }

  onStart(e) {
    this.origin = this._getCoordinates(e, {autoCrop: this.isSelectionTool});
    this.dispatch(updateSelectionPath("clear", null, {ignoreHistory: true}));
  }

  onMove(e) {
    this.dest = this._getCoordinates(e, {autoCrop: this.isSelectionTool});
    if (e.shiftKey) {
      this.dest = convertDestToRegularShape(this.origin, this.dest);
    };
    draw(this.utilityCanvas.staging.getContext("2d"), {
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
    draw(this.utilityCanvas.staging.getContext("2d"), {
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
          x: Math.min(this.origin.x, this.dest.x),
          y: Math.min(this.origin.y, this.dest.y),
          w: Math.abs(this.dest.x - this.origin.x),
          h: Math.abs(this.dest.y - this.origin.y)
        }
      }))
    } else {
      if (this.clip) {
        const rect = getImageRect(this.utilityCanvas.placeholder, this.clip, true);
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
