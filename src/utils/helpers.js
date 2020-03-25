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
  return [
    orig[0] + (dest[0] - orig[0]) / 2,
    orig[1] + (dest[1] - orig[1]) / 2
  ];
}

export function getQuadLength(p1, p2, p3) {
  const distA = Math.sqrt(
    Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[0] - p2[0], 2)
  );
  const distB = Math.sqrt(
    Math.pow(p2[1] - p3[1], 2) + Math.pow(p2[0] - p3[0], 2)
  );
  return distA + distB;
}

export function getGradient(color, opacity, hardness) {          
  const colorStep1 = color.substring(0, color.lastIndexOf(",") + 1) + ` ${(opacity / 100) * .66})`
  const colorStep2 = color.substring(0, color.lastIndexOf(",") + 1) + ` ${(opacity / 100) * .33})`
  const colorStep3 = color.substring(0, color.lastIndexOf(",") + 1) + ` 0)`

  return [
    [0 + hardness * .01, color],
    [.25 + hardness * .0075, colorStep1],
    [.5 + hardness * .005, colorStep2],
    [1, colorStep3]
  ];
}

export function convertDestToRegularShape([origX, origY], [x, y]) {
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
  return [x, y]
}
