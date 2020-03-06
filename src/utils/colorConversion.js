export function toRgbaFromHex(hex, opacity) {
  // remove # if it's there
  if (hex[0] === "#") hex = hex.slice(1)

  // extract hex values for RGB
  const redHex = hex.substring(0, 2),
    greenHex = hex.substring(2, 4),
    blueHex = hex.substring(4, 6);
  
  // convert RGB to decimal values
  const redDec = parseInt(redHex, 16),
    greenDec = parseInt(greenHex, 16),
    blueDec = parseInt(blueHex, 16);
    
  // stitch it all together with opacity
  return `rgba(${redDec}, ${greenDec}, ${blueDec}, ${opacity})`
}

export function toHexFromRgba(rgba) {
  // find dec values
  const redStart = rgba.indexOf("(") + 1,
    greenStart = rgba.indexOf(",") + 1,
    blueStart = rgba.indexOf(",", greenStart) + 1,
    alphaStart = rgba.indexOf(",", blueStart) + 1,
    alphaEnd = rgba.indexOf(")");

  // extract dec values for RGB and opacity
  const redDec = rgba.substring(redStart, greenStart - 1),
    greenDec = rgba.substring(greenStart, blueStart - 1),
    blueDec = rgba.substring(blueStart, alphaStart - 1),
    opacity = rgba.substring(alphaStart + 1, alphaEnd);
  
  // convert RGB to hex values
  let redHex = Number(redDec).toString(16).toLowerCase(),
    greenHex = Number(greenDec).toString(16).toLowerCase(),
    blueHex = Number(blueDec).toString(16).toLowerCase();
  
  // convert single digit hex values
  if (redHex.length === 1) redHex = "0" + redHex;
  if (greenHex.length === 1) greenHex = "0" + greenHex;
  if (blueHex.length === 1) blueHex = "0" + blueHex;
    
  // stitch it all together, return hex and opacity
  // NOTE THAT THIS RETURNS AN OBJECT, NOT A STRING
  return { hex: `#${redHex}${greenHex}${blueHex}`, opacity: opacity }
}

export function addOpacity(rgba, opacity) {
  // find opacity values
  const alphaStart = rgba.lastIndexOf(",")

  // get substring
  const rgb = rgba.substring(0, alphaStart)
    
  // stitch it all together with opacity
  return `${rgb}, ${opacity})`
}