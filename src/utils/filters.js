import { getQuadEquation } from "../utils/helpers";
import { toHslFromRgb, toRgbFromHsl } from "../utils/colorConversion";

class Filter {
  constructor(name, inputInfo, applyFunct, delay=5) {
    this.name = name;
    this.inputInfo = inputInfo;
    this.apply = applyFunct;
    this.delay = delay;
  }
}

const amount = {
  name: "Amount",
  type: "Number",
  init: 0,
  min: -100,
  max: 100,
  required: true
}

const size = {
  name: "Size",
  type: "Number",
  init: 1,
  min: 0,
  max: 10,
  required: true
}

const angle = {
  name: "Angle",
  type: "Number",
  init: 0,
  min: 0,
  max: 360,
  required: true
}

const range = {
  name: "",
  type: "Radio",
  init: "Midtones",
  options: ["Shadows", "Midtones", "Highlights"],
  required: true
}

const mono = {
  name: "Monochrome",
  type: "Checkbox",
  init: false,
  required: false
}

const levels = {
  name: "Levels",
  type: "Number",
  init: 6,
  min: 2,
  max: 255,
  required: true
}

function convolve(data, width, matrix, offset=0, opacity=false, divisor) {
  if (!divisor) {
    divisor = 0;
    matrix.forEach(a => a.forEach(b => divisor+=b));
  }

  function getConvolutionValue(index, checkOpacity, rgb) {
    const dataMatrix = getMatrixAt(dataCopy, width, index, matrix.length, checkOpacity, rgb);
    let currDivisor = divisor;
    let result = 0;
    dataMatrix.forEach((row, rowIndex) => {
      row.forEach((num, colIndex) => {
        if (!checkOpacity || !!num) {
          result += num * matrix[rowIndex][colIndex]
        }
      });
    });
    if (checkOpacity) {
      currDivisor = 0;
      matrix.forEach((a, i) => a.forEach((b, j) => currDivisor += (dataMatrix[i][j] === null ? 0 : b)));
    }
    return result / currDivisor + offset;
  }

  const dataCopy = new Uint8ClampedArray(data);
  for (let i=0; i<data.length; i+=4) {
    if (opacity) {
      const opacityStart = data[i+3];
      data[i+3] = getConvolutionValue(i+3);
      if (data[i+3] && data[i+3] !== opacityStart) {
        for (let j=0; j<=2; j++) {
          data[j+i] = getConvolutionValue(j+i, true, j);
        }
      } else if (data[i+3]) {
        for (let j=0; j<=2; j++) {
          data[j+i] = getConvolutionValue(j+i);
        }
      }
    } else {
      for (let j=i; j<=i+2; j++) {
        data[j] = getConvolutionValue(j);
      }
    }
  }
}

function getMotionBlurArray(size, angle) {
  let a, b, result = []
  let slope = Math.tan(angle*Math.PI/180);
  if (slope < 1 && slope > -1) {
    a = "x";
    b = "y"
  } else {
    a = "y";
    b = "x";
    slope = 1 / slope;
  }
  
  for (let i=1; i<=size; i++) {
    const delta1 = {}, delta2 = {};
    delta1[a] = i;
    delta1[b] = Math.round(i * slope);
    delta2[a] = -i;
    delta2[b] = -Math.round(i * slope);
    result.push(delta1, delta2);
  }
  return result;
}

/**
 * Adds a horizontal or vertical motion blur to an array of pixel data.
 * 
 * @param {Uint8ClampedArray} data 
 * @param {number} size - In this case size refers to the radius of the blur.
 * @param {number} width 
 * @param {"horizontal" | "vertical"} type 
 */
