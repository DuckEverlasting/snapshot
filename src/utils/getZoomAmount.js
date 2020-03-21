import { zoomSteps } from "../enums/constants";

export default function getZoomAmount(steps, zoomPct) {
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
  console.log(amount)
  return amount
}