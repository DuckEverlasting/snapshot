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

export function parseRgba(rgba) {
  // find dec values
  const redStart = rgba.indexOf("(") + 1,
    greenStart = rgba.indexOf(",") + 1,
    blueStart = rgba.indexOf(",", greenStart) + 1,
    alphaStart = rgba.indexOf(",", blueStart) + 1,
    alphaEnd = rgba.indexOf(")");

  // extract dec values for RGB and opacity
  const r = rgba.substring(redStart, greenStart - 1),
    g = rgba.substring(greenStart, blueStart - 1),
    b = rgba.substring(blueStart, alphaStart - 1),
    a = rgba.substring(alphaStart + 1, alphaEnd);
  return {r, g, b, a}
}

export function toHexFromRgba(rgba) {
  const {r, g, b, a} = parseRgba(rgba);
  
  // convert RGB to hex values
  let redHex = Number(r).toString(16).toLowerCase(),
    greenHex = Number(g).toString(16).toLowerCase(),
    blueHex = Number(b).toString(16).toLowerCase();
  
  // convert single digit hex values
  if (redHex.length === 1) redHex = "0" + redHex;
  if (greenHex.length === 1) greenHex = "0" + greenHex;
  if (blueHex.length === 1) blueHex = "0" + blueHex;
    
  // stitch it all together, return hex and opacity
  // NOTE THAT THIS RETURNS AN OBJECT, NOT A STRING
  return { hex: `#${redHex}${greenHex}${blueHex}`, opacity: a }
}

export function addOpacity(rgba, opacity) {
  // find opacity values
  const alphaStart = rgba.lastIndexOf(",")

  // get substring
  const rgb = rgba.substring(0, alphaStart)
    
  // stitch it all together with opacity
  return `${rgb}, ${opacity})`
}

export function toArrayFromRgba(rgba, opacity=1) {
  const redStart = rgba.indexOf("(") + 1,
    greenStart = rgba.indexOf(",") + 1,
    blueStart = rgba.indexOf(",", greenStart) + 1,
    alphaStart = rgba.indexOf(",", blueStart) + 1;

  const redDec = rgba.substring(redStart, greenStart - 1),
    greenDec = rgba.substring(greenStart, blueStart - 1),
    blueDec = rgba.substring(blueStart, alphaStart - 1)

  opacity = Math.floor(Number(opacity * 255));
  
  return [Number(redDec), Number(greenDec), Number(blueDec), opacity]
}

export function toHslFromRgb(r, g, b) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
    cmax = Math.max(r,g,b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  // Calculate hue
  if (delta === 0)
    h = 0;
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  else if (cmax === g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
  h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return {h, s, l};
}

export function getHue(r, g, b) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
    cmax = Math.max(r,g,b),
    delta = cmax - cmin,
    h = 0;

  // Calculate hue
  if (delta === 0)
    h = 0;
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  else if (cmax === g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
  h += 360;

  return h;
}

function toRgbFromHsl(h,s,l) {
  // Must be fractions of 1
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    m = l - c/2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x;
  } else if (60 <= h && h < 120) {
    r = x; g = c;
  } else if (120 <= h && h < 180) {
    g = c; b = x;
  } else if (180 <= h && h < 240) {
    g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; b = c;
  } else if (300 <= h && h < 360) {
    r = c; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return {r, g, b};
}