function motionBlurPerpendicular(data, size, width, type) {
  const dataCopy = new Uint8ClampedArray(data),
    lineCount = type === "horizontal" ? data.length / (width*4) : width,
    lineLength = type === "horizontal" ? width : data.length / (width*4),
    increment = type === "horizontal" ? 1 : width;

  for (let lineIndex=0; lineIndex<lineCount; lineIndex++) {
    let current = 0,
      currentIndex = type === "horizontal" ?
        lineIndex * width * 4 :
        lineIndex * 4,
      count = size + 1,
      total = [
        dataCopy[currentIndex],
        dataCopy[currentIndex + 1],
        dataCopy[currentIndex + 2],
        dataCopy[currentIndex + 3]
      ];

    // initialize "total" array
    for (let i=increment*4; i<=size*increment*4; i+=increment*4) {
      for (let j=0; j<4; j++) {
        total[j] += dataCopy[currentIndex + i + j] 
      }
    }

    // set data for first point
    total.forEach((num, i) => {
      data[currentIndex + i] = num / count;  
    });

    // use a sliding window to update rest of points in line
    while (current + 1 < lineLength) {
      current++;
      currentIndex += increment * 4;
      // these conditionals handle edge cases where the blur would go beyond the line
      if (current + size + 1 > lineLength) {
        count--;
      } else {
        for (let i=0; i<4; i++) {
          total[i] += dataCopy[currentIndex + i + size * increment * 4];
        }
      }
      if (current - size < 0) {
        count++;
      } else {
        for (let i=0; i<4; i++) {
          total[i] -= dataCopy[currentIndex + i - size * increment * 4];
        }
      }
      for (let i=0; i<4; i++) {
        data[currentIndex + i] = total[i] / count;
      }
    };
  };
}

function getMatrixAt(data, width, index, matrixLength, checkOpacity, rgb) {
  const matrix = new Array(matrixLength);
  const row = new Array(matrixLength);
  const originX = (index / 4) % width;
  for (let i = 0; i < matrixLength; i++) {
    matrix[i] = [...row];
    const y = i - (matrixLength - 1) / 2;
    for (let j = 0; j < matrixLength; j++) {
      const x = j - (matrixLength - 1) / 2;
      const newIndex = index + x * width * 4 + y * 4;
      if (checkOpacity && !data[newIndex+(3-rgb)]) {
        matrix[i][j] = null;
      } else if (
        data[newIndex] !== undefined &&
        originX + x >= 0 &&
        originX + x < width
      ) {
        matrix[i][j] = data[newIndex];
      } else {
        matrix[i][j] = data[index];
      }
    }
  }
  return matrix;
}

function getGaussianKernel(radius) {
  const sigma = radius / 2;
  const size = (Math.ceil(radius) * 2) + 1;
  const a = (1 / (2 * Math.PI * sigma * sigma));
  function gaussian(x2PlusY2) {
    return a * Math.pow(Math.E, -(x2PlusY2) / (2 * sigma * sigma));
  }
  const result = new Array(size);
  const row = new Array(size);
  const solutions = {};
  for (let i=0; i<size; i++) {
    const y = i - (size - 1) / 2;
    result[i] = [...row];
    for (let j=0; j<size; j++) {
      const x = j - (size - 1) / 2;
      let key = x*x + y*y;
      result[i][j] = solutions[key] || gaussian(key);
    }
  }
  return result;
}

