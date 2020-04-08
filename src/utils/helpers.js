import { zoomSteps } from "../enums/constants";

export function getZoomAmount(steps, zoomPct) {
  let amount;
  const firstLarger = zoomSteps.findIndex(el => el > zoomPct)
  if (steps < 0 && !zoomSteps[firstLarger]) {
    amount = zoomSteps[zoomSteps.length - 1 + steps]
  } else if (steps < 0) {
    amount = zoomSteps[firstLarger - 1 + steps] || zoomSteps[0]
  } else if (steps > 0 && !zoomSteps[firstLarger]) {
    amount = zoomSteps[zoomSteps.length - 1]
  } else {
    amount = zoomSteps[firstLarger - 1 + steps] || zoomSteps[zoomSteps.length - 1]
  }
  return amount
}

export function midpoint(orig, dest) {
  return {
    x: orig.x + (dest.x - orig.x) / 2,
    y: orig.y + (dest.y - orig.y) / 2
  };
}

export function getQuadLength(p1, p2, p3) {
  const distA = Math.sqrt(
    Math.pow(p1.y - p2.y, 2) + Math.pow(p1.x - p2.x, 2)
  );
  const distB = Math.sqrt(
    Math.pow(p2.y - p3.y, 2) + Math.pow(p2.x - p3.x, 2)
  );
  return distA + distB;
}

export function getGradient(color, hardness) {         
  const colorStep0 = color.substring(0, color.lastIndexOf(",") + 1) + ` 1`
  const colorStep1 = color.substring(0, color.lastIndexOf(",") + 1) + ` .25`
  const colorStep2 = color.substring(0, color.lastIndexOf(",") + 1) + ` .1`
  const colorStep3 = color.substring(0, color.lastIndexOf(",") + 1) + ` .05`
  const colorStep4 = color.substring(0, color.lastIndexOf(",") + 1) + ` .025`
  const colorStep5 = color.substring(0, color.lastIndexOf(",") + 1) + ` .001`
  const colorStep6 = color.substring(0, color.lastIndexOf(",") + 1) + ` 0)`

  return [
    [0 + hardness * .01, colorStep0],
    [.1 + hardness * .009, colorStep0],
    [.4 + hardness * .006, colorStep1],
    [.45 + hardness * .0055, colorStep2],
    [.49 + hardness * .0051, colorStep3],
    [.5 + hardness * .005, colorStep4],
    [.6 + hardness * .004, colorStep5],
    [1, colorStep6]
  ];
}

export function convertDestToRegularShape({x: origX, y: origY}, {x, y}) {
  const distX = x - origX;
  const distY = y - origY;
  const max = Math.max(Math.abs(distX), Math.abs(distY));
  if (distX > 0 && distY > 0) {
    x = origX + max;
    y = origY + max;
  } else if (distX < 0 && distY < 0) {
    x = origX - max;
    y = origY - max;
  } else if (distX < 0 && distY > 0) {
    x = origX - max;
    y = origY + max;
  } else if (distX > 0 && distY < 0) {
    x = origX + max;
    y = origY - max;
  }
  return {x, y}
}
