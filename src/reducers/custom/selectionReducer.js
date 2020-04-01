import {
  line,
  quadratic,
} from "../../actions/custom/ctxActions.js";

import { midpoint } from "../../utils/helpers";

export default function(path, { action, params }) {
  if (path === null) return path;
  path.moveTo(params.orig.x, params.orig.y);

  switch (action) {
    case "drawLinePath":
      line(path, params);
      return path;

    case "drawQuadPath":
      quadratic(path, params);
      path.closePath();
      return path;

    case "drawRect":
      path.rect(
        params.orig.x,
        params.orig.y,
        params.dest.x - params.orig.x,
        params.dest.y - params.orig.y
      );
      return path;

    case "drawEllipse":
      const center = midpoint(params.orig, params.dest);
      const radiusX = Math.abs(params.dest.x - center.x);
      const radiusY = Math.abs(params.dest.y - center.y);
      path.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
      return path;

    default:
      return "error: invalid path action";
  }
}
