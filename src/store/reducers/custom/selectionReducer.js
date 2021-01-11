import {
  line,
  quadratic,
} from "../../actions/custom/ctxActions";

import { midpoint } from "../../../utils/helpers";

export default function(path, { action, params }) {
  if (path === null) return path;
  path.moveTo(Math.floor(params.orig.x), Math.floor(params.orig.y));

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
        Math.floor(params.orig.x),
        Math.floor(params.orig.y),
        Math.floor(params.dest.x) - Math.floor(params.orig.x),
        Math.floor(params.dest.y) - Math.floor(params.orig.y)
      );
      return path;

    case "drawEllipse":
      const center = midpoint(params.orig, params.dest);
      const radiusX = Math.abs(Math.floor(params.dest.x) - center.x);
      const radiusY = Math.abs(Math.floor(params.dest.y) - center.y);
      path.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
      return path;

    default:
      return "error: invalid path action";
  }
}
