import {
  line,
  quadratic,
  bezier,
  rectangle,
  circle
} from '../../actions/custom/ctxActions.js'

export default function({ action, params }) {
  const { path } = params;
  if (path === null) return path;
  path.moveTo(params.orig[0], params.orig[1]);

  switch (action) {  
    case "drawLinePath":
      line(path, params);
      return path;
    
    case "drawQuadPath":
      quadratic(path, params);
      return path;
    
    case "drawBezierPath":
      bezier(path, params);
      return path;
    
    case "drawRect":
      path.rect(params.orig[0], params.orig[1], (params.dest[0] - params.orig[0]), (params.dest[1] - params.orig[1]))
      return path;
    
    case "drawCirc":
      circle(path, params);
      return path;
    
    default:
      return "error: invalid path action";
  }
}