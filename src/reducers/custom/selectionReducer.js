import {
  line,
  quadratic,
  bezier,
  // rectangle,
  // circle,
  ellipse
} from "../../actions/custom/ctxActions.js";

import { midpoint } from "../../utils/helpers";

export default function(path, { action, params }) {
  if (path === null) return path;
  path.moveTo(params.orig[0], params.orig[1]);

  switch (action) {
    case "drawLinePath":
      line(path, params);
      return path;

    case "drawQuadPath":
      quadratic(path, params);
      path.closePath();
      return path;

    case "drawBezierPath":
      bezier(path, params);
      return path;

    case "drawRect":
      path.rect(
        params.orig[0],
        params.orig[1],
        params.dest[0] - params.orig[0],
        params.dest[1] - params.orig[1]
      );
      return path;

    case "drawEllipse":
      const center = midpoint(params.orig, params.dest);
      const radiusX = Math.abs(params.dest[0] - center[0]);
      const radiusY = Math.abs(params.dest[1] - center[1]);
      path.ellipse(center[0], center[1], radiusX, radiusY, 0, 0, Math.PI * 2);
      return path;

    default:
      return "error: invalid path action";
  }
}
