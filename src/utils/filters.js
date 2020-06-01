import {getQuadEquation} from "../utils/helpers";

class Filter {
  constructor(name, inputInfo, applyFunct) {
    this.name = name;
    this.inputInfo = inputInfo;
    this.apply = applyFunct;
  }
}

const amount = {
  name: "Amount",
  type: "Number",
  init: 0,
  min: -100,
  max: 100
}

const size = {
  name: "Size",
  type: "Number",
  init: 1,
  min: 0,
  max: 10
}

const range = {
  name: "",
  type: "Radio",
  init: "Midtones",
  options: ["Shadows", "Midtones", "Highlights"]
}

function convolve(data, width, matrix, offset=0, divisor) {
  if (!divisor) {
    divisor = 0;
    matrix.forEach(a => a.forEach(b => divisor+=b));
  }
  const dataCopy = new Uint8ClampedArray(data);
  for (let i=0; i<data.length; i+=4) {
    if (dataCopy[i+3] === 0) continue;
    for (let j=i; j<=i+2; j++) {
      const dataMatrix = getMatrixAt(dataCopy, width, j, matrix.length);
      let result = 0;
      dataMatrix.forEach((row, rowIndex) => {
        row.forEach((num, colIndex) => {
          result += num * matrix[rowIndex][colIndex]
        });
      });
      result /= divisor;
      result += offset;
      data[j] = result;
    }
  }
}

function getMatrixAt(data, width, index, matrixLength) {
  const matrix = new Array(matrixLength);
  const row = new Array(matrixLength);
  const originX = (index / 4) % width;
  for (let i = 0; i < matrixLength; i++) {
    matrix[i] = [...row];
    const y = i - (matrixLength - 1) / 2;
    for (let j = 0; j < matrixLength; j++) {
      const x = j - (matrixLength - 1) / 2;
      const newIndex = index + x * width * 4 + y * 4;
      if (
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

export const saturation = new Filter("Saturation", {amount}, (data, {amount}) => {
  amount /= -100;
  for (let i=0; i<data.length; i+=4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i] += max !== data[i] ? (max - data[i]) * amount : 0;
    data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * amount : 0;
    data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * amount : 0;
  }
});

export const blur = new Filter("Blur", {amount: {...amount, min:0}}, (data, {amount, width}) => {
  const matrix = getGaussianKernel(amount / 10);
  convolve(data, width, matrix);
});

export const boxBlur = new Filter("Box Blur", {size}, (data, {size, width}) => {
  let count = null, total = null;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    if (x === width - 1) {
      count = null;
      total = null;
    }
    if (data[i + 3] === 0) continue;
    if (x === 0 || count === null) {
      [count, total] = getAverage(x, i);
    } else {
      [count, total] = getAverageWithPrev(count, total, x, i);
    }
    data[i] = count[0] / total;
    data[i + 1] = count[1] / total;
    data[i + 2] = count[2] / total
    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
      break;
    }
  }
  
  function getAverage(x, i) {
    let count = [0, 0, 0], total = 0;
    for (let w = -size; w <= size; w++) {
      for (let v = -size; v <= size; v++) {
        const index = i + (v + w * width) * 4;
        if (
          data[index + 4] &&
          x + v >= 0 &&
          x + v < width
        ) {
          count[0] += data[index];
          count[1] += data[index + 1];
          count[2] += data[index + 2];
          total++;
        }
      }
    }
    return [count, total]
  }

  function getAverageWithPrev(count, total, x, i) {
    let leftIndex, rightIndex;
    if (x + size < width) {
      for (let w = -size; w <= size; w++) {
        if (!data[i + w * width + 4]) continue;
        leftIndex = i + (i - size + w * width) * 4;
        rightIndex = i + (i + size + w * width) * 4;
        count[0] -= data[leftIndex];
        count[0] += data[rightIndex];
        count[1] -= data[leftIndex + 1];
        count[1] += data[rightIndex + 1];
        count[2] -= data[leftIndex + 2];
        count[2] += data[rightIndex + 2];
      }
    } else {
      for (let w = -size; w <= size; w++) {
        if (!data[i + w * width + 4]) continue;
        count[0] -= data[leftIndex];
        count[1] -= data[leftIndex + 1];
        count[2] -= data[leftIndex + 2];
        total--;
      }
    }
    return [count, total]
  }
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
  convolve(data, width, matrix, 0, 1);
});

export const emboss = new Filter("Emboss", {}, (data, {width}) => {
  const matrix = [[-1, -1, 0], [-1, 0, 1], [0, 1, 1]];
  convolve(data, width, matrix, 128, 1);
});

export const dodge = new Filter("Dodge", {amount: {...amount, min:0}, range}, (data, {amount, range}) => {
  let equation;
  if (range === "Highlights") {
    equation = num => num + Math.pow(Math.E, num) - 1;
  } else if (range === "Midtones") {
    equation = num => num + 0.25 * Math.sin(num * Math.PI);
  } else if (range === "Shadows") {
    equation = num => num * .5 + .5;
  }
  if (!equation) return;

  for (let i=0; i<data.length; i+=4) {
    data[i] = equation(data[i]);
    data[i + 1] = equation(data[i + 1]);
    data[i + 2] = equation(data[i + 2]);
  }
});

export const burn = new Filter("Burn", {amount: {...amount, min:0}, range}, (data, {amount, range}) => {
  // let equation,
  //   p1 = {x: 0, y: 0},
  //   p2 = {x: 128, y: 128},
  //   p3 = {x: 255, y: 255};
  let min = 0, max = 255, equation;

  if (range === "Highlights") {
    min = 128;
    equation = x => x+2
  } else if (range === "Midtones") {
    const mid = {x: 128 + (amount * 1.28), y: 128 - (amount * 1.28)}
    equation = getQuadEquation({x: 0, y: 0}, mid, {x: 255, y: 255});
  } else if (range === "Shadows") {
    max = 128
    equation = x => (amount / 10 + 1) * x - (amount / 10) / 5;
  }

  console.log(equation)

  for (let i=0; i<data.length; i+=4) {
    const cmin = Math.min(data[i],data[i+1],data[i+2]),
      cmax = Math.max(data[i],data[i+1],data[i+2]),
      luma = (cmin + cmax) / 2;
    if (luma <= max && luma >= min) {
      data[i] = equation(data[i]);
      data[i + 1] = equation(data[i + 1]);
      data[i + 2] = equation(data[i + 2]);
    }
  }
});

export const filter = {
  invert,
  brightness,
  contrast,
  saturation,
  blur,
  boxBlur,
  sharpen,
  findEdges,
  emboss,
  dodge,
  burn
}