class TransformActionBase {
  constructor(ev, size, setSize, offset, setOffset, zoom, params) {
    this.size = size;
    this.setSize = setSize;
    this.offset = offset;
    this.setOffset = setOffset;
    this.zoom = zoom;
    this.params = params;
    this.origin = {
      x: ev.screenX,
      y: ev.screenY,
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
    x = ev.screenX;
    y = ev.screenY;

    if (!ev.shiftKey && this.params.direction.length > 2) {
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
        calculatedOffsetY = this.origin.offY + .5 * (y - this.origin.y) / this.zoom;
      }
    }
    if (this.params.direction.includes("s")) {
      calculatedHeight = this.origin.h + (y - this.origin.y) / this.zoom;
      if (calculatedHeight > 1) {
        calculatedOffsetY = this.origin.offY + .5 * (y - this.origin.y) / this.zoom;
      }
    }
    if (this.params.direction.includes("e")) {
      calculatedWidth = this.origin.w + (x - this.origin.x) / this.zoom;
      if (calculatedWidth > 1) {
        calculatedOffsetX = this.origin.offX + .5 * (x - this.origin.x) / this.zoom;
      }
    }
    if (this.params.direction.includes("w")) {
      calculatedWidth = this.origin.w - (x - this.origin.x) / this.zoom;
      if (calculatedWidth > 1) {
        calculatedOffsetX = this.origin.offX + .5 * (x - this.origin.x) / this.zoom;
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

  end(ev) {

  }
}

class MoveTransformAction extends TransformActionBase {
  move(ev) {
    const x = (ev.screenX - (this.origin.x - this.origin.offX * this.zoom)) / this.zoom;
    const y = (ev.screenY - (this.origin.y - this.origin.offY * this.zoom)) / this.zoom;
   
    this.setOffset({x, y});
  }

  end(ev) {

  }
}

class RotateTransformAction extends TransformActionBase {
  move(ev) {
  
  }

  end(ev) {

  }
}

export default function transformActionFactory(ev, size, setSize, offset, setOffset, zoom, params) {
  switch(params.actionType) {
    case "move":
      return new MoveTransformAction(ev, size, setSize, offset, setOffset, zoom, params);
    case "rotate":
      return new RotateTransformAction(ev, size, setSize, offset, setOffset, zoom, params);
    case "n-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "n"});
    case "s-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "s"});
    case "e-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "e"});
    case "w-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "w"});
    case "ne-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "ne"});
    case "se-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "se"});
    case "sw-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "sw"});
    case "nw-resize":
      return new ResizeTransformAction(ev, size, setSize, offset, setOffset, zoom, {...params, direction: "nw"});
    default:
      break;
  }
}