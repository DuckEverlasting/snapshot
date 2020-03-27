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
  amount /= -100
  for (let i=0; i<data.length; i+=4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i] += max !== data[i] ? (max - data[i]) * amount : 0;
    data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * amount : 0;
    data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * amount : 0;
  }
});

export const filter = {
  invert,
  brightness,
  contrast,
  saturation
};