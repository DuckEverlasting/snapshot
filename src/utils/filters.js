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
};

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
  console.log(matrix);
  convolve(data, width, matrix);
})

export const filter = {
  invert,
  brightness,
  contrast,
  saturation,
  blur
};