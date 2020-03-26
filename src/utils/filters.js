export default function applyFilter(ctx, {filter, value, clip, staging}) {
  ctx.save();
  ctx.clip(clip);
  staging.drawImage(ctx.canvas, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  filter(imageData.data, value)
  staging.putImageData(imageData, 0, 0)
  ctx.drawImage(staging.canvas, 0, 0);
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  ctx.restore();
}

export function blur(data) {
  for (let i=0; i<data.length; i+=4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let a = data[i + 3];
  }
}

export function invert(data) {
  for (let i=0; i<data.length; i+=4) {
    data[i] = data[i] ^ 255;
    data[i + 1] = data[i + 1] ^ 255;
    data[i + 2] = data[i + 2] ^ 255;
  }
}

export function brightness(data, value) {
  if (value < -100) {value = -100};
  if (value > 100) {value = 100};
  for (let i=0; i<data.length; i+=4) {
    data[i] = data[i] + 255 * (value / 100);
    data[i + 1] = data[i + 1] + 255 * (value / 100);
    data[i + 2] = data[i + 2] + 255 * (value / 100);
  }
}

export function contrast(data, value) {
  if (value < -100) {value = -100};
  if (value > 100) {value = 100};
  const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i=0; i<data.length; i+=4) {
    data[i] = factor * (data[i] - 128.0) + 128.0;
    data[i + 1] = factor * (data[i + 1] - 128.0) + 128.0;
    data[i + 2] = factor * (data[i + 2] - 128.0) + 128.0;
  }
}

export function saturation(data, value) {
  value /= -100
  for (let i=0; i<data.length; i+=4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i] += max !== data[i] ? (max - data[i]) * value : 0;
    data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * value : 0;
    data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * value : 0;
  }
};