export const motionBlur = new Filter("Motion Blur", {size: {...size, max: 100}, angle}, (data, {size, angle, width}) => {
  if (size <= 0) {return;}
  angle = angle % 180;
  if (angle === 0) {
    motionBlurPerpendicular(data, size, width, "horizontal");
    return;
  } else if (angle === 90) {
    motionBlurPerpendicular(data, size, width, "vertical");
    return;
  }
  const dataCopy = new Uint8ClampedArray(data),
    weighted = getMotionBlurArray(size, angle),
    numOfRows = data.length / (width*4);
  for (let row=0; row<numOfRows; row++) {
    for (let col=0; col<width; col++) {
      const index = (row * width + col) * 4;
      let count = 1,
        total = [
          dataCopy[index],
          dataCopy[index + 1],
          dataCopy[index + 2],
          dataCopy[index + 3]
        ];
      weighted.forEach(delta => {
        if (
          col + delta.x >= 0 &&
          col + delta.x < width &&
          row + delta.y >= 0 &&
          row + delta.y < numOfRows
        ) {
          const deltaIndex = ((row + delta.y) * width + (col + delta.x)) * 4;
          count++;
          total[0] += dataCopy[deltaIndex];
          total[1] += dataCopy[deltaIndex + 1];
          total[2] += dataCopy[deltaIndex + 2];
          total[3] += dataCopy[deltaIndex + 3];
        }
      })
      data[index] = total[0] / count;
      data[index + 1] = total[1] / count;
      data[index + 2] = total[2] / count;
      data[index + 3] = total[3] / count;
    }
  }
});

export const invert = new Filter("Invert", null, data => {
  for (let i=0; i<data.length; i+=4) {
    data[i] = data[i] ^ 255;
    data[i + 1] = data[i + 1] ^ 255;
    data[i + 2] = data[i + 2] ^ 255;
  }
});

export const brightness = new Filter("Brightness", {amount}, (data, {amount}) => {
  if (amount < -100) {amount = -100};
  if (amount > 100) {amount = 100};
  for (let i=0; i<data.length; i+=4) {
    data[i] = data[i] + 255 * (amount / 100);
    data[i + 1] = data[i + 1] + 255 * (amount / 100);
    data[i + 2] = data[i + 2] + 255 * (amount / 100);
  }
});

export const contrast = new Filter("Contrast", {amount}, (data, {amount}) => {
  if (amount < -100) {amount = -100};
  if (amount > 100) {amount = 100};
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    for (let i=0; i<data.length; i+=4) {
    data[i] = factor * (data[i] - 128.0) + 128.0;
    data[i + 1] = factor * (data[i + 1] - 128.0) + 128.0;
    data[i + 2] = factor * (data[i + 2] - 128.0) + 128.0;
  }
});

export const hue = new Filter("Hue", {amount: {...amount, min: -180, max: 180}}, (data, {amount}) => {
  for (let i=0; i<data.length; i+=4) {
    const {h, s, l} = toHslFromRgb(data[i], data[i + 1], data[i + 2]);
    const {r, g, b} = toRgbFromHsl(h + amount, s, l);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
})

export const saturation = new Filter("Saturation", {amount}, (data, {amount}) => {
  amount /= -100;
  for (let i=0; i<data.length; i+=4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i] += max !== data[i] ? (max - data[i]) * amount : 0;
    data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * amount : 0;
    data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * amount : 0;
  }
});

export const posterize = new Filter("Posturize", {levels}, (data, {levels}) => {
  const interval = 255 / (levels - 1);
  for (let i=0; i<data.length; i+=4) {
    if (data[i + 3] === 0) continue;
    for (let j=0; j<3; j++) {
      const remainder = data[i + j] % interval;
      data[i + j] = remainder < interval - remainder ? Math.floor(data[i + j] - remainder) : Math.floor(data[i + j] + interval - remainder);
    }
  }
});

export const blur = new Filter("Blur", {amount: {...amount, min:0}}, (data, {amount, width}) => {
  const matrix = getGaussianKernel(amount / 10);
  convolve(data, width, matrix, 0, true);
}, 500);

export const boxBlur = new Filter("Box Blur", {size: {...size, max: 100}}, (data, {size, width}) => {
  motionBlurPerpendicular(data, size, width, "horizontal");
  motionBlurPerpendicular(data, size, width, "vertical");
});

export const sharpen = new Filter("Sharpen", {amount: {...amount, min:0}}, (data, {amount, width}) => {
  const strength = amount / 100;
  const a = -1 * strength, b = -8 * a + 1;
  const matrix = [[a, a, a], [a, b, a], [a, a, a]];
  convolve(data, width, matrix);
});

