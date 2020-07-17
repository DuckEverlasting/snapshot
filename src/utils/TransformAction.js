import { getDistance } from "../utils/helpers";

class TransformActionBase {
  constructor(ev, { size, setSize, offset, setOffset, anchorPoint, setAnchorPoint, rotation, setRotation, zoom, anchorRef }, params) {
    this.size = size;
    this.setSize = setSize;
    this.offset = offset;
    this.setOffset = setOffset;
    this.anchorPoint = anchorPoint;
    this.setAnchorPoint = setAnchorPoint;
    this.rotation = rotation;
    this.setRotation = setRotation;
    this.zoom = zoom;
    this.anchorRef = anchorRef;
    this.params = params;
    this.origin = {
      x: Math.floor(ev.screenX),
      y: Math.floor(ev.screenY),
      w: size.w,
      h: size.h,
      offX: offset.x,
      offY: offset.y,
    }
  }

  start() {}

  move() {}

  end() {}
}

class ResizeTransformAction extends TransformActionBase {
  move(ev) {
    let x, y, calculatedWidth, calculatedHeight, calculatedOffsetX, calculatedOffsetY;
    calculatedWidth = this.size.w;
    calculatedHeight = this.size.h;
    calculatedOffsetX = this.offset.x;
    calculatedOffsetY = this.offset.y;
    x = Math.floor(ev.screenX);
    y = Math.floor(ev.screenY);

    let lockAspectRatio;
    if (
      (!ev.shiftKey && !this.params.invertShiftOnResize) ||
      (ev.shiftKey && this.params.invertShiftOnResize) ||
      this.params.direction.length > 2
    ) {
      lockAspectRatio = true;
    } else {
      lockAspectRatio = false;
    }

    if (lockAspectRatio) {
      const distX = x - this.origin.x;
      const distY = y - this.origin.y;
      let dist;
      if (this.params.direction === "se") {
        dist = Math.min(-distX, -distY);
        x = this.origin.x - dist;
        y = this.origin.y - dist;
      } else if (this.params.direction === "nw") {
        dist = Math.min(distX, distY);
        x = this.origin.x + dist;
        y = this.origin.y + dist;
      } else if (this.params.direction === "sw") {
        dist = Math.min(distX, -distY);
        x = this.origin.x + dist;
        y = this.origin.y - dist;
      } else if (this.params.direction === "ne") {
        dist = Math.min(-distX, distY);
        x = this.origin.x - dist;
        y = this.origin.y + dist;
      }
    }

    if (this.params.direction.includes("n")) {
      calculatedHeight = this.origin.h - (y - this.origin.y) / this.zoom;
      if (calculatedHeight > 1) {
        calculatedOffsetY = this.origin.offY + (y - this.origin.y) / this.zoom;
      }
    }
    if (this.params.direction.includes("s")) {
      calculatedHeight = this.origin.h + (y - this.origin.y) / this.zoom;
    }
    if (this.params.direction.includes("e")) {
      calculatedWidth = this.origin.w + (x - this.origin.x) / this.zoom;
    }
    if (this.params.direction.includes("w")) {
      calculatedWidth = this.origin.w - (x - this.origin.x) / this.zoom;
      if (calculatedWidth > 1) {
        calculatedOffsetX = this.origin.offX + (x - this.origin.x) / this.zoom;
      }
    }

    this.setOffset({
      x: calculatedOffsetX,
      y: calculatedOffsetY
    });
    this.setSize({
      w: Math.max(calculatedWidth, 1),
      h: Math.max(calculatedHeight, 1)
    });
  }
}

class MoveTransformAction extends TransformActionBase {
  move(ev) {
    let x = (Math.floor(ev.screenX) - (this.origin.x - this.origin.offX * this.zoom)) / this.zoom;
    let y = (Math.floor(ev.screenY) - (this.origin.y - this.origin.offY * this.zoom)) / this.zoom;

    if (ev.shiftKey) {
      if (Math.abs(Math.floor(ev.screenX) - this.origin.x) > Math.abs(Math.floor(ev.screenY) - this.origin.y)) {
        y = this.origin.offY;
      } else {
        x = this.origin.offX;
      }
    } else {
      this.lockDirection = null;
    }

    this.setOffset({x, y});
  }
}

class RotateTransformAction extends TransformActionBase {
  constructor(ev, size, setSize, offset, setOffset, anchorPoint, setAnchorPoint, rotation, setRotation, zoom, anchorRef, params) {
    super(ev, size, setSize, offset, setOffset, anchorPoint, setAnchorPoint, rotation, setRotation, zoom, anchorRef, params);
    const anchorRect = anchorRef.current.getBoundingClientRect();
    this.origin.anchorPos = {
      x: anchorRect.x + .5 * anchorRect.width,
      y: anchorRect.y + .5 * anchorRect.height,
    }
    this.origin.rotation = rotation;
    this.origin.angle = Math.atan2(ev.clientY - this.origin.anchorPos.y, ev.clientX - this.origin.anchorPos.x);
  }

  move(ev) {
    const newAngle = Math.atan2(ev.clientY - this.origin.anchorPos.y, ev.clientX - this.origin.anchorPos.x);
    let newRotation = this.origin.rotation - (this.origin.angle - newAngle);
    if (ev.shiftKey) {
      newRotation = Math.floor((this.origin.rotation - (this.origin.angle - newAngle)) / (.25 * Math.PI)) * (.25 * Math.PI);
    }
    this.setRotation(newRotation);
  }
}

class MoveAnchorPointTransformAction extends TransformActionBase {
  move(ev) {
    const posX = (Math.floor(ev.screenX) - this.origin.x + this.anchorPoint.x * this.size.w * this.zoom) / this.zoom;
    const posY = (Math.floor(ev.screenY) - this.origin.y + this.anchorPoint.y * this.size.h * this.zoom) / this.zoom;
    let pctX = posX / this.size.w;
    let pctY = posY / this.size.h;

    if (!ev.shiftKey) {
      for (let x = 0; x <= 1; x+=.5) {
        let end = false;
        for (let y = 0; y <= 1; y+=.5) {
          if (getDistance({x, y}, {x: pctX, y: pctY}) < .05) {
            end = true;
            pctX = x;
            pctY = y;
            break;
          }
        }
        if (end) {break}
      }
    }

    this.setAnchorPoint({x: pctX, y: pctY});
  }
}

export default function transformActionFactory(ev, transformData, params) {
  switch(params.actionType) {
    case "move":
      return new MoveTransformAction(ev, transformData, params);
    case "rotate":
      return new RotateTransformAction(ev, transformData, params);
    case "n-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "n"});
    case "s-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "s"});
    case "e-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "e"});
    case "w-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "w"});
    case "ne-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "ne"});
    case "se-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "se"});
    case "sw-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "sw"});
    case "nw-resize":
      return new ResizeTransformAction(ev, transformData, {...params, direction: "nw"});
    case "move-anchor":
      return new MoveAnchorPointTransformAction(ev, transformData, {...params, direction: "nw"});
    default:
      break;
  }
}