export const findEdges = new Filter("Find Edges", {amount: {...amount, min:0}}, (data, {amount, width}) => {
  const strength = amount / 100;
  const a = -1 * strength, b = -8 * a;
  const matrix = [[a, a, a], [a, b, a], [a, a, a]];
  convolve(data, width, matrix, 0, false, 1);
});

export const emboss = new Filter("Emboss", {amount: {...amount, min:0, init: 10}, mono}, (data, {amount, mono, width}) => {
  if (mono) saturation.apply(data, {amount: -100});
  const a = amount / 10;
  const matrix = [[-a, -a, 0], [-a, 0, a], [0, a, a]];
  convolve(data, width, matrix, 128, false, 1);
});

export const dodge = new Filter("Dodge", {amount: {...amount, min:0}, range}, (data, {amount, range}) => {
  let equation = x => x;

  if (range === "Highlights") {
    equation = x => (1 + amount / 200) * x;
  } else if (range === "Midtones") {
    const mid = {x: 128 - (amount * .32), y: 128 + (amount * .32)}
    equation = getQuadEquation({x: 0, y: 0}, mid, {x: 255, y: 255});
  } else if (range === "Shadows") {
    equation = x => (1 - amount / 300) * x + (amount * .85);
  }

  for (let i=0; i<data.length; i+=4) {
      data[i] = equation(data[i]);
      data[i + 1] = equation(data[i + 1]);
      data[i + 2] = equation(data[i + 2]);
  }
});

export const burn = new Filter("Burn", {amount: {...amount, min:1}, range}, (data, {amount, range}) => {
  let equation;

  if (range === "Highlights") {
    equation = x => (1 - amount / 300) * x;
  } else if (range === "Midtones") {
    const mid = {x: 128 + (amount * .32), y: 128 - (amount * .32)}
    equation = getQuadEquation({x: 0, y: 0}, mid, {x: 255, y: 255});
  } else if (range === "Shadows") {
    equation = x => (1 + amount / 200) * x - (amount * 1.28);
  }

  for (let i=0; i<data.length; i+=4) {
      data[i] = equation(data[i]);
      data[i + 1] = equation(data[i + 1]);
      data[i + 2] = equation(data[i + 2]);
  }
});

export const brightnessContrast = new Filter(
  "Brightness / Contrast",
  {brightness: {...amount, name: "Brightness"}, contrast: {...amount, name: "Contrast"}},
  (data, {brightness: brightnessAmount , contrast: contrastAmount}) => {
    brightness.apply(data, {amount: brightnessAmount});
    contrast.apply(data, {amount: contrastAmount});
  }
)

export const hueSaturation = new Filter(
  "Hue / Saturation",
  {hue: {...amount, name: "Hue", min: -180, max: 180}, saturation: {...amount, name: "Saturation"}, brightness: {...amount, name: "Brightness"}},
  (data, {hue: hueAmount , saturation: saturationAmount, brightness: brightnessAmount}) => {
    for (let i=0; i<data.length; i+=4) {
      let {h, s, l} = toHslFromRgb(data[i], data[i + 1], data[i + 2]);
      h = (h + hueAmount + 360) % 360;
      if (saturationAmount > 0) {
        s += (100 - s) * saturationAmount / 100;
      } else {
        s += s * saturationAmount / 100;
      }
      if (brightnessAmount > 0) {
        l += (100 - l) * brightnessAmount / 100;
      } else {
        l += l * brightnessAmount / 100;
      }
      const {r, g, b} = toRgbFromHsl(h, s, l);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }, 50
)

export const filter = {
  invert,
  brightness,
  contrast,
  saturation,
  blur,
  motionBlur,
  boxBlur,
  sharpen,
  findEdges,
  emboss,
  dodge,
  burn,
  posterize,
  brightnessContrast,
  hueSaturation
}
